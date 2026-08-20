import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { AuthTokenPayload } from "../middlewares/auth.middleware";

export const ReporteService = {
    /**
     * Reporte: cantidad de citas COMPLETADAS agrupadas por profesional.
     */
    async citasPorProfesional(user: AuthTokenPayload) {
        if (user.rol === "ADMINISTRADOR") {
            return this.reportePorAdministrador();
        }

        if (user.rol === "PROFESIONAL") {
            return this.reportePorProfesional(user.id);
        }

        throw AppError.forbidden("No tiene permisos para ver este reporte");
    },

    async reportePorAdministrador() {
        const profesionales = await prisma.perfilProfesional.findMany({
            select: {
                id: true,
                tituloProfesional: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellidos: true,
                    },
                },
            },
        });

        // Conteo de citas COMPLETADAS por profesional
        const conteosCompletadas = await prisma.cita.groupBy({
            by: ["profesionalId"],
            where: { estado: "COMPLETADA" },
            _count: { _all: true },
        });

        // Conteo de TODAS las citas por profesional (independiente del estado)
        const conteosTotales = await prisma.cita.groupBy({
            by: ["profesionalId"],
            _count: { _all: true },
        });

        const completadasPorProfesional = new Map<number, number>(
            conteosCompletadas.map((c) => [c.profesionalId, c._count._all])
        );

        const totalesPorProfesional = new Map<number, number>(
            conteosTotales.map((c) => [c.profesionalId, c._count._all])
        );

        return profesionales.map((profesional) => {
            const citasCompletadas =
                completadasPorProfesional.get(profesional.id) ?? 0;
            const totalCitas = totalesPorProfesional.get(profesional.id) ?? 0;
            const porcentajeFinalizacion =
                totalCitas > 0
                    ? Math.round((citasCompletadas / totalCitas) * 100)
                    : 0;

            return {
                profesionalId: profesional.id,
                profesional: `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`,
                tituloProfesional: profesional.tituloProfesional,
                totalCitas,
                citasCompletadas,
                porcentajeFinalizacion,
            };
        });
    },

    async reportePorProfesional(usuarioId: number) {
        const perfil = await prisma.perfilProfesional.findUnique({
            where: { usuarioId },
            select: {
                id: true,
                tituloProfesional: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellidos: true,
                    },
                },
            },
        });

        if (!perfil) {
            throw AppError.notFound(
                "No se encontró un perfil profesional asociado a este usuario"
            );
        }

        const citasCompletadas = await prisma.cita.count({
            where: {
                profesionalId: perfil.id,
                estado: "COMPLETADA",
            },
        });

        const totalCitas = await prisma.cita.count({
            where: { profesionalId: perfil.id },
        });

        const porcentajeFinalizacion =
            totalCitas > 0
                ? Math.round((citasCompletadas / totalCitas) * 100)
                : 0;

        return [
            {
                profesionalId: perfil.id,
                profesional: `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`,
                tituloProfesional: perfil.tituloProfesional,
                totalCitas,
                citasCompletadas,
                porcentajeFinalizacion,
            },
        ];
    },

    async citasPorEstado() {
        const [data] = await Promise.all([
            prisma.cita.findMany({
                select: {
                    id: true,
                    fechaCitaSolicitada: true,
                    estado: true,
                    montoCalculado: true,
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
                            categoria: {
                                select: {
                                    nombre: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { fechaCreacion: "desc" }
            })
        ])
        return {
            data
        };
    },

    async calificaciones() {
        const profesionales = await prisma.perfilProfesional.findMany({
            select: {
                id: true,
                tituloProfesional: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellidos: true,
                    },
                },
            },
        });

        // Promedio y conteo de reseñas agrupadas por profesional
        const resenas = await prisma.resena.groupBy({
            by: ["profesionalId"],
            _avg: { puntuacion: true },
            _count: { _all: true },
        });

        const resenasPorProfesional = new Map(
            resenas.map((r) => [
                r.profesionalId,
                {
                    promedio: r._avg.puntuacion ?? 0,
                    cantidad: r._count._all,
                },
            ])
        );

        const data = profesionales.map((profesional) => {
            const stats = resenasPorProfesional.get(profesional.id);

            return {
                profesionalId: profesional.id,
                profesional: `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`,
                tituloProfesional: profesional.tituloProfesional,
                promedioCalificacion: stats
                    ? Math.round(stats.promedio * 10) / 10  // redondea a 1 decimal
                    : 0,
                cantidadResenas: stats?.cantidad ?? 0,
            };
        });

        return { data };
    },
};