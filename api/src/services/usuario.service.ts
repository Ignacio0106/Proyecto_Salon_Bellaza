import { prisma } from "../config/prisma";

export const UsuarioService = {
    async listar() {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                correo: true,
                rol: true,
                estado: true,
            },
        });

        return usuarios.map((usuario) => ({
            id: usuario.id, 
            nombreCompleto: `${usuario.nombre} ${usuario.apellidos}`,
            correo: usuario.correo,
            rol: usuario.rol,
            estado: usuario.estado,
        }));
    },

    async obtenerPorId(id: number) {
        return await prisma.usuario.findUnique({
            where: { id }
        });
    },

async alternarEstado(id: number) {
        const usuarioActual = await prisma.usuario.findUnique({
            where: { id },
            select: { estado: true }
        });

        if (!usuarioActual) {
            throw new Error("Usuario no encontrado");
        }

        const nuevoEstado = usuarioActual.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

        return await prisma.usuario.update({
            where: { id },
            data: { estado: nuevoEstado },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                correo: true,
                rol: true,
                estado: true
            }
        });
    }
};