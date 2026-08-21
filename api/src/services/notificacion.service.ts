import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

export const NotificacionService = {
    async listar(usuarioId: number) {
        const [notificaciones, noLeidas] = await Promise.all([
            prisma.notificacion.findMany({
                where: { usuarioId },
                orderBy: { fechaCreacion: "desc" },
                take: 30,
            }),
            prisma.notificacion.count({
                where: { usuarioId, leida: false },
            }),
        ]);

        return { notificaciones, noLeidas };
    },

    async marcarLeida(id: number, usuarioId: number) {
        const notificacion = await prisma.notificacion.findUnique({
            where: { id },
        });

        if (!notificacion) {
            throw AppError.notFound("La notificación indicada no existe");
        }

        if (notificacion.usuarioId !== usuarioId) {
            throw AppError.forbidden(
                "No tiene permisos sobre esta notificación"
            );
        }

        return prisma.notificacion.update({
            where: { id },
            data: { leida: true },
        });
    },

    async marcarTodasLeidas(usuarioId: number) {
        const resultado = await prisma.notificacion.updateMany({
            where: { usuarioId, leida: false },
            data: { leida: true },
        });

        return { actualizadas: resultado.count };
    },
};
