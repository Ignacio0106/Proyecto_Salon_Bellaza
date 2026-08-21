import { prisma } from "../config/prisma";
import { CreateCitaDto } from "../dtos/cita.dto";
import { AppError } from "../utils/app-error";

// Roles que pueden solicitar la cancelación de una cita
type RolSolicitante = "ADMINISTRADOR" | "PROFESIONAL" | "CLIENTE";

// Estados desde los que una cita se puede cancelar (regla de cancelación)
const ESTADOS_CANCELABLES = ["PENDIENTE", "ACEPTADA"] as const;

// Estados que exigen un motivo al cambiar (rechazo o cancelación)
const ESTADOS_CON_MOTIVO = ["RECHAZADA", "CANCELADA"] as const;

// Transiciones de estado permitidas según el estado actual de la cita.
// Ej: una cita PENDIENTE solo puede ser Aceptada, Rechazada o Cancelada;
// una cita ACEPTADA solo puede Completarse o Cancelarse.
const TRANSICIONES_VALIDAS: Record<string, string[]> = {
    PENDIENTE: ["ACEPTADA", "RECHAZADA", "CANCELADA"],
    ACEPTADA: ["COMPLETADA", "CANCELADA"],
    RECHAZADA: [],
    CANCELADA: [],
    COMPLETADA: [],
};

