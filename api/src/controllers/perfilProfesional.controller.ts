import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { ServicioService } from '../services/servicio.service';
import { PerfilProfesionalService } from '../services/perfilProfesional.service';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';

 
export class PerfilProfesionalController { 
listar = async (request: Request, response: Response, next: NextFunction) => { 
    try { 
      const perfiles = await PerfilProfesionalService.listar(); 
 
      return response.status(StatusCodes.OK).json({ 
        success: true, 
        data: perfiles, 
      }); 
    } catch (error) { 
      next(error); 
    } 
  };

obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const id = parseId(request.params.id);
      const perfil = await PerfilProfesionalService.obtenerPorId(id);
      
      if (!perfil) {
        return response.status(StatusCodes.NOT_FOUND).json({ 
          success: false, 
          message: "Perfil Profesional no encontrado" 
        });
      }

      return response.status(StatusCodes.OK).json({ success: true, data: perfil });
    } catch (error) {
      next(error);
    }
  };

cambiarDisponibilidad = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const id = parseId(request.params.id);
      const profesionalActualizado = await PerfilProfesionalService.alternarEstado(id);
 
      return response.status(StatusCodes.OK).json({
        success: true,
        message: `El perfil profesional ahora está ${profesionalActualizado.disponible ? 'disponible' : 'no disponible'}`,
        data: profesionalActualizado 
      });
    } catch (error) {
      next(error);
    }
  };

    crear = async (request: Request, response: Response, next: NextFunction) => { 
        const profesional = await PerfilProfesionalService.crear(request.body); 
        return sendSuccess( 
            response, 
            profesional, 
            "Perfil Profesional creado correctamente", 
            StatusCodes.CREATED 
        ); 
    } 
    actualizar = async (request: Request, response: Response, next: NextFunction) => { 
        const id = parseId(request.params.id); 
        const profesional = await PerfilProfesionalService.actualizar(id, request.body); 
        return sendSuccess( 
            response, 
            profesional, 
            "Perfil Profesional actualizado correctamente" 
        ); 
    } 
}

