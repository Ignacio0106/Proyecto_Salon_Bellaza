import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  // Datos ilustrativos estructurales para marketing estático de la estética.
  // (Recuerda que la lista real de servicios/categorías del marketplace deberá 
  // venir de tu API REST -> Prisma -> MySQL para ser evaluada).
  categoriasDestacadas = [
    { nombre: 'Corte y Peinado', icono: 'content_cut', desc: 'Estilistas expertos en tendencias.' },
    { nombre: 'Cuidado Facial', icono: 'spa', desc: 'Tratamientos orgánicos y relajación.' },
    { nombre: 'Manicura y Pedicura', icono: 'clean_hands', desc: 'Estética y salud para tus manos.' },
    { nombre: 'Maquillaje Profesional', icono: 'brush', desc: 'Para eventos especiales y bodas.' }
  ];
}