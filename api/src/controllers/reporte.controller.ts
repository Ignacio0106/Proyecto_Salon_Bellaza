import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from "../utils/http-response";
import { AppError } from "../utils/app-error";
import { AuthRequest } from "../middlewares/auth.middleware";
import { StatusCodes } from "http-status-codes";
import { ReporteService } from '../services/reporte.service';

export class ReporteController {
    citasPorProfesional = async (request: AuthRequest, response: Response, next: NextFunction) => {
        try {
            if (!request.user) {
                throw AppError.unauthorized();
            }

            const data = await ReporteService.citasPorProfesional(
                request.user
            );

            return sendSuccess(
                response,
                data,
                "Reporte generado correctamente"
            );
        } catch (error) {
            next(error);
        }
    };
}