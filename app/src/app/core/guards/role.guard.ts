import { inject } from '@angular/core';

import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
} from '@angular/router';

import { map } from 'rxjs';


import { Role } from '../models/role.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn =
    (route: ActivatedRouteSnapshot) => {
        const authService =
            inject(AuthService);

        const router =
            inject(Router);

        const rolesPermitidos =
            route.data['roles'] as
            Role[] | undefined;

        if (!rolesPermitidos?.length) {
            return true;
        }

        const validarRol = () =>
            authService.tieneRol(
                rolesPermitidos
            )
                ? true
                : router.createUrlTree([
                    '/sin-autorizacion',
                ]);

        if (authService.autenticado()) {
            return validarRol();
        }

        return authService
            .inicializarSesion()
            .pipe(
                map((usuario) =>
                    usuario
                        ? validarRol()
                        : router.createUrlTree([
                            '/login',
                        ])
                )
            );
    };