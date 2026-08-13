import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { ServicioService } from '../services/servicio.service';
import { PerfilProfesionalService } from '../services/perfilProfesional.service';
import { parseId } from '../utils/parse-id';
import { sendSuccess } from '../utils/http-response';
import { AuthRequest } from '../middlewares/auth.middleware';


export class ServicioController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const videojuegos = await ServicioService.listar();

            return response.status(StatusCodes.OK).json({
                success: true,
                data: videojuegos,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {

        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
        }

        const servicio = await ServicioService.obtenerPorId(id);
        if (!servicio) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Servicio no encontrado" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: servicio });

    };

    private async obtenerPermisoModificarServicio(
        usuarioId: number,
        servicioId: number
    ): Promise<{ ok: true; perfilId: number } | { ok: false; status: StatusCodes; message: string }> {
        const perfil = await PerfilProfesionalService.obtenerPorUsuarioId(usuarioId);
        if (!perfil) {
            return { ok: false, status: StatusCodes.FORBIDDEN, message: "El usuario no tiene un perfil profesional" };
        }
        const servicio = await ServicioService.obtenerPorId(servicioId);
        if (!servicio) {
            return { ok: false, status: StatusCodes.NOT_FOUND, message: "Servicio no encontrado" };
        }
        if (servicio.profesionalId !== perfil.id) {
            return { ok: false, status: StatusCodes.FORBIDDEN, message: "No tiene permisos para modificar este servicio" };
        }
        return { ok: true, perfilId: perfil.id };
    }

    cambiarEstado = async (request: AuthRequest, response: Response, next: NextFunction) => {
        try {
            const usuario = request.user;
            if (!usuario) {
                return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Token no proporcionado" });
            }

            const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
            const id = parseInt(rawId ?? '', 10);

            if (isNaN(id)) {
                return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
            }

            if (usuario.rol !== "ADMINISTRADOR") {
                const permiso = await this.obtenerPermisoModificarServicio(usuario.id, id);
                if (!permiso.ok) {
                    return response.status(permiso.status).json({ success: false, message: permiso.message });
                }
            }

            // Llamamos al nuevo método del servicio que calcula y cambia el estado automáticamente
            const servicioActualizado = await ServicioService.alternarEstado(id);

            return response.status(StatusCodes.OK).json({
                success: true,
                message: `El servicio ahora está ${servicioActualizado.estado.toLowerCase()}`,
                data: servicioActualizado
            });
        } catch (error: any) {
            if (error.message === "Servicio no encontrado") {
                return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: error.message });
            }
            console.error(error);
            next(error);
        }
    };
    crear = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Token no proporcionado" });
        }

        const body = { ...request.body };

        if (usuario.rol === "ADMINISTRADOR") {
            // El administrador elige el profesional al que asigna el servicio
        } else if (usuario.rol === "PROFESIONAL") {
            const perfil = await PerfilProfesionalService.obtenerPorUsuarioId(usuario.id);
            if (!perfil) {
                return response.status(StatusCodes.FORBIDDEN).json({ success: false, message: "El usuario no tiene un perfil profesional" });
            }
            body.profesionalId = perfil.id;
        } else {
            return response.status(StatusCodes.FORBIDDEN).json({ success: false, message: "Solo los administradores o profesionales pueden crear servicios" });
        }

        const servicio = await ServicioService.crear(body);
        return sendSuccess(
            response,
            servicio,
            "Servicio creado correctamente",
            StatusCodes.CREATED
        );
    }
    actualizar = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Token no proporcionado" });
        }

        const id = parseId(request.params.id);
        const body = { ...request.body };

        if (usuario.rol !== "ADMINISTRADOR") {
            const permiso = await this.obtenerPermisoModificarServicio(usuario.id, id);
            if (!permiso.ok) {
                return response.status(permiso.status).json({ success: false, message: permiso.message });
            }
            body.profesionalId = permiso.perfilId;
        }

        const servicio = await ServicioService.actualizar(id, body);
        return sendSuccess(
            response,
            servicio,
            "Servicio actualizado correctamente"
        );
    }
}
