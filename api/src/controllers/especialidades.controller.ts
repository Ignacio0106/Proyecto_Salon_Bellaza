import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { EspecialidadesService } from '../services/especialidades.service';

 
export class EspecialidadesController { 
    listar = async (request: Request, response: Response, next: NextFunction) => { 
        try { 
            const videojuegos = await EspecialidadesService.listar(); 
 
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

        const especialidad = await EspecialidadesService.obtenerPorId(id);
        if (!especialidad) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Especialidad no encontrada" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: especialidad });

    };
        cambiarEstado = async (request: Request, response: Response, next: NextFunction) => {
                try {
                    const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
                    const id = parseInt(rawId ?? '', 10);
                    
                    if (isNaN(id)) {
                        return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
                    }
        
                    // Llamamos al nuevo método del servicio que calcula y cambia el estado automáticamente
                    const especialidadActualizada = await EspecialidadesService.alternarEstado(id);
        
                    return response.status(StatusCodes.OK).json({
                        success: true,
                        message: `La especialidad ahora está ${especialidadActualizada.estado.toLowerCase()}`,
                        data: especialidadActualizada 
                    });
                } catch (error: any) {
                    if (error.message === "Especialidad no encontrada") {
                        return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: error.message });
                    }
                    console.error(error);
                    next(error);
                }
            };
}

