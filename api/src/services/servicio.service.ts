import { prisma } from "../config/prisma";
import { CreateServicioDto, UpdateServicioDto } from "../dtos/servicio.dto";
import { AppError } from "../utils/app-error";


export const ServicioService = {
    async listar() {
        const servicios = await prisma.servicio.findMany({
            select: {
                id: true,
                nombre: true,
                precio: true,
                modalidad: true,
                estado: true,

                profesional: {
                    select: {
                        id: true,
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                            },
                        },
                    },
                },

                categoria: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
            },
        });

        return servicios.map((servicio) => ({
            id: servicio.id,
            nombre: servicio.nombre,
            idProfesional: servicio.profesional.id,
            profesional: `${servicio.profesional.usuario.nombre} ${servicio.profesional.usuario.apellidos}`,
            categoriaId: servicio.categoria.id,
            categoria: servicio.categoria.nombre,
            precio: servicio.precio,
            modalidad: servicio.modalidad,
            estado: servicio.estado,
        }));
    },

    async obtenerPorId(id: number) {
        const servicio = await prisma.servicio.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                precio: true,
                duracionEstimada: true,
                modalidad: true,
                estado: true,
                fechaCreacion: true,

                categoriaId: true,
                categoria: {
                    select: {
                        id: true,
                        nombre: true,
                        descripcion: true,
                    },
                },

                profesionalId: true,
                profesional: {
                    select: {
                        id: true,
                        tituloProfesional: true,
                        aniosExperiencia: true,
                        modalidad: true,
                        provincia: true,
                        canton: true,
                        distrito: true,
                        tarifaBase: true,

                        usuario: {
                            select: {
                                nombre: true,
                                apellidos: true,
                                correo: true,
                                telefono: true,
                            },
                        },
                    },
                },

                especialidades: {
                    select: {
                        especialidad: {
                            select: {
                                id: true,
                                nombre: true,
                                descripcion: true,
                            },
                        },
                    },
                },
            },
        });

        if (!servicio) {
            return null;
        }

        return {
            id: servicio.id,
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            precio: servicio.precio,
            duracionEstimada: servicio.duracionEstimada,
            modalidad: servicio.modalidad,
            estado: servicio.estado,
            fechaCreacion: servicio.fechaCreacion,

            categoriaId: servicio.categoria.id,
            categoria: servicio.categoria,

            profesionalId: servicio.profesionalId,
            profesional: {
                id: servicio.profesional.id,
                nombreCompleto: `${servicio.profesional.usuario.nombre} ${servicio.profesional.usuario.apellidos}`,
                correo: servicio.profesional.usuario.correo,
                telefono: servicio.profesional.usuario.telefono,
                tituloProfesional: servicio.profesional.tituloProfesional,
                aniosExperiencia: servicio.profesional.aniosExperiencia,
                modalidad: servicio.profesional.modalidad,
                ubicacion: `${servicio.profesional.distrito}, ${servicio.profesional.canton}, ${servicio.profesional.provincia}`,
                tarifaBase: servicio.profesional.tarifaBase,
            },

            especialidades: servicio.especialidades.map((especialidad) => ({
                id: especialidad.especialidad.id,
                nombre: especialidad.especialidad.nombre,
                descripcion: especialidad.especialidad.descripcion,
            })),
        };
    },

    async validateProfesional(profesionalId: number) {
        const profesional = await prisma.perfilProfesional.findUnique({
            where: { id: profesionalId },
        });

        if (!profesional) {
            throw AppError.badRequest("El profesional indicado no existe");
        }
    },

    async validateCategoria(categoriaId: number) {
        const categoria = await prisma.categoriaServicio.findUnique({
            where: { id: categoriaId },
        });

        if (!categoria) {
            throw AppError.badRequest("La categoría indicada no existe");
        }
    },

    async validateEspecialidades(especialidadIds?: number[]) {
        if (!especialidadIds?.length) return;

        const count = await prisma.especialidad.count({
            where: {
                id: {
                    in: especialidadIds,
                },
            },
        });

        if (count !== especialidadIds.length) {
            throw AppError.badRequest("Una o más especialidades no existen");
        }
    },
   async alternarEstado(id: number) {
        const servicioActual = await prisma.servicio.findUnique({
            where: { id },
            select: { estado: true }
        });

        if (!servicioActual) {
            throw new Error("Servicio no encontrado");
        }

        const nuevoEstado = servicioActual.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

        return await prisma.servicio.update({
            where: { id },
            data: { estado: nuevoEstado },
            select: {
                id: true,
                nombre: true,
                estado: true,
            }
        });
    },

    async crear(data: CreateServicioDto) {
        await this.validateProfesional(data.profesionalId);
        await this.validateCategoria(data.categoriaId);
        await this.validateEspecialidades(data.especialidadIds);

        return prisma.servicio.create({
            data: {
                profesionalId: data.profesionalId,
                categoriaId: data.categoriaId,
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: data.precio,
                duracionEstimada: data.duracionEstimada,
                modalidad: data.modalidad,
                estado: data.estado,

                especialidades: data.especialidadIds?.length
                    ? {
                          create: data.especialidadIds.map((especialidadId) => ({
                              especialidadId,
                          })),
                      }
                    : undefined,
            },
            include: {
                categoria: true,
                profesional: {
                    include: {
                        usuario: true,
                    },
                },
                especialidades: {
                    include: {
                        especialidad: true,
                    },
                },
            },
        });
    },

    async actualizar(id: number, data: UpdateServicioDto) {
        const existente = await prisma.servicio.findUnique({ where: { id } });

        if (!existente) {
            throw AppError.notFound("El servicio indicado no existe");
        }

        if (data.profesionalId !== undefined) {
            await this.validateProfesional(data.profesionalId);
        }

        if (data.categoriaId !== undefined) {
            await this.validateCategoria(data.categoriaId);
        }

        if (data.especialidadIds !== undefined) {
            await this.validateEspecialidades(data.especialidadIds);
        }

        return prisma.servicio.update({
            where: { id },
            data: {
                profesionalId: data.profesionalId,
                categoriaId: data.categoriaId,
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: data.precio,
                duracionEstimada: data.duracionEstimada,
                modalidad: data.modalidad,
                estado: data.estado,

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
                categoria: true,
                profesional: {
                    include: {
                        usuario: true,
                    },
                },
                especialidades: {
                    include: {
                        especialidad: true,
                    },
                },
            },
        });
    },

    async cambiarEstado(id: number) {
        const servicio = await prisma.servicio.findUnique({
            where: { id },
        });

        if (!servicio) {
            throw AppError.notFound("El servicio indicado no existe");
        }

        return prisma.servicio.update({
            where: { id },
            data: {
                estado: servicio.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
            },
        });
    },
};