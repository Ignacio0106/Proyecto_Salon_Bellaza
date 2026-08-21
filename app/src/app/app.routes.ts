import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';

import { ProfesionalesList } from './pages/profesionales/profesionales-list/profesionales-list';
import { ProfesionalDetail } from './pages/profesionales/profesional-detail/profesional-detail';
import { CitasList } from './pages/citas/citas-list/citas-list';
import { CitaReserva } from './pages/citas/cita-reserva/cita-reserva';
import { Citas } from './pages/citas/citas/citas';
import { CitaDetail } from './pages/citas/cita-detail/cita-detail';
import { CategoriasList } from './pages/categorias/categorias-list/categorias-list';
import { EspecialidadesList } from './pages/especialidades/especialidades-list/especialidades-list';
import { UsuariosList } from './pages/usuarios/usuarios-list/usuarios-list';
import { GestionCitasList } from './pages/gestion-citas/gestion-citas-list/gestion-citas-list';
import { ResenasList } from './pages/resenas/resenas-list/resenas-list';
import { ServiciosList } from './pages/servicios/servicios-list/servicios-list';
import { ServicioDetail } from './pages/servicios/servicio-detail/servicio-detail';
import { ServicioCreatePage } from './pages/servicios/servicios-create/servicios-create';
import { ServicioEditPage } from './pages/servicios/servicios-edit/servicios-edit';
import { ProfesionalEdit } from './pages/profesionales/profesional-edit/profesional-edit';
import { ProfesionalCreate } from './pages/profesionales/profesional-create/profesional-create';
import { SinAutorizacion } from './pages/auth/sin-autorizacion/sin-autorizacion';
import { Login } from './pages/usuarios/login/login';
import { Role } from './core/models/role.model';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Perfil } from './pages/usuarios/usuarios-perfil/usuarios-perfil';
import { EditarPerfil } from './pages/usuarios/editar-perfil/editar-perfil';
import { Registro } from './pages/usuarios/registro/registro';
import { ReporteCitasByProfesional } from './pages/reportes/reporte-citas-by-profesional/reporte-citas-by-profesional';
import { AgendaVisual } from './pages/agenda/agenda-visual/agenda-visual';
import { ReporteCitasByEstado } from './pages/reportes/reporte-citas-by-estado/reporte-citas-by-estado';
import { ReporteCalificaciones } from './pages/reportes/reporte-calificaciones/reporte-calificaciones';
    
export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', component: Home, title: 'Inicio' },
            {
                path: 'servicios',
                component: ServiciosList,
                title: 'Catálogo de Servicios'
            },
            // Profesional solo puede acceder
            {
                path: 'servicios/create',
                component: ServicioCreatePage,
                title: 'Crear Servicio',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.PROFESIONAL, Role.ADMIN] }
            },
            {
                path: 'servicios/edit/:id',
                component: ServicioEditPage,
                title: 'Editar Servicio',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.PROFESIONAL, Role.ADMIN] }
            },
            {
                path: 'servicios/:id',
                component: ServicioDetail,
                title: 'Catálogo de Servicios'
            },
            {
                path: 'profesionales',
                component: ProfesionalesList,
                title: 'Nuestros Profesionales'
            },
            // Admin solo puede acceder
            {
                path: 'profesionales/create',
                component: ProfesionalCreate,
                title: 'Crear Profesional',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN] }
            },
            {
                path: 'profesionales/edit/:id',
                component: ProfesionalEdit,
                title: 'Editar Profesional',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN, Role.PROFESIONAL] }
            },
            {
                path: 'profesionales/:id',
                component: ProfesionalDetail,
                title: 'Detalle del Profesional'
            },
            // Cliente y Profesional pueden acceder
            {
                path: 'citas',
                component: Citas,
                title: 'Mis Citas',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.CLIENTE, Role.PROFESIONAL] }
            },
            {
                path: 'citas/cita-reserva',
                component: CitaReserva,
                title: 'Agendar Cita',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.CLIENTE] }
            },
            {
                path: 'citas/:id',
                component: CitaDetail,
                title: 'Detalle de la Cita',
                canActivate: [authGuard]
            },
            {
                path: 'reserva',
                component: CitaReserva,
                title: 'Reserva de Citas',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.CLIENTE] }
            },
            //Admin solo puede acceder
            {
                path: 'categorias',
                component: CategoriasList,
                title: 'Mantenimiento de Categorías',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN] }
            },
            {
                path: 'especialidades',
                component: EspecialidadesList,
                title: 'Mantenimiento de Especialidades',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN] }
            },
            {
                path: 'usuarios',
                component: UsuariosList,
                title: 'Control de Usuarios',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN] }
            },
            {
                path: 'login',
                component: Login,
                title: 'Iniciar sesión'
            },
            {
                path: 'registro',
                component: Registro,
                title: 'Registro de Usuarios'
            },
            {
                path: 'perfil',
                component: Perfil,
                title: 'Mi perfil',
                canActivate: [authGuard]
            },
            {
                path: 'perfil/editar',
                component: EditarPerfil,
                title: 'Editar perfil',
                canActivate: [authGuard]
            },
            //Admin solo puede acceder
            {
                path: 'gestion-citas',
                component: CitasList,
                title: 'Control de Citas',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN] }
            },
            {
                path: 'agenda-visual',
                component: AgendaVisual,
                title: 'Agenda Visual',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN, Role.PROFESIONAL] }
            },
            {
                path: 'reportes/citasPorEstado',
                component: ReporteCitasByEstado,
                title: 'Reportes y Estadísticas de Citas',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN, Role.PROFESIONAL] }
            },
            {
                path: 'reportes/citasPorProfesional',
                component: ReporteCitasByProfesional,
                title: 'Reportes y Estadísticas',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN, Role.PROFESIONAL] }
            },
            {
                path: 'reportes/calificaciones',
                component: ReporteCalificaciones,
                title: 'Reportes y Estadísticas',
                canActivate: [authGuard, roleGuard],
                data: { roles: [Role.ADMIN, Role.PROFESIONAL] }
            },
            {
                path: 'sin-autorizacion',
                component: SinAutorizacion,
                title: 'No autorizado'
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
]; 