export const CitaService = {
    async listar() {
        const citas = await prisma.cita.findMany({
            select: {
                id: true,
                fechaCitaSolicitada: true,
                horaInicio: true,
                horaFinalizacion: true,
                estado: true,

                clienteId: true,
                profesionalId: true,

                cliente: {
                    select: {
                        nombre: true,
                        apellidos: true,
                    },
                },

                profesional: {
                    select: {
                        usuario: {
                            select: {
                                nombre: true,
                                apellidos: true,
                            },
                        },
                    },
                },

                servicio: {
                    select: {
                        nombre: true,
                    },
                },

                // Se usa para saber si el cliente ya calificó una cita
                // completada (historial cronológico del Cliente)
                resena: {
                    select: { id: true },
                },
            },
        });

        return citas.map((cita) => ({
            id: cita.id,
            clienteId: cita.clienteId,
            profesionalId: cita.profesionalId,
            cliente: `${cita.cliente.nombre} ${cita.cliente.apellidos}`,
            profesional: `${cita.profesional.usuario.nombre} ${cita.profesional.usuario.apellidos}`,
            servicio: cita.servicio.nombre,
            fecha: cita.fechaCitaSolicitada,
            hora: cita.horaInicio,
            // Se agrega la hora de finalización para pintar correctamente
            // el rango del evento en la Agenda Visual (FullCalendar)
            horaFin: cita.horaFinalizacion,
            estado: cita.estado,
            tieneResena: cita.resena !== null,
        }));
    },

    async obtenerPorId(id: number) {
        const cita = await prisma.cita.findUnique({
            where: { id },
            select: {
                id: true,
                fechaCitaSolicitada: true,
                horaInicio: true,
                horaFinalizacion: true,
                modalidad: true,
                comentarioNecesidad: true,
                comentarioProfesional: true,
                estado: true,
                montoCalculado: true,

                cliente: {
                    select: {
                        nombre: true,
                        apellidos: true,
                        correo: true,
                        telefono: true,
                    },
                },

                profesional: {
                    select: {
                        usuario: {
                            select: {
                                nombre: true,
                                apellidos: true,
                                correo: true,
                                telefono: true,
                            },
                        },
                        tituloProfesional: true,
                    },
                },

                servicio: {
                    select: {
                        nombre: true,
                        descripcion: true,
                        precio: true,
                    },
                },

                // Reseña que el Cliente dejó para esta cita (se muestra
                // en el detalle junto con la puntuación y el comentario)
                resena: {
                    select: {
                        id: true,
                        puntuacion: true,
                        comentario: true,
                        fechaResena: true,
                    },
                },

                // Historial de estados: motivo de cancelación/rechazo e
                // historial completo que se muestra en la vista detalle
                historialEstados: {
                    select: {
                        estadoAnterior: true,
                        estadoNuevo: true,
                        fechaCambio: true,
                        comentario: true,
                        realizadoPor: {
                            select: { nombre: true, apellidos: true },
                        },
                    },
                    orderBy: { id: 'desc' },
                },
            },
        });

        if (!cita) {
            return null;
        }

        return {
            cliente: {
                nombreCompleto: `${cita.cliente.nombre} ${cita.cliente.apellidos}`,
                correo: cita.cliente.correo,
                telefono: cita.cliente.telefono,
            },

            profesional: {
                nombreCompleto: `${cita.profesional.usuario.nombre} ${cita.profesional.usuario.apellidos}`,
                correo: cita.profesional.usuario.correo,
                telefono: cita.profesional.usuario.telefono,
                tituloProfesional:
                    cita.profesional.tituloProfesional,
            },

            servicio: {
                nombre: cita.servicio.nombre,
                descripcion: cita.servicio.descripcion,
                precio: cita.servicio.precio,
            },

            fecha: cita.fechaCitaSolicitada,
            horaInicio: cita.horaInicio,
            horaFinalizacion: cita.horaFinalizacion,
            modalidad: cita.modalidad,

            descripcion: cita.comentarioNecesidad,

            comentarioProfesional:
                cita.comentarioProfesional,

            estado: cita.estado,

            montoCalculado: cita.montoCalculado,

            resena: cita.resena
                ? {
                    puntuacion: cita.resena.puntuacion,
                    comentario: cita.resena.comentario,
                    fechaResena: cita.resena.fechaResena,
                }
                : null,

            // Motivo registrado al cancelar o rechazar la cita
            // (se toma el cambio de estado más reciente con comentario)
            motivoCancelacion:
                cita.historialEstados.find(
                    (h) =>
                        h.estadoNuevo === "CANCELADA" ||
                        h.estadoNuevo === "RECHAZADA"
                )?.comentario ?? null,

            // Historial completo de cambios de estado de la cita
            historial: cita.historialEstados.map((h) => ({
                estadoAnterior: h.estadoAnterior,
                estadoNuevo: h.estadoNuevo,
                fechaCambio: h.fechaCambio,
                comentario: h.comentario,
                realizadoPor: `${h.realizadoPor.nombre} ${h.realizadoPor.apellidos}`,
            })),
        };
    },

    async validateCliente(clienteId: number) {
        const cliente = await prisma.usuario.findUnique({
            where: { id: clienteId },
        });

        if (!cliente) {
            throw AppError.badRequest(
                "El cliente indicado no existe"
            );
        }
    },

    async validateProfesional(profesionalId: number) {
        const profesional =
            await prisma.perfilProfesional.findUnique({
                where: { id: profesionalId },
            });

        if (!profesional) {
            throw AppError.badRequest(
                "El profesional indicado no existe"
            );
        }
    },

    async validateServicio(servicioId: number) {
        const servicio = await prisma.servicio.findUnique({
            where: { id: servicioId },
        });

        if (!servicio) {
            throw AppError.badRequest(
                "El servicio indicado no existe"
            );
        }
    },

    async validateServicioProfesional(
        servicioId: number,
        profesionalId: number
    ) {
        const servicio = await prisma.servicio.findUnique({
            where: { id: servicioId },
        });

        if (!servicio) {
            throw AppError.badRequest(
                "El servicio indicado no existe"
            );
        }

        if (servicio.profesionalId !== profesionalId) {
            throw AppError.badRequest(
                "El servicio no pertenece al profesional seleccionado"
            );
        }
    },
    async crear(data: CreateCitaDto) {
 const fechaSolicitada = new Date(data.fechaCitaSolicitada);

        if (Number.isNaN(fechaSolicitada.getTime())) {
            throw AppError.badRequest("La fecha de la cita no es válida");
        }

        const fechaBase = new Date(
            fechaSolicitada.getFullYear(),
            fechaSolicitada.getMonth(),
            fechaSolicitada.getDate()
        );

        // Regla de negocio: no se permiten citas en fechas pasadas a hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaBase < hoy) {
            throw AppError.badRequest(
                "No se puede agendar la cita en una fecha pasada a hoy"
            );
        }

        const horaInicio = this.combinarFechaYHora(
            fechaBase,
            data.horaInicio
        );

        const horaFinalizacion = this.combinarFechaYHora(
            fechaBase,
            data.horaFinalizacion
        );

        const citaCreada = await prisma.cita.create({
            data: {
                clienteId: data.clienteId,
                profesionalId: data.profesionalId,
                servicioId: data.servicioId,
                fechaCitaSolicitada: fechaBase,
                horaInicio,
                horaFinalizacion,
                modalidad: data.modalidad,
                comentarioNecesidad: data.comentarioNecesidad,
                montoCalculado: data.montoCalculado,
                estado: "PENDIENTE",
            },
            include: {
                cliente: true,
                profesional: {
                    include: {
                        usuario: true,
                    },
                },
                servicio: true,
            },
        });

        // Se notifica al profesional para que acepte, rechace o cancele
        await this.notificarNuevaSolicitud(citaCreada);

        return citaCreada;
    },

    // Notifica al profesional que tiene una nueva solicitud de cita pendiente
    async notificarNuevaSolicitud(
        cita: {
            id: number;
            fechaCitaSolicitada: Date;
            cliente: { nombre: string; apellidos: string };
            profesional: { usuarioId: number };
            servicio: { nombre: string };
        }
    ) {
        const fechaTexto = new Date(cita.fechaCitaSolicitada).toLocaleDateString("es-CR");

        await prisma.notificacion.create({
            data: {
                usuarioId: cita.profesional.usuarioId,
                citaId: cita.id,
                titulo: "Nueva solicitud de cita",
                mensaje: `${cita.cliente.nombre} ${cita.cliente.apellidos} solicitó una cita de ${cita.servicio.nombre} para el ${fechaTexto}. Debes aceptarla o rechazarla.`,
            },
        });
    },

    combinarFechaYHora(fechaBase: Date, hora: string) {
        const [horas, minutos] = hora.split(":").map(Number);

        if (
            Number.isNaN(horas) ||
            Number.isNaN(minutos)
        ) {
            throw AppError.badRequest("La hora de la cita no es válida");
        }

        const resultado = new Date(fechaBase);
        resultado.setHours(horas, minutos, 0, 0);

        return resultado;
    },
        
