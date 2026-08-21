import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import jwt, { JwtPayload, Secret } from "jsonwebtoken"
export interface AuthTokenPayload extends JwtPayload {
    id: number
    correo: string
    rol: string
}
export interface AuthRequest extends Request { user?: AuthTokenPayload }
export function authorizeRole(...rolesPermitidos: string[]) {
    return (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuario = request.user
        if (!usuario) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json({ success: false, message: "Token no proporcionado" })
        }
        if (!rolesPermitidos.includes(usuario.rol)) {
            return response
                .status(StatusCodes.FORBIDDEN)
                .json({ success: false, message: "No tiene permisos para realizar esta acción" })
        }
        next()
    }
}

export function authenticateToken(request: AuthRequest, response: Response, next: NextFunction) {
    const authorizationHeader = request.headers.authorization
    if (!authorizationHeader) {
        return response.status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Token no proporcionado" })
    }
    const [scheme, token] = authorizationHeader.split(" ")
    if (scheme !== "Bearer" || !token) {
        return response
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Formato de token inválido" })
    }
    try {
        const secret: Secret = process.env.JWT_SECRET || "vj_utn_2026"
        const decodedToken = jwt.verify(token, secret)
        if (typeof decodedToken === "string" || !decodedToken.id || !decodedToken.correo || !decodedToken.rol) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json({ success: false, message: "Token inválido" })
        }
        request.user = {
            id: Number(decodedToken.id),
            correo: String(decodedToken.correo),
            rol: String(decodedToken.rol)
        }
        next()
    } catch {
        return response
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "Token inválido o expirado" })
    }
}