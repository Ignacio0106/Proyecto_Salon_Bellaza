import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-sin-autorizacion',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sin-autorizacion.html',
  styleUrl: './sin-autorizacion.css',
})
export class SinAutorizacion {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  regresar(): void {
    this.location.back();
  }
  irAlInicio(): void {
    void this.router.navigate(['/inicio']);
  }
}
