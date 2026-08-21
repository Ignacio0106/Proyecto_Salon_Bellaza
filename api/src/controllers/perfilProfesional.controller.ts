import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { PerfilProfesionalService } from '../services/perfilProfesional.service';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';
import { AuthRequest } from '../middlewares/auth.middleware';

 
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

  private async obtenerPermisoModificarPerfil(
      usuarioId: number,
      perfilId: number
  ): Promise<{ ok: true } | { ok: false; status: StatusCodes; message: string }> {
      const perfil = await PerfilProfesionalService.obtenerPorId(perfilId);
      if (!perfil) {
          return { ok: false, status: StatusCodes.NOT_FOUND, message: "Perfil Profesional no encontrado" };
      }
      if (perfil.usuarioId !== usuarioId) {
          return { ok: false, status: StatusCodes.FORBIDDEN, message: "No tiene permisos para modificar este perfil profesional" };
      }
      return { ok: true };
  }

cambiarDisponibilidad = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
      const usuario = request.user;
      if (!usuario) {
        return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Token no proporcionado" });
      }

      const id = parseId(request.params.id);

      if (usuario.rol !== "ADMINISTRADOR") {
        const permiso = await this.obtenerPermisoModificarPerfil(usuario.id, id);
        if (!permiso.ok) {
          return response.status(permiso.status).json({ success: false, message: permiso.message });
        }
      }

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

  validarCorreo = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const correo = String(request.query.correo ?? "").trim();
      if (!correo) {
        return response.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "El correo es obligatorio",
        });
      }
      const existe = await PerfilProfesionalService.existeCorreo(correo);
      return response.status(StatusCodes.OK).json({
        success: true,
        data: { existe },
      });
    } catch (error) {
      next(error);
    }
  };

  crear = async (request: AuthRequest, response: Response, next: NextFunction) => { 
        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Token no proporcionado" });
        }
        if (usuario.rol !== "ADMINISTRADOR") {
            return response.status(StatusCodes.FORBIDDEN).json({ success: false, message: "Solo los administradores pueden crear perfiles profesionales" });
        }
        const profesional = await PerfilProfesionalService.crear(request.body); 
        return sendSuccess( 
            response, 
            profesional, 
            "Perfil Profesional creado correctamente", 
            StatusCodes.CREATED 
        ); 
    } 
    actualizar = async (request: AuthRequest, response: Response, next: NextFunction) => { 
        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Token no proporcionado" });
        }

        const id = parseId(request.params.id); 

        if (usuario.rol !== "ADMINISTRADOR") {
            const permiso = await this.obtenerPermisoModificarPerfil(usuario.id, id);
            if (!permiso.ok) {
                return response.status(permiso.status).json({ success: false, message: permiso.message });
            }
        }

        const profesional = await PerfilProfesionalService.actualizar(id, request.body); 
        return sendSuccess( 
            response, 
            profesional, 
            "Perfil Profesional actualizado correctamente" 
        ); 
    } 
}
