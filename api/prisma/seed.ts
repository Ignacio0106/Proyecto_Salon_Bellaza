import {
    EstadoCita,
    EstadoGeneral,
    EstadoUsuario,
    Modalidad,
    Rol,
} from "../generated/prisma/enums";

import { prisma } from "../src/config/prisma";

async function main() {
    console.log("Iniciando seed...");

    // 1. Limpieza de datos
    const models = [
        prisma.resena,
        prisma.historialEstadoCita,
        prisma.cita,
        prisma.servicioEspecialidad,
        prisma.profesionalEspecialidad,
        prisma.servicio,
        prisma.perfilProfesional,
        prisma.especialidad,
        prisma.categoriaServicio,
        prisma.usuario,
    ];

    for (const model of models) {
        await (model as any).deleteMany();
    }

    // 2. Usuarios
    await prisma.usuario.createMany({
        data: [
            {
                nombre: "Administrador",
                apellidos: "Sistema",
                correo: "admin@belleza.com",
                contrasena: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "88888888",
                rol: Rol.ADMINISTRADOR,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "María",
                apellidos: "Rodríguez",
                correo: "maria@belleza.com",
                contrasena: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "87878787",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Sofía",
                apellidos: "López",
                correo: "sofia@belleza.com",
                contrasena: "2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "86868686",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Ana",
                apellidos: "Gómez",
                correo: "ana@correo.com",
                contrasena: "2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "85858585",
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Carlos",
                apellidos: "Mora",
                correo: "carlos@correo.com",
                contrasena: "2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "84848484",
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Laura",
                apellidos: "Jiménez",
                correo: "laura@belleza.com",
                contrasena: "2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "83838383",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Valeria",
                apellidos: "Castro",
                correo: "valeria@correo.com",
                contrasena: "2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "82828282",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "José",
                apellidos: "Ramírez",
                correo: "jose@correo.com",
                contrasena: "2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                telefono: "81818181",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
        ],
    });

    // 3. Categorías
    await prisma.categoriaServicio.createMany({
        data: [
            {
                nombre: "Cabello",
                descripcion: "Servicios de corte y peinado.",
            },
            {
                nombre: "Maquillaje",
                descripcion: "Maquillaje profesional.",
            },
            {
                nombre: "Uñas",
                descripcion: "Manicure y pedicure.",
            },
            {
                nombre: "Spa",
                descripcion: "Tratamientos relajantes.",
            },
            {
                nombre: "Barbería",
                descripcion: "Cortes y arreglo de barba.",
            },
        ],
    });

    // 4. Especialidades
    await prisma.especialidad.createMany({
        data: [
            {
                nombre: "Colorimetría",
                descripcion: "Tintes y cambios de color.",
            },
            {
                nombre: "Peinados",
                descripcion: "Peinados para eventos.",
            },
            {
                nombre: "Maquillaje Social",
                descripcion: "Maquillaje para celebraciones.",
            },
            {
                nombre: "Nail Art",
                descripcion: "Diseños decorativos para uñas.",
            },
            {
                nombre: "Barbería",
                descripcion: "Cortes masculinos.",
            },
            {
                nombre: "Pedicure",
                descripcion: "Cuidado de pies.",
            },
            {
                nombre: "Masajes",
                descripcion: "Masajes relajantes.",
            },
            {
                nombre: "Tratamientos Faciales",
                descripcion: "Limpiezas e hidratación facial.",
            },
        ],
    });

    // 5. Obtener registros
    const [usuarios, categorias, especialidades] = await Promise.all([
        prisma.usuario.findMany(),
        prisma.categoriaServicio.findMany(),
        prisma.especialidad.findMany(),
    ]);

    const userMap = Object.fromEntries(
        usuarios.map((u) => [u.correo, u.id])
    );

    const categoriaMap = Object.fromEntries(
        categorias.map((c) => [c.nombre, c.id])
    );

    const especialidadMap = Object.fromEntries(
        especialidades.map((e) => [e.nombre, e.id])
    );

    // 6. Perfiles profesionales
    const maria = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["maria@belleza.com"],
            tituloProfesional: "Estilista Profesional",
            descripcion: "Especialista en color y peinados.",
            aniosExperiencia: 8,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "San José",
            canton: "Central",
            distrito: "Carmen",
            tarifaBase: 15000,
            imagenPerfil: "maria.jpg",
        },
    });

    const sofia = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["sofia@belleza.com"],
            tituloProfesional: "Maquillista Profesional",
            descripcion: "Experta en maquillaje social.",
            aniosExperiencia: 5,
            modalidad: Modalidad.MIXTA,
            provincia: "Heredia",
            canton: "Heredia",
            distrito: "Mercedes",
            tarifaBase: 18000,
            imagenPerfil: "sofia.jpg",
        },
    });

    const laura = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["laura@belleza.com"],
            tituloProfesional: "Barbera Profesional",
            descripcion: "Especialista en cortes masculinos y barbería moderna.",
            aniosExperiencia: 6,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "Alajuela",
            canton: "Central",
            distrito: "Alajuela",
            tarifaBase: 14000,
            imagenPerfil: "laura.jpg",
        },
    });

    const valeria = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["valeria@correo.com"],
            tituloProfesional: "Especialista en Spa",
            descripcion: "Masajes relajantes y tratamientos corporales.",
            aniosExperiencia: 7,
            modalidad: Modalidad.MIXTA,
            provincia: "Cartago",
            canton: "Central",
            distrito: "Oriental",
            tarifaBase: 22000,
            imagenPerfil: "valeria.jpg",
        },
    });

    const jose = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["jose@correo.com"],
            tituloProfesional: "Especialista en Tratamientos Faciales",
            descripcion: "Limpiezas faciales e hidratación profesional.",
            aniosExperiencia: 5,
            modalidad: Modalidad.VIRTUAL,
            provincia: "Heredia",
            canton: "Heredia",
            distrito: "Mercedes",
            tarifaBase: 16000,
            imagenPerfil: "jose.jpg",
        },
    });

    // 7. Especialidades por perfil
    await prisma.profesionalEspecialidad.createMany({
        data: [
            {
                perfilId: maria.id,
                especialidadId: especialidadMap["Colorimetría"],
            },
            {
                perfilId: maria.id,
                especialidadId: especialidadMap["Peinados"],
            },
            {
                perfilId: sofia.id,
                especialidadId: especialidadMap["Maquillaje Social"],
            },
            {
                perfilId: laura.id,
                especialidadId: especialidadMap["Barbería"],
            },
            {
                perfilId: valeria.id,
                especialidadId: especialidadMap["Masajes"],
            },
            {
                perfilId: jose.id,
                especialidadId: especialidadMap["Tratamientos Faciales"],
            },
            {
                perfilId: jose.id,
                especialidadId: especialidadMap["Pedicure"],
            },
        ],
    });

    // 8. Servicios

    const corte = await prisma.servicio.create({
        data: {
            profesionalId: maria.id,
            categoriaId: categoriaMap["Cabello"],
            nombre: "Corte y Peinado",
            descripcion: "Incluye lavado, corte y peinado.",
            precio: 12000,
            duracionEstimada: 60,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const color = await prisma.servicio.create({
        data: {
            profesionalId: maria.id,
            categoriaId: categoriaMap["Cabello"],
            nombre: "Coloración Profesional",
            descripcion: "Cambio de color completo.",
            precio: 28000,
            duracionEstimada: 150,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const maquillaje = await prisma.servicio.create({
        data: {
            profesionalId: sofia.id,
            categoriaId: categoriaMap["Maquillaje"],
            nombre: "Maquillaje para Eventos",
            descripcion: "Maquillaje profesional para cualquier ocasión.",
            precio: 25000,
            duracionEstimada: 90,
            modalidad: Modalidad.MIXTA,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const maquillajeNovia = await prisma.servicio.create({
        data: {
            profesionalId: sofia.id,
            categoriaId: categoriaMap["Maquillaje"],
            nombre: "Maquillaje para Novias",
            descripcion: "Incluye prueba previa.",
            precio: 40000,
            duracionEstimada: 120,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const barberia = await prisma.servicio.create({
        data: {
            profesionalId: laura.id,
            categoriaId: categoriaMap["Barbería"],
            nombre: "Corte Masculino",
            descripcion: "Corte moderno con acabado profesional.",
            precio: 10000,
            duracionEstimada: 45,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const barba = await prisma.servicio.create({
        data: {
            profesionalId: laura.id,
            categoriaId: categoriaMap["Barbería"],
            nombre: "Barba Premium",
            descripcion: "Perfilado y arreglo de barba.",
            precio: 8000,
            duracionEstimada: 30,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const masaje = await prisma.servicio.create({
        data: {
            profesionalId: valeria.id,
            categoriaId: categoriaMap["Spa"],
            nombre: "Masaje Relajante",
            descripcion: "Masaje corporal completo.",
            precio: 22000,
            duracionEstimada: 60,
            modalidad: Modalidad.MIXTA,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const spaFacial = await prisma.servicio.create({
        data: {
            profesionalId: valeria.id,
            categoriaId: categoriaMap["Spa"],
            nombre: "Spa Facial",
            descripcion: "Limpieza e hidratación facial.",
            precio: 18000,
            duracionEstimada: 50,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.INACTIVO,
        },
    });

    const facial = await prisma.servicio.create({
        data: {
            profesionalId: jose.id,
            categoriaId: categoriaMap["Spa"],
            nombre: "Tratamiento Facial",
            descripcion: "Limpieza profunda de la piel.",
            precio: 20000,
            duracionEstimada: 70,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const pedicure = await prisma.servicio.create({
        data: {
            profesionalId: jose.id,
            categoriaId: categoriaMap["Uñas"],
            nombre: "Pedicure Profesional",
            descripcion: "Pedicure completo con exfoliación.",
            precio: 14000,
            duracionEstimada: 60,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    // 9. Especialidades por servicio
    // 9. Especialidades por servicio

    await prisma.servicioEspecialidad.createMany({
        data: [
            {
                servicioId: corte.id,
                especialidadId: especialidadMap["Peinados"],
            },
            {
                servicioId: color.id,
                especialidadId: especialidadMap["Colorimetría"],
            },
            {
                servicioId: maquillaje.id,
                especialidadId: especialidadMap["Maquillaje Social"],
            },
            {
                servicioId: maquillajeNovia.id,
                especialidadId: especialidadMap["Maquillaje Social"],
            },
            {
                servicioId: barberia.id,
                especialidadId: especialidadMap["Barbería"],
            },
            {
                servicioId: barba.id,
                especialidadId: especialidadMap["Barbería"],
            },
            {
                servicioId: masaje.id,
                especialidadId: especialidadMap["Masajes"],
            },
            {
                servicioId: spaFacial.id,
                especialidadId: especialidadMap["Tratamientos Faciales"],
            },
            {
                servicioId: facial.id,
                especialidadId: especialidadMap["Tratamientos Faciales"],
            },
            {
                servicioId: pedicure.id,
                especialidadId: especialidadMap["Pedicure"],
            },
        ],
    });

    const servicios = [
        corte,
        color,
        maquillaje,
        maquillajeNovia,
        barberia,
        barba,
        masaje,
        spaFacial,
        facial,
        pedicure,
    ];

    const profesionales = [
        maria,
        maria,
        sofia,
        sofia,
        laura,
        laura,
        valeria,
        valeria,
        jose,
        jose,
    ];

    const clientes = [
        userMap["ana@correo.com"],
        userMap["carlos@correo.com"],
    ];

    // 10. Citas
    const cita1 = await prisma.cita.create({
        data: {
            clienteId: userMap["ana@correo.com"],
            profesionalId: maria.id,
            servicioId: corte.id,
            fechaCitaSolicitada: new Date("2026-06-20"),
            horaInicio: new Date("2026-06-20T09:00:00"),
            horaFinalizacion: new Date("2026-06-20T10:00:00"),
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoCita.COMPLETADA,
            comentarioNecesidad: "Quiero un cambio de look.",
            comentarioProfesional:
                "Se realizó corte y peinado.",
            montoCalculado: 12000,
        },
    });
    // Citas adicionales
    for (let i = 0; i < 10; i++) {
        await prisma.cita.create({
            data: {
                clienteId: clientes[i % clientes.length],
                profesionalId: profesionales[i].id,
                servicioId: servicios[i].id,
                fechaCitaSolicitada: new Date(`2026-07-${String(i + 1).padStart(2, "0")}`),
                horaInicio: new Date(`2026-07-${String(i + 1).padStart(2, "0")}T09:00:00`),
                horaFinalizacion: new Date(`2026-07-${String(i + 1).padStart(2, "0")}T10:00:00`),
                modalidad: servicios[i].modalidad,
                estado: i % 3 === 0
                    ? EstadoCita.PENDIENTE
                    : i % 3 === 1
                        ? EstadoCita.ACEPTADA
                        : EstadoCita.COMPLETADA,
                comentarioNecesidad: `Cita de prueba ${i + 1}`,
                montoCalculado: servicios[i].precio,
            },
        });
    }

    await prisma.historialEstadoCita.create({
        data: {
            citaId: cita1.id,
            estadoAnterior: EstadoCita.PENDIENTE,
            estadoNuevo: EstadoCita.COMPLETADA,
            comentario: "Cita completada exitosamente.",
            realizadoPorId: userMap["maria@belleza.com"],
        },
    });

    await prisma.cita.create({
        data: {
            clienteId: userMap["carlos@correo.com"],
            profesionalId: sofia.id,
            servicioId: maquillaje.id,
            fechaCitaSolicitada: new Date("2026-06-25"),
            horaInicio: new Date("2026-06-25T14:00:00"),
            horaFinalizacion: new Date("2026-06-25T15:30:00"),
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoCita.PENDIENTE,
            comentarioNecesidad:
                "Maquillaje para graduación.",
            montoCalculado: 25000,
        },
    });

    // 11. Reseñas
    await prisma.resena.create({
        data: {
            citaId: cita1.id,
            clienteId: userMap["ana@correo.com"],
            profesionalId: maria.id,
            puntuacion: 5,
            comentario:
                "Excelente atención y resultado.",
        },
    });

    console.log("Seed completado con éxito.");
}

main()
    .catch((e) => {
        console.error("Error en seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });