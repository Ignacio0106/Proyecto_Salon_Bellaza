import { Router } from "express"; 
import { EspecialidadesController } from "../controllers/especialidades.controller";

 
export class EspecialidadesRoutes { 
    static get routes(): Router { 
        const router = Router() 
        const controller = new EspecialidadesController() 
        //Rutas 
        //locahost:3000/categoria/ 
        router.get('/', controller.listar) 
        router.get('/:id', controller.obtenerPorId)
        router.put('/estado/:id', controller.cambiarEstado);
        return router 
    } 
} 