import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { AuthTokenPayload } from "../middlewares/auth.middleware";

// Los nombres de los estados deben coincidir con tu Enum de Prisma
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

        const conteos = await prisma.cita.groupBy({
            by: ["profesionalId"],
            where: { estado: "COMPLETADA" },
            _count: { _all: true },
        });

        const conteoPorProfesional = new Map<number, number>(
            conteos.map((conteo) => [
                conteo.profesionalId,
                conteo._count._all,
            ])
        );

        return profesionales.map((profesional) => ({
            profesionalId: profesional.id,
            profesional: `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`,
            tituloProfesional: profesional.tituloProfesional,
            citasCompletadas: conteoPorProfesional.get(profesional.id) ?? 0,
        }));
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

        return [
            {
                profesionalId: perfil.id,
                profesional: `${perfil.usuario.nombre} ${perfil.usuario.apellidos}`,
                tituloProfesional: perfil.tituloProfesional,
                citasCompletadas,
            },
        ];
    },
};