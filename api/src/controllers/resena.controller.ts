import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { ResenaService } from '../services/resena.service';

 
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
}

