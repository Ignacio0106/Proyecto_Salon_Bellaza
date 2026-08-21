import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { UsuarioService } from '../services/usuario.service';
import { sendSuccess } from '../utils/http-response';
import { AuthRequest } from '../middlewares/auth.middleware';

 
export class UsuarioController { 
    listar = async (request: Request, response: Response, next: NextFunction) => { 
        try { 
            const videojuegos = await UsuarioService.listar(); 
 
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

        const categoria = await UsuarioService.obtenerPorId(id);
        if (!categoria) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Usuario no encontrado" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: categoria });

    };

cambiarEstado = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
            const id = parseInt(rawId ?? '', 10);
            
            if (isNaN(id)) {
                return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
            }

            // Llamamos al nuevo método del servicio que calcula y cambia el estado automáticamente
            const usuarioActualizado = await UsuarioService.alternarEstado(id);

            return response.status(StatusCodes.OK).json({
                success: true,
                message: `El usuario ahora está ${usuarioActualizado.estado.toLowerCase()}`,
                data: usuarioActualizado // El frontend leerá este nuevo estado devuelto por el servidor
            });
        } catch (error: any) {
            if (error.message === "Usuario no encontrado") {
                return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: error.message });
            }
            console.error(error);
            next(error);
        }
    };

cambiarRol = async (request: AuthRequest, response: Response, next: NextFunction) => {
        try {
            const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
            const id = parseInt(rawId ?? '', 10);

            if (isNaN(id)) {
                return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
            }

            const usuarioActualizado = await UsuarioService.cambiarRol(id, request.body.rol);

            return sendSuccess(
                response,
                usuarioActualizado,
                "Rol actualizado correctamente"
            );
        } catch (error: any) {
            if (error.message === "Usuario no encontrado") {
                return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: error.message });
            }
            console.error(error);
            next(error);
        }
    };

        registrar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const usuario = await UsuarioService.registrar(request.body);

        return sendSuccess(
            response,
            usuario,
            "Usuario registrado correctamente",
            StatusCodes.CREATED
        );
    };

    login = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const result = await UsuarioService.login(request.body);

        return sendSuccess(
            response,
            result,
            "Inicio de sesión correcto"
        );
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Credenciales incorrectas";

        if (
            message === "Correo o contraseña incorrectos" ||
            message === "El usuario se encuentra inactivo"
        ) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Credenciales incorrectas",
            });
        }

        next(error);
    }
    };

    perfil = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuarioId = request.user?.id;

        if (!usuarioId) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Usuario no autenticado: " + usuarioId,
            });
        }
        
        const usuario = await UsuarioService.perfil(usuarioId);
        if (!usuario) { 
            return response 
            .status(StatusCodes.NOT_FOUND) 
            .json({ success: false, message: "El usuario autenticado no existe: " + usuarioId }) 
        }
        return sendSuccess(
            response,
            usuario,
            "Perfil obtenido correctamente"
        );
    };

    actualizarPerfil = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuarioId = request.user?.id;

        if (!usuarioId) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Usuario no autenticado",
            });
        }

        const usuario = await UsuarioService.actualizarPerfil(usuarioId, request.body);

        return sendSuccess(
            response,
            usuario,
            "Perfil actualizado correctamente"
        );
    };
}

