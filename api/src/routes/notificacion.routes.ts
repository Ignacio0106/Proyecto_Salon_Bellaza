import { Router } from "express";
import { NotificacionController } from "../controllers/notificacion.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

export class NotificacionRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new NotificacionController()
        //Rutas
        //localhost:3000/notificacion/
        router.get('/', authenticateToken, asyncHandler(controller.listar))
        router.put('/leer-todas', authenticateToken, asyncHandler(controller.marcarTodasLeidas))
        router.put('/:id/leer', authenticateToken, asyncHandler(controller.marcarLeida))

        return router;
    }
}
