import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { NotificacionService } from '../services/notificacion.service';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';
import { AuthRequest } from '../middlewares/auth.middleware';

export class NotificacionController {
    listar = async (request: AuthRequest, response: Response, next: NextFunction) => {
        try {
            const usuario = request.user;
            if (!usuario) {
                return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Usuario no autenticado" });
            }

            const data = await NotificacionService.listar(usuario.id);
            return sendSuccess(response, data, "Notificaciones obtenidas correctamente", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    marcarLeida = async (request: AuthRequest, response: Response, next: NextFunction) => {
        try {
            const usuario = request.user;
            if (!usuario) {
                return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Usuario no autenticado" });
            }

            const id = parseId(request.params.id);
            await NotificacionService.marcarLeida(id, usuario.id);

            return sendSuccess(response, null, "Notificación marcada como leída", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };

    marcarTodasLeidas = async (request: AuthRequest, response: Response, next: NextFunction) => {
        try {
            const usuario = request.user;
            if (!usuario) {
                return response.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "Usuario no autenticado" });
            }

            const data = await NotificacionService.marcarTodasLeidas(usuario.id);
            return sendSuccess(response, data, "Notificaciones marcadas como leídas", StatusCodes.OK);
        } catch (error) {
            next(error);
        }
    };
}
