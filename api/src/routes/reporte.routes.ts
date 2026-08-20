import { Router } from "express";
import { ReporteController } from "../controllers/reporte.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

export class ReporteRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ReporteController();

        // localhost:3000/reporte/citas-por-profesional
        router.get("/citas-por-profesional", authenticateToken, asyncHandler(controller.citasPorProfesional))
        // localhost:3000/reporte/citas-por-estado
        router.get('/citas-por-estado', authenticateToken, asyncHandler(controller.citasPorEstado));
        // localhost:3000/reporte/calificaciones
        router.get('/calificaciones', authenticateToken, asyncHandler(controller.calificaciones));

        return router;
    }
}