// Actualiza el estado de una cita (usado desde la Agenda Visual).
// Si el nuevo estado es RECHAZADA o CANCELADA se exige un motivo,
// se registra en el historial de estados y se notifica al cliente
// y al profesional.
    async editarEstado(
        id: number,
        estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA",
        solicitante: { id: number; rol: RolSolicitante },
        motivo?: string,
        comentario?: string
    ) {

        const citaExistente = await prisma.cita.findUnique({
            where: { id },
            include: {
                profesional: { select: { usuarioId: true } },
            },
        });

        if (!citaExistente) {
            throw AppError.notFound("La cita indicada no existe");
        }

        // Se valida que la transición de estado sea permitida
        const transicionesPermitidas =
            TRANSICIONES_VALIDAS[citaExistente.estado] ?? [];

        if (!transicionesPermitidas.includes(estado)) {
            throw AppError.conflict(
                `Una cita ${citaExistente.estado} solo puede pasar a: ${
                    transicionesPermitidas.length
                        ? transicionesPermitidas.join(", ")
                        : "ningún estado (es un estado final)"
                }`
            );
        }

        // Regla de negocio: una cita solo puede completarse después de su
        // fecha y hora programadas (nunca antes de que finalice la atención)
        if (estado === "COMPLETADA") {
            const ahora = new Date();

            if (ahora < citaExistente.horaFinalizacion) {
                throw AppError.badRequest(
                    "No se puede completar la cita porque su fecha y hora programadas aún no han llegado"
                );
            }
        }

        const requiereMotivo = (ESTADOS_CON_MOTIVO as readonly string[]).includes(estado);
        const motivoLimpio = motivo?.trim() ?? "";
        const comentarioLimpio = comentario?.trim() ?? "";

        if (requiereMotivo && motivoLimpio.length < 5) {
            throw AppError.badRequest(
                "Debes indicar el motivo (mínimo 5 caracteres)"
            );
        }

        // Comentario opcional registrado al aceptar (se guarda como
        // comentario del profesional y en el historial de estados)
        const comentarioAceptacion =
            estado === "ACEPTADA" && comentarioLimpio.length > 0
                ? comentarioLimpio
                : null;

        const citaActualizada = await prisma.$transaction(async (tx) => {
            const actualizada = await tx.cita.update({
                where: { id },
                data: {
                    estado,
                    ...(comentarioAceptacion
                        ? { comentarioProfesional: comentarioAceptacion }
                        : {}),
                },
                include: {
                    cliente: true,
                    profesional: { include: { usuario: true } },
                    servicio: true,
                },
            });

            await tx.historialEstadoCita.create({
                data: {
                    citaId: id,
                    estadoAnterior: citaExistente.estado,
                    estadoNuevo: estado,
                    comentario:
                        motivoLimpio || comentarioAceptacion || null,
                    realizadoPorId: solicitante.id,
                },
            });

            return actualizada;
        });

        if (estado === "ACEPTADA") {
            await this.notificarAceptacion(citaActualizada, solicitante.id);
        } else if (estado === "COMPLETADA") {
            await this.notificarCompletada(citaActualizada, solicitante.id);
        } else if (requiereMotivo) {
            await this.notificarRechazoOCancelacion(
                citaActualizada,
                estado as "RECHAZADA" | "CANCELADA",
                motivoLimpio,
                solicitante.id
            );
        }

        return citaActualizada;
    },

    // Notifica al cliente que su cita fue completada y puede calificarla
    async notificarCompletada(
        cita: {
            id: number;
            clienteId: number;
            fechaCitaSolicitada: Date;
            servicio: { nombre: string };
        },
        actorId: number
    ) {
        // El actor ya conoce el resultado, no se auto-notifica
        if (cita.clienteId === actorId) {
            return;
        }

        const fechaTexto = new Date(cita.fechaCitaSolicitada).toLocaleDateString("es-CR");

        await prisma.notificacion.create({
            data: {
                usuarioId: cita.clienteId,
                citaId: cita.id,
                titulo: "Cita completada",
                mensaje: `Tu cita de ${cita.servicio.nombre} del ${fechaTexto} fue completada. ¡No olvides calificar tu experiencia!`,
            },
        });
    },

    // Notifica al cliente que su cita fue aceptada por el profesional
    async notificarAceptacion(
        cita: {
            id: number;
            clienteId: number;
            fechaCitaSolicitada: Date;
            servicio: { nombre: string };
        },
        actorId: number
    ) {
        // El actor ya conoce el resultado, no se auto-notifica
        if (cita.clienteId === actorId) {
            return;
        }

        const fechaTexto = new Date(cita.fechaCitaSolicitada).toLocaleDateString("es-CR");

        await prisma.notificacion.create({
            data: {
                usuarioId: cita.clienteId,
                citaId: cita.id,
                titulo: "Cita aceptada",
                mensaje: `Tu cita de ${cita.servicio.nombre} del ${fechaTexto} fue aceptada por el profesional.`,
            },
        });
    },

    // Crea notificaciones para el cliente y el profesional de la cita
    // (se omite quien realizó la acción, que ya conoce el resultado).
    async notificarRechazoOCancelacion(
        cita: {
            id: number;
            clienteId: number;
            fechaCitaSolicitada: Date;
            profesional: { usuarioId: number };
            servicio: { nombre: string };
        },
        estado: "RECHAZADA" | "CANCELADA",
        motivo: string,
        actorId: number
    ) {
        const accion = estado === "CANCELADA" ? "cancelada" : "rechazada";
        const fechaTexto = new Date(cita.fechaCitaSolicitada).toLocaleDateString("es-CR");

        const destinatarios = [
            {
                usuarioId: cita.clienteId,
                titulo: `Cita ${accion}`,
                mensaje: `Tu cita de ${cita.servicio.nombre} del ${fechaTexto} fue ${accion}. Motivo: ${motivo}`,
            },
            {
                usuarioId: cita.profesional.usuarioId,
                titulo: `Cita ${accion}`,
                mensaje: `La cita de ${cita.servicio.nombre} del ${fechaTexto} fue ${accion}. Motivo: ${motivo}`,
            },
        ].filter((destinatario) => destinatario.usuarioId !== actorId);

        if (destinatarios.length > 0) {
            await prisma.notificacion.createMany({
                data: destinatarios.map((destinatario) => ({
                    ...destinatario,
                    citaId: cita.id,
                })),
            });
        }
    },

    // Cancela una cita desde "Mis Citas" del Cliente (o desde la gestión
    // del Profesional). Aplica la regla de cancelación, exige motivo y
    // deja registro en el historial de estados.
    async cancelar(
        id: number,
        motivo: string,
        solicitante: { id: number; rol: RolSolicitante }
    ) {
        const cita = await prisma.cita.findUnique({
            where: { id },
            include: {
                profesional: { select: { usuarioId: true } },
            },
        });

        if (!cita) {
            throw AppError.notFound("La cita indicada no existe");
        }

        const esDuenoCliente = cita.clienteId === solicitante.id;
        const esDuenoProfesional =
            cita.profesional.usuarioId === solicitante.id;
        const esAdmin = solicitante.rol === "ADMINISTRADOR";

        if (!esDuenoCliente && !esDuenoProfesional && !esAdmin) {
            throw AppError.forbidden(
                "No tiene permisos para cancelar esta cita"
            );
        }

        if (
            !ESTADOS_CANCELABLES.includes(
                cita.estado as (typeof ESTADOS_CANCELABLES)[number]
            )
        ) {
            throw AppError.conflict(
                "Solo se pueden cancelar citas en estado Pendiente o Aceptada"
            );
        }

        const estadoAnterior = cita.estado;

        const citaCancelada = await prisma.$transaction(async (tx) => {
            const actualizada = await tx.cita.update({
                where: { id },
                data: { estado: "CANCELADA" },
                include: {
                    cliente: true,
                    profesional: { include: { usuario: true } },
                    servicio: true,
                },
            });

            await tx.historialEstadoCita.create({
                data: {
                    citaId: id,
                    estadoAnterior,
                    estadoNuevo: "CANCELADA",
                    comentario: motivo,
                    realizadoPorId: solicitante.id,
                },
            });

            return actualizada;
        });

        await this.notificarRechazoOCancelacion(
            citaCancelada,
            "CANCELADA",
            motivo,
            solicitante.id
        );

        return citaCancelada;
    },
};