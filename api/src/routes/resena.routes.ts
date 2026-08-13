import { Router } from "express"; 
import { ResenaController } from "../controllers/resena.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { crearResenaSchema } from "../dtos/resena.dto";

 
export class ResenaRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new ResenaController() 
        //Rutas 
        //locahost:3000/resena/ 
        router.get('/', controller.listar) 
        router.post(
            '/',
            authenticateToken,
            validateRequest(crearResenaSchema),
            asyncHandler(controller.crear)
        )
        router.get('/:id', controller.obtenerPorId)
        return router 
    } 
} 