import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import { CreateProfesionalDto, UpdateProfesionalDto } from "../dtos/perfilprofesional.dto";
import { AppError } from "../utils/app-error";

export const PerfilProfesionalService = {

    async listar() {
        const perfiles = await prisma.perfilProfesional.findMany({
            select: {
                id: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellidos: true
                    }
                },
                tituloProfesional: true,
                modalidad: true,
                tarifaBase: true,
                disponible: true
            }
        });
        return perfiles.map(perfil => ({
            id: perfil.id,
            nombre:
                perfil.usuario.nombre + " " + perfil.usuario.apellidos,
            tituloProfesional: perfil.tituloProfesional,
            modalidad: perfil.modalidad,
            tarifaBase: perfil.tarifaBase,
            disponible: perfil.disponible
        }));
    },

    async obtenerPorId(id: number) {
        const perfil = await prisma.perfilProfesional.findUnique({
            where: { id },
            select: {
                id: true,
                usuarioId: true,
                tituloProfesional: true,
                descripcion: true,
                aniosExperiencia: true,
                modalidad: true,
                provincia: true,
                canton: true,
                distrito: true,
                tarifaBase: true,
                disponible: true,
                imagenPerfil: true,
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        correo: true,
                        telefono: true,
                    }
                },
                especialidades: {
                    select: {
                        especialidad: {
                            select: {
                                id: true,
                                nombre: true,
                                descripcion: true,
                            }
                        }
                    }
                }
            }
        });
        if (!perfil) {
            return null;
        }

        // Promedio y cantidad de reseñas reales del profesional,
        // junto con las últimas reseñas registradas por clientes
        const [aggregate, ultimasResenas] = await Promise.all([
            prisma.resena.aggregate({
                where: { profesionalId: id },
                _avg: { puntuacion: true },
                _count: { _all: true },
            }),
            prisma.resena.findMany({
                where: { profesionalId: id },
                orderBy: { fechaResena: "desc" },
                take: 5,
                select: {
                    puntuacion: true,
                    comentario: true,
                    fechaResena: true,
                    cliente: {
                        select: { nombre: true, apellidos: true },
                    },
                },
            }),
        ]);

        return {
            id: perfil.id,
            usuarioId: perfil.usuarioId,
            nombre: `${perfil.usuario?.nombre ?? ""}`,
            apellidos: perfil.usuario?.apellidos ?? "",
            correo: perfil.usuario?.correo ?? "",
            telefono: perfil.usuario?.telefono ?? "",
            tituloProfesional: perfil.tituloProfesional,
            descripcion: perfil.descripcion,
            aniosExperiencia: perfil.aniosExperiencia,
            modalidad: perfil.modalidad,
            provincia: perfil.provincia,
            canton: perfil.canton,
            distrito: perfil.distrito,
            tarifaBase: perfil.tarifaBase,
            disponible: perfil.disponible,
            imagenPerfil: perfil.imagenPerfil,
            especialidades: perfil.especialidades.map((e) => ({
                id: e.especialidad.id,
                nombre: e.especialidad.nombre,
                descripcion: e.especialidad.descripcion,
            })),

            // Calificación promedio (null si aún no tiene reseñas)
            calificacionPromedio:
                aggregate._avg.puntuacion !== null
                    ? Math.round(aggregate._avg.puntuacion * 10) / 10
                    : null,
            cantidadResenas: aggregate._count._all,
            resenas: ultimasResenas.map((r) => ({
                cliente: `${r.cliente.nombre} ${r.cliente.apellidos}`,
                puntuacion: r.puntuacion,
                comentario: r.comentario,
                fechaResena: r.fechaResena,
            })),
        };
    },
    async obtenerPorUsuarioId(usuarioId: number) {
        return prisma.perfilProfesional.findUnique({
            where: { usuarioId },
            select: {
                id: true,
            },
        });
    },
    async alternarEstado(id: number) {
        const profesionalActual = await prisma.perfilProfesional.findUnique({
            where: { id },
            select: { disponible: true }
        });

        if (!profesionalActual) {
            throw new Error("Perfil Profesional no encontrado");
        }

        const nuevoEstado = profesionalActual.disponible ? false : true;

        return await prisma.perfilProfesional.update({
            where: { id },
            data: { disponible: nuevoEstado },
            select: {
                id: true,
                disponible: true
            }
        });
    }
    ,

    async validateCorreo(correo: string, excludeUsuarioId?: number) {
        const usuario = await prisma.usuario.findFirst({
            where: { correo },
        });

        if (usuario && usuario.id !== excludeUsuarioId) {
            throw AppError.conflict(
                "Ya existe un usuario con ese correo"
            );
        }
    },

    async validateTelefono(telefono: string, excludeUsuarioId?: number) {
        const usuario = await prisma.usuario.findFirst({
            where: { telefono },
        });

        if (usuario && usuario.id !== excludeUsuarioId) {
            throw AppError.conflict(
                "Ya existe un usuario con ese teléfono"
            );
        }
    },

    async existeCorreo(correo: string) {
        const usuario = await prisma.usuario.findUnique({
            where: { correo },
            select: { id: true },
        });
        return usuario !== null;
    },
    async validateEspecialidades(
        especialidadIds: number[]
    ) {
        if (!especialidadIds?.length) {
            throw AppError.badRequest(
                "Debe asociar al menos una especialidad"
            );
        }

        const count = await prisma.especialidad.count({
            where: {
                id: {
                    in: especialidadIds,
                },
            },
        });

        if (count !== especialidadIds.length) {
            throw AppError.badRequest(
                "Una o más especialidades no existen"
            );
        }
    },
    async crear(data: CreateProfesionalDto) {
        await this.validateEspecialidades(data.especialidadIds);
        await this.validateCorreo(data.correo);
        await this.validateTelefono(data.telefono);

        const hashedPassword = await bcrypt.hash("123456", 10);
        const usuario = await prisma.usuario.create({
            data: {
                nombre: data.nombre,
                apellidos: data.apellidos,
                correo: data.correo,
                telefono: data.telefono,
                contrasena: hashedPassword,
                rol: "PROFESIONAL",
            },
        });

        return prisma.perfilProfesional.create({
            data: {
                usuarioId: usuario.id,
                tituloProfesional: data.tituloProfesional,
                descripcion: data.descripcion,
                aniosExperiencia: data.aniosExperiencia,
                modalidad: data.modalidad,
                provincia: data.provincia,
                canton: data.canton,
                distrito: data.distrito,
                tarifaBase: data.tarifaBase,
                disponible: data.disponible,
                imagenPerfil: data.imagenPerfil,
                especialidades: data.especialidadIds?.length
                    ? {
                          create: data.especialidadIds.map((especialidadId) => ({
                              especialidadId,
                          })),
                      }
                    : undefined,
            },
            include: {
                usuario: true,
                especialidades: {
                    include: {
                        especialidad: true,
                    },
                },
            },
        });
    },
    async actualizar(
        id: number,
        data: UpdateProfesionalDto
    ) {
        const perfil = await prisma.perfilProfesional.findUnique({
            where: { id },
            include: { usuario: true },
        });

        if (!perfil) {
            throw new Error("Profesional no existe");
        }

        if (data.especialidadIds !== undefined) {
            await this.validateEspecialidades(data.especialidadIds);
        }

        if (data.correo !== undefined && data.correo !== perfil.usuario.correo) {
            await this.validateCorreo(data.correo, perfil.usuarioId);
        }

        if (data.telefono !== undefined && data.telefono !== perfil.usuario.telefono) {
            await this.validateTelefono(data.telefono, perfil.usuarioId);
        }

        await prisma.usuario.update({
            where: { id: perfil.usuarioId },
            data: {
                nombre: data.nombre,
                apellidos: data.apellidos,
                correo: data.correo,
                telefono: data.telefono,
            },
        });

        return prisma.perfilProfesional.update({
            where: { id },
            data: {
                tituloProfesional: data.tituloProfesional,
                descripcion: data.descripcion,
                aniosExperiencia: data.aniosExperiencia,
                modalidad: data.modalidad,
                provincia: data.provincia,
                canton: data.canton,
                distrito: data.distrito,
                tarifaBase: data.tarifaBase,
                disponible: data.disponible,
                imagenPerfil: data.imagenPerfil,
                especialidades:
                    data.especialidadIds !== undefined
                        ? {
                              deleteMany: {},
                              create: data.especialidadIds.map((especialidadId) => ({
                                  especialidadId,
                              })),
                          }
                        : undefined,
            },
            include: {
                usuario: true,
                especialidades: {
                    include: {
                        especialidad: true,
                    },
                },
            },
        });
    },
    async cambiarDisponibilidad(id: number) {
        const perfil = await prisma.perfilProfesional.findUnique({
            where: { id },
        });

        if (!perfil) {
            throw new Error("Profesional no existe");
        }

        return prisma.perfilProfesional.update({
            where: { id },
            data: {
                disponible: !perfil.disponible,
            },
        });
    }


};