import { Router } from "express"; 
import { UsuarioController } from "../controllers/usuario.controller";
import { ServicioController } from "../controllers/servicio.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
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
                    validateRequest(createServicioSchema), 
                    asyncHandler(controller.crear) 
                ) 
         
                router.put( 
                    "/:id", 
                    validateRequest(updateServicioSchema), 
                    asyncHandler(controller.actualizar) 
                ) 
                router.put('/estado/:id', controller.cambiarEstado);
                return router;
    } 
} 