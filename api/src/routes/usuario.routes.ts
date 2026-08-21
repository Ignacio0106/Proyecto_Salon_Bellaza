import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { loginUserSchema, registerUserSchema, updateProfileSchema, cambiarRolSchema } from "../dtos/ususario.dto";
import { authenticateToken, authorizeRole } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UsuarioController();

        router.get(
            '/',
            authenticateToken,
            authorizeRole("ADMINISTRADOR"),
            asyncHandler(controller.listar)
        );

        router.get(
            "/perfil",
            authenticateToken,
            asyncHandler(controller.perfil)
        );

        router.put(
            "/perfil",
            authenticateToken,
            validateRequest(updateProfileSchema),
            asyncHandler(controller.actualizarPerfil)
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

        router.put(
            '/rol/:id',
            authenticateToken,
            authorizeRole("ADMINISTRADOR"),
            validateRequest(cambiarRolSchema),
            asyncHandler(controller.cambiarRol)
        );

        router.get(
            '/:id',
            authenticateToken,
            authorizeRole("ADMINISTRADOR"),
            asyncHandler(controller.obtenerPorId)
        );

        router.put(
            '/estado/:id',
            authenticateToken,
            authorizeRole("ADMINISTRADOR"),
            asyncHandler(controller.cambiarEstado)
        );

        return router;
    }
}