# Salón BellaZa — Sistema de Gestión de Citas

Sistema web para la gestión integral de citas de un salón de belleza: catálogo de servicios, perfiles profesionales, agenda visual, reseñas y reportes estadísticos.

Proyecto desarrollado para el curso **ISW-811 Aplicaciones Web utilizando Software Libre** (Avance 2 — Integrador Final).

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | Node.js LTS, Express 5, TypeScript |
| Persistencia | Prisma ORM v7 + MySQL (compatible MariaDB) |
| Frontend | Angular 21 (componentes standalone, signals) |
| UI | Angular Material 21, FullCalendar 6, ApexCharts |
| Autenticación | JWT (jsonwebtoken) + bcryptjs |

## Estructura del proyecto

```
Proyecto_Salon_Bellaza/
├── api/     → API REST (Express + Prisma + MySQL)
├── app/     → Frontend (Angular + Angular Material)
└── README.md
```

## Requisitos previos

- [Node.js LTS](https://nodejs.org) (v20 o superior) y npm
- MySQL 8 o MariaDB en ejecución local
- Puerto `3000` (API) y `4200` (Angular) disponibles

---

## Instalación y ejecución

### 1. Base de datos

Crear la base de datos (si no existe):

```sql
CREATE DATABASE marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (`api/`)

**a)** Crear el archivo `.env` dentro de la carpeta `api/` con las variables:

```env
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@localhost:3306/marketplace"
DATABASE_USER="root"
DATABASE_PASSWORD="123456"
DATABASE_NAME="marketplace"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
JWT_SECRET="cambiar_por_un_secreto_seguro"
```

> Ajuste `USUARIO`, `CONTRASEÑA`, puerto y nombre de base según su entorno local. `JWT_SECRET` debe reemplazarse por un valor propio.

**b)** Instalar dependencias:

```bash
cd api
npm install
```

**c)** Ejecutar las migraciones de Prisma (crea todas las tablas):

```bash
npx prisma migrate deploy
```

**d)** Cargar los datos iniciales (seeders):

```bash
npx prisma db seed
```

Los seeders reconstruyen todo el escenario de pruebas: usuarios de los tres roles, perfiles profesionales, categorías, especialidades, servicios, citas en los cinco estados (con historial de estados y motivos), y reseñas variadas.

**e)** Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`.

### 3. Frontend (`app/`)

**a)** Verificar la URL del API en `app/src/environments/environment.development.ts`:

```ts
export const environment = {
  apiUrl: 'http://localhost:3000',
};
```

**b)** Instalar dependencias y ejecutar:

```bash
cd app
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

---

## Credenciales de prueba (tras ejecutar el seed)

Todos los usuarios generados por el seed usan la contraseña: **`123456`**

| Rol | Correo |
|-----|--------|
| Administrador | `admin@belleza.com` |
| Cliente | `ana@correo.com` |
| Cliente | `carlos@correo.com` |
| Profesional | `maria@belleza.com` |
| Profesional | `sofia@belleza.com` |

El registro público crea únicamente cuentas con rol **Cliente**.

## Roles y accesos principales

- **Administrador:** gestión de usuarios, categorías, especialidades, control de citas (todas), agenda general con filtros y reportes globales.
- **Profesional:** perfil profesional, servicios propios, agenda personal, gestión de solicitudes (aceptar / rechazar / completar / cancelar) y su reporte individual.
- **Cliente:** catálogo de servicios y profesionales, solicitud de citas, historial cronológico ("Mis Citas"), cancelación con motivo y reseñas de citas completadas.

## Reglas de negocio principales

- Las citas se crean en estado **Pendiente**; el cliente no elige el estado.
- No se permiten fechas pasadas ni traslapes de horario del mismo profesional.
- La hora de finalización se calcula con la duración del servicio; el monto queda fijo al momento de la reserva.
- Matriz de transiciones: Pendiente → Aceptada / Rechazada / Cancelada · Aceptada → Completada / Cancelada. Rechazar y cancelar exigen motivo; completar solo después de la fecha y hora programadas.
- Una sola reseña por cita completada, únicamente del cliente dueño de la cita.
- Reportes calculados desde datos reales (umbral de baja calificación: promedio < 3.0).

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` (en `api/`) | API en modo desarrollo con recarga |
| `npm run build` (en `api/`) | Compilar el backend a `dist/` |
| `npm start` (en `app/`) | Frontend en modo desarrollo |
| `npm run build` (en `app/`) | Compilar producción en `dist/app` |
| `npx prisma migrate deploy` | Aplicar migraciones pendientes |
| `npx prisma db seed` | Reiniciar datos iniciales |
