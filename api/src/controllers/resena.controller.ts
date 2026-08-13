import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { ResenaService } from '../services/resena.service';
import { sendSuccess } from '../utils/http-response';
import { AuthRequest } from '../middlewares/auth.middleware';

 
export class ResenaController { 
    listar = async (request: Request, response: Response, next: NextFunction) => { 
        try { 
            const videojuegos = await ResenaService.listar(); 
 
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

        const categoria = await ResenaService.obtenerPorId(id);
        if (!categoria) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Reseña no encontrada" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: categoria });

    };

    // Registra la reseña de una cita completada (acción del Cliente
    // desde "Mis Citas"). El clienteId se toma del token, no del body.
    crear = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Usuario no autenticado" });
        }

        const resena = await ResenaService.crear(request.body, usuario.id);

        return sendSuccess(
            response,
            resena,
            "Reseña registrada correctamente",
            StatusCodes.CREATED
        );
    };
}

