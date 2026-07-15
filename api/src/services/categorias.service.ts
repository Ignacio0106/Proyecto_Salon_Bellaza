import { prisma } from "../config/prisma";

export const CategoriaService = {
    async listar() {
        const categoriaServicio = await prisma.categoriaServicio.findMany({
            select: {
            id: true,
                nombre: true,
                estado: true,
            },
        });

        return categoriaServicio.map((categoria) => ({
            id: categoria.id,
            nombre: categoria.nombre,
            estado: categoria.estado,
        }));
    },

    async obtenerPorId(id: number) {
        return await prisma.categoriaServicio.findUnique({
            where: { id }
        });
    },

    async alternarEstado(id: number) {
        const categoriaActual = await prisma.categoriaServicio.findUnique({
            where: { id },
            select: { estado: true }
        });

        if (!categoriaActual) {
            throw new Error("Categoría no encontrada");
        }

        const nuevoEstado = categoriaActual.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

        return await prisma.categoriaServicio.update({
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