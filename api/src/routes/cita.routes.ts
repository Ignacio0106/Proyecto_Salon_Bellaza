import { Router } from "express"; 
import { CitaController } from "../controllers/cita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createCitaSchema, updateCitaSchema, updateEstadoCitaSchema } from "../dtos/cita.dto";

 
export class CitaRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new CitaController() 
        //Rutas 
        //locahost:3000/cita/ 
        router.get('/', asyncHandler(controller.listar)) 
                router.get('/:id', asyncHandler(controller.obtenerPorId)) 
                router.post( 
                    "/", 
                    validateRequest(createCitaSchema), 
                    asyncHandler(controller.crear) 
                ) 
         router.put(
            '/:id',
            validateRequest(updateEstadoCitaSchema),
            asyncHandler(controller.editar)
        )
                
                return router;
    } 
} 