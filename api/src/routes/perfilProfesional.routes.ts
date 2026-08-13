import { Router } from "express"; 
import { PerfilProfesionalController } from "../controllers/perfilProfesional.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { createProfesionalSchema, updateProfesionalSchema } from "../dtos/perfilprofesional.dto";

 
export class PerfilProfesionalRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new PerfilProfesionalController() 
        //Rutas 
        //locahost:3000/usuario/ 
        router.get('/', asyncHandler(controller.listar)) 
        router.get('/:id', asyncHandler(controller.obtenerPorId)) 
        router.put('/estado/:id', authenticateToken, controller.cambiarDisponibilidad);
        router.post( 
            "/", 
            authenticateToken,
            validateRequest(createProfesionalSchema), 
            asyncHandler(controller.crear) 
        ) 
 
        router.put( 
            "/:id", 
            authenticateToken,
            validateRequest(updateProfesionalSchema), 
            asyncHandler(controller.actualizar) 
        ) 
        return router;
    } 
     
} 

