import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { CategoriaService } from '../services/categorias.service';

 
export class CategoriaController { 
    listar = async (request: Request, response: Response, next: NextFunction) => { 
        try { 
            const videojuegos = await CategoriaService.listar(); 
 
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

        const categoria = await CategoriaService.obtenerPorId(id);
        if (!categoria) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Categoría no encontrada" });
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
                const categoriaActualizada = await CategoriaService.alternarEstado(id);
    
                return response.status(StatusCodes.OK).json({
                    success: true,
                    message: `La categoría ahora está ${categoriaActualizada.estado.toLowerCase()}`,
                    data: categoriaActualizada // El frontend leerá este nuevo estado devuelto por el servidor
                });
            } catch (error: any) {
                if (error.message === "Categoría no encontrada") {
                    return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: error.message });
                }
                console.error(error);
                next(error);
            }
        };
}

