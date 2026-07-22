import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import { Rol } from "../../generated/prisma/enums";
import jwt, { SignOptions, Secret } from "jsonwebtoken"

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
    },
    async registrar(data: {
        correo: string;
        telefono: string;
        contrasena: string;
        nombre: string;
        apellidos: string;
        rol?: Rol;
    }) {
        const usuarioExists = await prisma.usuario.findUnique({
            where: { correo: data.correo }
        });
        if (usuarioExists) {
            throw new Error("El correo ya está registrado");
        }
        const hashedPassword = await bcrypt.hash(data.contrasena, 10);
        const usuario = await prisma.usuario.create({
            data: {
                correo: data.correo,
                contrasena: hashedPassword,
                nombre: data.nombre,
                apellidos: data.apellidos,
                rol: data.rol ?? Rol.CLIENTE,
                telefono: data.telefono,
            },
        });
        const { contrasena, ...usuarioWithoutPassword } = usuario;
        return usuarioWithoutPassword;
    },

    async login(data: { correo: string; contrasena: string }) {
        const usuario = await prisma.usuario.findUnique({
            where: { correo: data.correo }
        });
        if (!usuario) {
            throw new Error("Correo o contraseña incorrectos");
        }
        const isPasswordValid = await bcrypt.compare(data.contrasena, usuario.contrasena);

        if (!isPasswordValid) {
            throw new Error("Correo o contraseña incorrectos");
        }
        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
        };
        const secret: Secret = process.env.JWT_SECRET || "vj_utn_2026";
        const options: SignOptions = {
            expiresIn: "2h",
        };
        const token = jwt.sign(payload, secret, options);
        return {
            token
        };
    },
    async perfil(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
    });
    if (!usuario) {
        throw new Error("El usuario no existe");
    }
    const { contrasena, ...usuarioSinPassword } = usuario;

    return usuarioSinPassword;
},
};