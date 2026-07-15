import { prisma } from "../config/prisma";

export const EspecialidadesService = {
    async listar() {
        const especialidad = await prisma.especialidad.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                estado: true,
            },
        });

        return especialidad.map((especial) => ({
            id: especial.id,
            nombre: especial.nombre,
            descripcion: especial.descripcion,
            estado: especial.estado,
        }));
    },

    async obtenerPorId(id: number) {
        return await prisma.especialidad.findUnique({
            where: { id }
        });
    },
        async alternarEstado(id: number) {
        const especialidadActual = await prisma.especialidad.findUnique({
            where: { id },
            select: { estado: true }
        });

        if (!especialidadActual) {
            throw new Error("Especialidad no encontrada");
        }

        const nuevoEstado = especialidadActual.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

        return await prisma.especialidad.update({
            where: { id },
            data: { estado: nuevoEstado },
            select: {
                id: true,
                nombre: true,
                estado: true,
            }
        });
    }
};