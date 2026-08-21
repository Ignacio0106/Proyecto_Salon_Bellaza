import { Request, Response, NextFunction } from 'express'; 
import { StatusCodes } from "http-status-codes"; 
import { CitaService } from '../services/cita.service';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';
import { AuthRequest } from '../middlewares/auth.middleware';

 
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

    crear = async (request: AuthRequest, response: Response, next: NextFunction) => { 
        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Usuario no autenticado" });
        }
        if (usuario.rol !== "CLIENTE") {
            return response.status(StatusCodes.FORBIDDEN).json({ success: false, message: "Solo los clientes pueden agendar citas" });
        }

        const cita = await CitaService.crear({
            ...request.body,
            clienteId: usuario.id,
        }); 
        return sendSuccess( 
            response, 
            cita, 
            "Cita creada correctamente", 
            StatusCodes.CREATED 
        ); 
    } 
    // Actualiza el estado de la cita (usado por la Agenda Visual).
    // Si el nuevo estado es RECHAZADA o CANCELADA se exige motivo y se
    // notifica al cliente y al profesional.
    editar = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);

        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
        }

        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Usuario no autenticado" });
        }

        const cita = await CitaService.editarEstado(
            id,
            request.body.estado,
            { id: usuario.id, rol: usuario.rol as 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE' },
            request.body.motivo,
            request.body.comentario
        );

        return sendSuccess(
            response,
            cita,
            "Cita actualizada correctamente",
            StatusCodes.OK
        );
    }

    // Cancela una cita (usado por "Mis Citas" del Cliente).
    // Requiere estar autenticado: se toma el id y rol del token, no del body.
    cancelar = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);

        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
        }

        const usuario = request.user;
        if (!usuario) {
            return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Usuario no autenticado" });
        }

        const cita = await CitaService.cancelar(id, request.body.motivo, {
            id: usuario.id,
            rol: usuario.rol as 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE',
        });

        return sendSuccess(
            response,
            cita,
            "Cita cancelada correctamente",
            StatusCodes.OK
        );
    }
}