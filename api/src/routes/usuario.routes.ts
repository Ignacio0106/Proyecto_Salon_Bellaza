import { Router } from "express"; 
import { UsuarioController } from "../controllers/usuario.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { loginUserSchema, registerUserSchema } from "../dtos/ususario.dto";
import { authenticateToken } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class UsuarioRoutes { 
    static get routes(): Router { 
        const router = Router();
        const controller = new UsuarioController();

        // 1. Rutas específicas primero
        router.get('/', controller.listar);
        
        router.get(
            "/perfil",
            authenticateToken,
            asyncHandler(controller.perfil)
        );

        router.post(
            "/register",
            validateRequest(registerUserSchema),
            asyncHandler(controller.registrar)
        );

        router.post(
            "/login",
            validateRequest(loginUserSchema),
            asyncHandler(controller.login)
        );

        // 2. Rutas dinámicas con :id AL FINAL
        router.get('/:id', controller.obtenerPorId);
        router.put('/estado/:id', controller.cambiarEstado);

        return router; 
    } 
}