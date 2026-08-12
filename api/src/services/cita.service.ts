import { prisma } from "../config/prisma";
import { CreateCitaDto } from "../dtos/cita.dto";
import { AppError } from "../utils/app-error";

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

        const horaInicio = this.combinarFechaYHora(
            fechaBase,
            data.horaInicio
        );

        const horaFinalizacion = this.combinarFechaYHora(
            fechaBase,
            data.horaFinalizacion
        );

        return prisma.cita.create({
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
        
// Actualiza el estado de una cita (usado desde la Agenda Visual)
    async editarEstado(id: number, estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA") {
         
        const citaExistente = await prisma.cita.findUnique({
            where: { id },
        });

        if (!citaExistente) {
            throw AppError.notFound("La cita indicada no existe");
        }

        const citaActualizada = await prisma.cita.update({
            where: { id },
            data: { estado },
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

        return citaActualizada;
    },
};

