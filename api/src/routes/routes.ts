import { Router } from 'express'; 
import { UsuarioRoutes } from './usuario.routes';
import { ServicioRoutes } from './servicio.routes';
import { ResenaRoutes } from './resena.routes';
import { PerfilProfesionalRoutes } from './perfilProfesional.routes';
import { CategoriaRoutes } from './categoria.routes';
import { EspecialidadesRoutes } from './especialidades.routes';
import { CitaRoutes } from './cita.routes';
import { ImageRoutes } from './image.routes';
import { ReporteRoutes } from './reporte.routes';
import { NotificacionRoutes } from './notificacion.routes';


export class AppRoutes { 
    static get routes(): Router { 
        const router = Router(); 
        // ----Agregar las rutas---- 
        router.use('/usuario', UsuarioRoutes.routes)         
        router.use('/servicio', ServicioRoutes.routes)         
        router.use('/resena', ResenaRoutes.routes)         
        router.use('/perfilProfesional', PerfilProfesionalRoutes.routes)         
        router.use('/categoria', CategoriaRoutes.routes)         
        router.use('/especialidades', EspecialidadesRoutes.routes) 
        router.use('/cita', CitaRoutes.routes) 
        router.use('/images', ImageRoutes.routes)
        router.use('/reporte', ReporteRoutes.routes)
        router.use('/notificacion', NotificacionRoutes.routes)
        
        return router; 
        
    } 
} 