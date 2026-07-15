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
import { ReportesDashboard } from './pages/reportes/reportes-dashboard/reportes-dashboard';
import { ServiciosList } from './pages/servicios/servicios-list/servicios-list';
import { ServicioDetail } from './pages/servicios/servicio-detail/servicio-detail';
import { ServicioCreatePage } from './pages/servicios/servicios-create/servicios-create';
import { ServicioEditPage } from './pages/servicios/servicios-edit/servicios-edit';
import { ProfesionalEdit } from './pages/profesionales/profesional-edit/profesional-edit';
import { ProfesionalCreate } from './pages/profesionales/profesional-create/profesional-create';

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
            { 
                path: 'servicios/create', 
                component: ServicioCreatePage,
                title: 'Crear Servicio' 
            },
            { 
                path: 'servicios/edit/:id', 
                component: ServicioEditPage,
                title: 'Editar Servicio' 
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
            { 
                path: 'profesionales/create', 
                component: ProfesionalCreate,
                title: 'Crear Profesional' 
            },
            { 
                path: 'profesionales/:id', 
                component: ProfesionalDetail,
                title: 'Detalle del Profesional' 
            }, 
            { 
                path: 'profesionales/edit/:id',
                component: ProfesionalEdit,
                title: 'Editar Profesional' 
            },
            { 
                path: 'citas', 
                component: Citas,
                title: 'Mis Citas' 
            },
            { 
                path: 'citas/cita-reserva', 
                component: CitaReserva,
                title: 'Agendar Cita' 
            },
            {
                path: 'citas/:id',
                component: CitaDetail,
                title: 'Detalle de la Cita'
            },
            { 
                path: 'reserva', // Destino del icono del calendario en el header
                component: CitaReserva,
                title: 'Reserva de Citas' 
            },

            // ==========================================
            // MANTENIMIENTOS (ADMINISTRADOR)
            // ==========================================
            { 
                path: 'categorias', 
                component: CategoriasList,
                title: 'Mantenimiento de Categorías' 
            },
            { 
                path: 'especialidades', 
                component: EspecialidadesList,
                title: 'Mantenimiento de Especialidades' 
            },
            { 
                path: 'usuarios', 
                component: UsuariosList,
                title: 'Control de Usuarios' 
            },

            // ==========================================
            // GESTIÓN (ADMIN / PROFESIONAL)
            // ==========================================
            { 
                path: 'gestion-citas', 
                component: CitasList,
                title: 'Control de Citas' 
            },
            { 
                path: 'resenas', 
                component: ResenasList,
                title: 'Gestión de Reseñas' 
            },
            { 
                path: 'reportes', 
                component: ReportesDashboard,
                title: 'Reportes y Estadísticas' 
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
