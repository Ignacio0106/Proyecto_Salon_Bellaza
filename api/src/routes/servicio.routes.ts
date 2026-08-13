import { Router } from "express"; 
import { ServicioController } from "../controllers/servicio.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { createServicioSchema, updateServicioSchema } from "../dtos/servicio.dto";

export class ServicioRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new ServicioController() 
        //Rutas 
        //locahost:3000/usuario/
        router.get('/', asyncHandler(controller.listar)) 
                router.get('/:id', asyncHandler(controller.obtenerPorId)) 
                router.post( 
                    "/", 
                    authenticateToken,
                    validateRequest(createServicioSchema), 
                    asyncHandler(controller.crear) 
                ) 
         
                router.put( 
                    "/:id", 
                    authenticateToken,
                    validateRequest(updateServicioSchema), 
                    asyncHandler(controller.actualizar) 
                ) 
                router.put('/estado/:id', authenticateToken, controller.cambiarEstado);
                return router;
    } 
} 