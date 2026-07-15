import { Router } from "express"; 
import { CategoriaController } from "../controllers/categoria.controller";

 
export class CategoriaRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new CategoriaController() 
        //Rutas 
        //locahost:3000/categoria/ 
        router.get('/', controller.listar) 
        router.get('/:id', controller.obtenerPorId)
        router.put('/estado/:id', controller.cambiarEstado);
        return router 
    } 
} 