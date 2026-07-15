import { Router } from "express"; 
import { UsuarioController } from "../controllers/usuario.controller";
import { ResenaController } from "../controllers/resena.controller";

 
export class ResenaRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new ResenaController() 
        //Rutas 
        //locahost:3000/usuario/ 
        router.get('/', controller.listar) 
        router.get('/:id', controller.obtenerPorId)
        return router 
    } 
} 