import { Router } from "express"; 
import { UsuarioController } from "../controllers/usuario.controller";

 
export class UsuarioRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new UsuarioController() 
        //Rutas 
        //locahost:3000/usuario/ 
        router.get('/', controller.listar) 
        router.get('/:id', controller.obtenerPorId)
        router.put('/estado/:id', controller.cambiarEstado);
        return router 
    } 
} 