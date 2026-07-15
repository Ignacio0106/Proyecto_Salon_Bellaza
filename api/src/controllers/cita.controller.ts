import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { CitaService } from '../services/cita.service';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';

 
export class CitaController { 
    listar = async (request: Request, response: Response, next: NextFunction) => { 
        try { 
            const citas = await CitaService.listar(); 
 
            return response.status(StatusCodes.OK).json({ 
                success: true, 
                data: citas, 
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

        const cita = await CitaService.obtenerPorId(id);
        if (!cita) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Cita no encontrada" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: cita });

    };

    crear = async (request: Request, response: Response, next: NextFunction) => { 
        const cita = await CitaService.crear(request.body); 
        return sendSuccess( 
            response, 
            cita, 
            "Cita creada correctamente", 
            StatusCodes.CREATED 
        ); 
    } 
}

