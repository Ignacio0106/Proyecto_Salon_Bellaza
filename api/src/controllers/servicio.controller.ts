import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { ServicioService } from '../services/servicio.service';
import { parseId } from '../utils/parse-id';
import { sendSuccess } from '../utils/http-response';


export class ServicioController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const videojuegos = await ServicioService.listar();

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

        const servicio = await ServicioService.obtenerPorId(id);
        if (!servicio) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Servicio no encontrado" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: servicio });

    };

    cambiarEstado = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
            const id = parseInt(rawId ?? '', 10);

            if (isNaN(id)) {
                return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
            }

            // Llamamos al nuevo método del servicio que calcula y cambia el estado automáticamente
            const servicioActualizado = await ServicioService.alternarEstado(id);

            return response.status(StatusCodes.OK).json({
                success: true,
                message: `El servicio ahora está ${servicioActualizado.estado.toLowerCase()}`,
                data: servicioActualizado
            });
        } catch (error: any) {
            if (error.message === "Servicio no encontrado") {
                return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: error.message });
            }
            console.error(error);
            next(error);
        }
    };
    crear = async (request: Request, response: Response, next: NextFunction) => {
        const servicio = await ServicioService.crear(request.body);
        return sendSuccess(
            response,
            servicio,
            "Servicio creado correctamente",
            StatusCodes.CREATED
        );
    }
    actualizar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const servicio = await ServicioService.actualizar(id, request.body);
        return sendSuccess(
            response,
            servicio,
            "Servicio actualizado correctamente"
        );
    }
}

