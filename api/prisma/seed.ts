import {
    EstadoCita,
    EstadoGeneral,
    EstadoUsuario,
    Modalidad,
    Rol,
} from "../generated/prisma/enums";

import { prisma } from "../src/config/prisma";

async function main() {
    console.log("Iniciando seed completado...");

    // 1. Limpieza de datos en orden para respetar claves foráneas
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

    const hashPassword = "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO";

    // 2. Usuarios (16 mínimo: 1 Admin, 5 Clientes, 10 Profesionales; Activos e Inactivos)
    await prisma.usuario.createMany({
        data: [
            // Admin (1)
            {
                nombre: "Administrador",
                apellidos: "Sistema",
                correo: "admin@belleza.com",
                contrasena: hashPassword,
                telefono: "88888888",
                rol: Rol.ADMINISTRADOR,
                estado: EstadoUsuario.ACTIVO,
            },
            // Clientes (5)
            {
                nombre: "Ana",
                apellidos: "Gómez",
                correo: "ana@correo.com",
                contrasena: hashPassword,
                telefono: "85858585",
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Carlos",
                apellidos: "Mora",
                correo: "carlos@correo.com",
                contrasena: hashPassword,
                telefono: "84848484",
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Lucía",
                apellidos: "Blanco",
                correo: "lucia@correo.com",
                contrasena: hashPassword,
                telefono: "83333333",
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Pedro",
                apellidos: "Navarro",
                correo: "pedro@correo.com",
                contrasena: hashPassword,
                telefono: "82222222",
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Elena",
                apellidos: "Vargas",
                correo: "elena@correo.com",
                contrasena: hashPassword,
                telefono: "81111111",
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.INACTIVO,
            },
            // Profesionales (10)
            {
                nombre: "María",
                apellidos: "Rodríguez",
                correo: "maria@belleza.com",
                contrasena: hashPassword,
                telefono: "87878787",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Sofía",
                apellidos: "López",
                correo: "sofia@belleza.com",
                contrasena: hashPassword,
                telefono: "86868686",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Laura",
                apellidos: "Jiménez",
                correo: "laura@belleza.com",
                contrasena: hashPassword,
                telefono: "83838383",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Valeria",
                apellidos: "Castro",
                correo: "valeria@correo.com",
                contrasena: hashPassword,
                telefono: "82828282",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "José",
                apellidos: "Ramírez",
                correo: "jose@correo.com",
                contrasena: hashPassword,
                telefono: "81818181",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Gabriel",
                apellidos: "Sánchez",
                correo: "gabriel@belleza.com",
                contrasena: hashPassword,
                telefono: "80000001",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Daniela",
                apellidos: "Rojas",
                correo: "daniela@belleza.com",
                contrasena: hashPassword,
                telefono: "80000002",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Esteban",
                apellidos: "Solano",
                correo: "esteban@belleza.com",
                contrasena: hashPassword,
                telefono: "80000003",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.ACTIVO,
            },
            {
                nombre: "Carmen",
                apellidos: "Araya",
                correo: "carmen@belleza.com",
                contrasena: hashPassword,
                telefono: "80000004",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.INACTIVO,
            },
            {
                nombre: "Roberto",
                apellidos: "Fernández",
                correo: "roberto@belleza.com",
                contrasena: hashPassword,
                telefono: "80000005",
                rol: Rol.PROFESIONAL,
                estado: EstadoUsuario.INACTIVO,
            },
        ],
    });

    // 3. Categorías (8 mínimo: Activas e Inactivas)
    await prisma.categoriaServicio.createMany({
        data: [
            { nombre: "Cabello", descripcion: "Servicios de corte y peinado.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Maquillaje", descripcion: "Maquillaje profesional.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Uñas", descripcion: "Manicure y pedicure.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Spa", descripcion: "Tratamientos relajantes.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Barbería", descripcion: "Cortes y arreglo de barba.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Depilación", descripcion: "Cuidado corporal y depilación.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Cuidado Facial", descripcion: "Tratamientos dermatológicos básicos.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Servicios VIP Inactivos", descripcion: "Categoría fuera de temporada.", estado: EstadoGeneral.INACTIVO },
        ],
    });

    // 4. Especialidades (8 activas + 1 inactiva)
    await prisma.especialidad.createMany({
        data: [
            { nombre: "Colorimetría", descripcion: "Tintes y cambios de color.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Peinados", descripcion: "Peinados para eventos.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Maquillaje Social", descripcion: "Maquillaje para celebraciones.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Nail Art", descripcion: "Diseños decorativos para uñas.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Barbería", descripcion: "Cortes masculinos.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Pedicure", descripcion: "Cuidado de pies.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Masajes", descripcion: "Masajes relajantes.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Tratamientos Faciales", descripcion: "Limpiezas e hidratación facial.", estado: EstadoGeneral.ACTIVO },
            { nombre: "Tatuajes Temporales", descripcion: "Servicio fuera de catálogo.", estado: EstadoGeneral.INACTIVO },
        ],
    });

    // 5. Mapeos
    const [usuarios, categorias, especialidades] = await Promise.all([
        prisma.usuario.findMany(),
        prisma.categoriaServicio.findMany(),
        prisma.especialidad.findMany(),
    ]);

    const userMap = Object.fromEntries(usuarios.map((u) => [u.correo, u.id]));
    const categoriaMap = Object.fromEntries(categorias.map((c) => [c.nombre, c.id]));
    const especialidadMap = Object.fromEntries(especialidades.map((e) => [e.nombre, e.id]));

    // 6. Perfiles Profesionales (Exactamente 10 perfiles para los 10 profesionales)
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
            disponible: true,
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
            disponible: true,
        },
    });

    const laura = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["laura@belleza.com"],
            tituloProfesional: "Barbera Profesional",
            descripcion: "Especialista en cortes masculinos.",
            aniosExperiencia: 6,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "Alajuela",
            canton: "Central",
            distrito: "Alajuela",
            tarifaBase: 14000,
            imagenPerfil: "laura.jpg",
            disponible: true,
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
            disponible: true,
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
            disponible: true,
        },
    });

    const gabriel = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["gabriel@belleza.com"],
            tituloProfesional: "Especialista en Uñas",
            descripcion: "Diseños avanzados de Nail Art y manicure.",
            aniosExperiencia: 4,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "San José",
            canton: "Escazú",
            distrito: "Escazú",
            tarifaBase: 13000,
            imagenPerfil: "gabriel.jpg",
            disponible: true,
        },
    });

    const daniela = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["daniela@belleza.com"],
            tituloProfesional: "Cosmetóloga",
            descripcion: "Tratamientos estéticos y cuidado de la piel.",
            aniosExperiencia: 9,
            modalidad: Modalidad.MIXTA,
            provincia: "San José",
            canton: "Curridabat",
            distrito: "Curridabat",
            tarifaBase: 25000,
            imagenPerfil: "daniela.jpg",
            disponible: true,
        },
    });

    const esteban = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["esteban@belleza.com"],
            tituloProfesional: "Estilista Masculino",
            descripcion: "Barbería clásica y corte de cabello.",
            aniosExperiencia: 3,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "Heredia",
            canton: "Barva",
            distrito: "Barva",
            tarifaBase: 12000,
            imagenPerfil: "esteban.jpg",
            disponible: false, // Profesional no disponible
        },
    });

    const carmen = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["carmen@belleza.com"],
            tituloProfesional: "Masajista Terapéutica",
            descripcion: "Terapeutas en masajes descontracturantes.",
            aniosExperiencia: 10,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "Alajuela",
            canton: "San Ramón",
            distrito: "San Ramón",
            tarifaBase: 20000,
            imagenPerfil: "carmen.jpg",
            disponible: false, // Profesional no disponible (y usuario inactivo)
        },
    });

    const roberto = await prisma.perfilProfesional.create({
        data: {
            usuarioId: userMap["roberto@belleza.com"],
            tituloProfesional: "Colorista Sénior",
            descripcion: "Especialista en balayage y cambios radicales.",
            aniosExperiencia: 12,
            modalidad: Modalidad.PRESENCIAL,
            provincia: "San José",
            canton: "Montes de Oca",
            distrito: "San Pedro",
            tarifaBase: 30000,
            imagenPerfil: "roberto.jpg",
            disponible: false, // Profesional no disponible (y usuario inactivo)
        },
    });

    // 7. Especialidades por perfil
    await prisma.profesionalEspecialidad.createMany({
        data: [
            { perfilId: maria.id, especialidadId: especialidadMap["Colorimetría"] },
            { perfilId: maria.id, especialidadId: especialidadMap["Peinados"] },
            { perfilId: sofia.id, especialidadId: especialidadMap["Maquillaje Social"] },
            { perfilId: laura.id, especialidadId: especialidadMap["Barbería"] },
            { perfilId: valeria.id, especialidadId: especialidadMap["Masajes"] },
            { perfilId: jose.id, especialidadId: especialidadMap["Tratamientos Faciales"] },
            { perfilId: gabriel.id, especialidadId: especialidadMap["Nail Art"] },
            { perfilId: daniela.id, especialidadId: especialidadMap["Tratamientos Faciales"] },
            { perfilId: esteban.id, especialidadId: especialidadMap["Barbería"] },
            { perfilId: carmen.id, especialidadId: especialidadMap["Masajes"] },
            { perfilId: roberto.id, especialidadId: especialidadMap["Colorimetría"] },
        ],
    });

    // 8. Servicios (10 servicios: Activos e Inactivos)
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
            estado: EstadoGeneral.INACTIVO, // Servicio inactivo
        },
    });

    const facial = await prisma.servicio.create({
        data: {
            profesionalId: jose.id,
            categoriaId: categoriaMap["Cuidado Facial"],
            nombre: "Tratamiento Facial",
            descripcion: "Limpieza profunda de la piel.",
            precio: 20000,
            duracionEstimada: 70,
            modalidad: Modalidad.VIRTUAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const nailArt = await prisma.servicio.create({
        data: {
            profesionalId: gabriel.id,
            categoriaId: categoriaMap["Uñas"],
            nombre: "Manicure Nail Art",
            descripcion: "Estructura en gel y diseños personalizados.",
            precio: 16000,
            duracionEstimada: 90,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const peeling = await prisma.servicio.create({
        data: {
            profesionalId: daniela.id,
            categoriaId: categoriaMap["Cuidado Facial"],
            nombre: "Peeling Químico",
            descripcion: "Renovación celular profunda.",
            precio: 35000,
            duracionEstimada: 60,
            modalidad: Modalidad.MIXTA,
            estado: EstadoGeneral.ACTIVO,
        },
    });

    const balayage = await prisma.servicio.create({
        data: {
            profesionalId: roberto.id,
            categoriaId: categoriaMap["Cabello"],
            nombre: "Balayage Premium",
            descripcion: "Degradado de color avanzado.",
            precio: 45000,
            duracionEstimada: 180,
            modalidad: Modalidad.PRESENCIAL,
            estado: EstadoGeneral.INACTIVO, // Servicio inactivo
        },
    });

    // 9. Especialidades por servicio
    await prisma.servicioEspecialidad.createMany({
        data: [
            { servicioId: corte.id, especialidadId: especialidadMap["Peinados"] },
            { servicioId: color.id, especialidadId: especialidadMap["Colorimetría"] },
            { servicioId: maquillaje.id, especialidadId: especialidadMap["Maquillaje Social"] },
            { servicioId: barberia.id, especialidadId: especialidadMap["Barbería"] },
            { servicioId: masaje.id, especialidadId: especialidadMap["Masajes"] },
            { servicioId: spaFacial.id, especialidadId: especialidadMap["Tratamientos Faciales"] },
            { servicioId: facial.id, especialidadId: especialidadMap["Tratamientos Faciales"] },
            { servicioId: nailArt.id, especialidadId: especialidadMap["Nail Art"] },
            { servicioId: peeling.id, especialidadId: especialidadMap["Tratamientos Faciales"] },
            { servicioId: balayage.id, especialidadId: especialidadMap["Colorimetría"] },
        ],
    });

// Pares para generación de citas
    const paresProfesionalServicio = [
        { profesional: maria, servicio: corte },
        { profesional: maria, servicio: color },
        { profesional: sofia, servicio: maquillaje },
        { profesional: laura, servicio: barberia },
        { profesional: valeria, servicio: masaje },
        { profesional: valeria, servicio: spaFacial },
        { profesional: jose, servicio: facial },
        { profesional: gabriel, servicio: nailArt },
        { profesional: daniela, servicio: peeling },
        { profesional: roberto, servicio: balayage },
    ];

    const clientesIds = [
        userMap["ana@correo.com"],
        userMap["carlos@correo.com"],
        userMap["lucia@correo.com"],
        userMap["pedro@correo.com"],
        userMap["elena@correo.com"],
    ];

    const estadosDistribucion = [
        EstadoCita.COMPLETADA,
        EstadoCita.COMPLETADA,
        EstadoCita.COMPLETADA,
        EstadoCita.ACEPTADA,
        EstadoCita.PENDIENTE,
        EstadoCita.CANCELADA,
        EstadoCita.RECHAZADA,
    ];

    // 10. Citas (50 mínimo) con fechas coherentes según su estado:
    //     - Completadas, rechazadas y canceladas: fechas pasadas.
    //     - Aceptadas y pendientes: fechas futuras (aún se pueden gestionar).
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diasPasado = [-28, -25, -21, -18, -14, -11, -7, -4, -2];
    const diasFuturoAceptada = [1, 2, 3, 4, 6, 7, 9];
    const diasFuturoPendiente = [2, 4, 5, 8, 10, 12];

    // Horarios espaciados 3 horas para que ningún servicio (duración máxima
    // de 180 minutos) se traslape con otra cita del mismo profesional.
    const horariosDisponibles = [8, 11, 14, 17];
    const slotsOcupados = new Map<string, number>();

    const citasCreadas = [];
    // Contexto de cada cita para poder registrar su historial de estados
    const citasConContexto: Array<{
        cita: { id: number; estado: EstadoCita; clienteId: number };
        profesionalUsuarioId: number;
    }> = [];

    let indicePasado = 0;
    let indiceAceptada = 0;
    let indicePendiente = 0;

    const fechaPorOffset = (offset: number) => {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + offset);
        return fecha;
    };

    for (let citaIndex = 0; citaIndex < 50; citaIndex++) {
        const par = paresProfesionalServicio[citaIndex % paresProfesionalServicio.length];
        const estado = estadosDistribucion[citaIndex % estadosDistribucion.length];
        const clienteId = clientesIds[(citaIndex * 3) % clientesIds.length]; // Variación de clientes

        // Offset de días respecto a hoy según el estado de la cita
        let offsetDia: number;
        if (estado === EstadoCita.ACEPTADA) {
            offsetDia = diasFuturoAceptada[indiceAceptada++ % diasFuturoAceptada.length];
        } else if (estado === EstadoCita.PENDIENTE) {
            offsetDia = diasFuturoPendiente[indicePendiente++ % diasFuturoPendiente.length];
        } else {
            offsetDia = diasPasado[indicePasado++ % diasPasado.length];
        }

        // Si el profesional ya tiene 4 citas ese día, se busca el día
        // siguiente (o anterior en el pasado) con espacio disponible.
        let claveDia = `${par.profesional.id}|${fechaPorOffset(offsetDia).toDateString()}`;
        let slotsUsados = slotsOcupados.get(claveDia) ?? 0;
        while (slotsUsados >= horariosDisponibles.length) {
            offsetDia += offsetDia < 0 ? -1 : 1;
            claveDia = `${par.profesional.id}|${fechaPorOffset(offsetDia).toDateString()}`;
            slotsUsados = slotsOcupados.get(claveDia) ?? 0;
        }
        slotsOcupados.set(claveDia, slotsUsados + 1);

        const fechaCita = fechaPorOffset(offsetDia);

        const horaInicio = new Date(fechaCita);
        horaInicio.setHours(horariosDisponibles[slotsUsados], 0, 0, 0);

        const horaFinalizacion = new Date(horaInicio);
        horaFinalizacion.setMinutes(horaInicio.getMinutes() + par.servicio.duracionEstimada);

        // La solicitud se registra 3 días antes de la fecha agendada
        const fechaCreacion = new Date(fechaCita);
        fechaCreacion.setDate(fechaCita.getDate() - 3);

        const cita = await prisma.cita.create({
            data: {
                clienteId,
                profesionalId: par.profesional.id,
                servicioId: par.servicio.id,
                fechaCreacion,
                fechaCitaSolicitada: fechaCita,
                horaInicio,
                horaFinalizacion,
                modalidad: par.servicio.modalidad,
                estado,
                comentarioNecesidad: `Solicitud de cita de prueba #${citaIndex + 1}`,
                comentarioProfesional:
                    estado === EstadoCita.COMPLETADA
                        ? "Servicio finalizado con éxito."
                        : estado === EstadoCita.ACEPTADA
                          ? "Cita confirmada, lo esperamos."
                          : null,
                montoCalculado: par.servicio.precio,
            },
        });

        citasCreadas.push(cita);
        citasConContexto.push({
            cita: { id: cita.id, estado: cita.estado, clienteId: cita.clienteId },
            profesionalUsuarioId: par.profesional.usuarioId,
        });
    }

    // Historial de estados coherente para cada cita no pendiente.
    // Las rechazadas/canceladas registran su motivo, como exige la matriz
    // de transición de estados, y las completadas registran los dos pasos.
    const motivosRechazo = [
        "No cuento con disponibilidad en ese horario.",
        "No puedo atender esa fecha, tengo un compromiso previo.",
        "Ese servicio no lo ofrezco actualmente.",
    ];
    const motivosCancelacionCliente = [
        "Tuve un imprevisto y no podré asistir.",
        "Prefiero reprogramar la cita para otra fecha.",
    ];
    const motivoCancelacionProfesional =
        "Se cancela por mantenimiento del local en esa jornada.";

    let rechazoIndex = 0;
    let cancelIndex = 0;

    for (const registro of citasConContexto) {
        const { cita, profesionalUsuarioId } = registro;

        if (cita.estado === EstadoCita.PENDIENTE) {
            continue;
        }

        if (cita.estado === EstadoCita.ACEPTADA) {
            await prisma.historialEstadoCita.create({
                data: {
                    citaId: cita.id,
                    estadoAnterior: EstadoCita.PENDIENTE,
                    estadoNuevo: EstadoCita.ACEPTADA,
                    comentario: "Cita confirmada por el profesional.",
                    realizadoPorId: profesionalUsuarioId,
                },
            });
            continue;
        }

        if (cita.estado === EstadoCita.COMPLETADA) {
            // La cita completada registra sus dos pasos:
            // PENDIENTE -> ACEPTADA -> COMPLETADA
            await prisma.historialEstadoCita.create({
                data: {
                    citaId: cita.id,
                    estadoAnterior: EstadoCita.PENDIENTE,
                    estadoNuevo: EstadoCita.ACEPTADA,
                    comentario: null,
                    realizadoPorId: profesionalUsuarioId,
                },
            });
            await prisma.historialEstadoCita.create({
                data: {
                    citaId: cita.id,
                    estadoAnterior: EstadoCita.ACEPTADA,
                    estadoNuevo: EstadoCita.COMPLETADA,
                    comentario: "Servicio finalizado con éxito.",
                    realizadoPorId: profesionalUsuarioId,
                },
            });
            continue;
        }

        if (cita.estado === EstadoCita.RECHAZADA) {
            await prisma.historialEstadoCita.create({
                data: {
                    citaId: cita.id,
                    estadoAnterior: EstadoCita.PENDIENTE,
                    estadoNuevo: EstadoCita.RECHAZADA,
                    comentario:
                        motivosRechazo[rechazoIndex % motivosRechazo.length],
                    realizadoPorId: profesionalUsuarioId,
                },
            });
            rechazoIndex++;
            continue;
        }

        if (cita.estado === EstadoCita.CANCELADA) {
            // Se alternan cancelaciones del cliente y del profesional
            const cancelaCliente = cancelIndex % 2 === 0;

            await prisma.historialEstadoCita.create({
                data: {
                    citaId: cita.id,
                    estadoAnterior: EstadoCita.PENDIENTE,
                    estadoNuevo: EstadoCita.CANCELADA,
                    comentario: cancelaCliente
                        ? motivosCancelacionCliente[
                              Math.floor(cancelIndex / 2) %
                                  motivosCancelacionCliente.length
                          ]
                        : motivoCancelacionProfesional,
                    realizadoPorId: cancelaCliente
                        ? cita.clienteId
                        : profesionalUsuarioId,
                },
            });
            cancelIndex++;
        }
    }

    // 11. Reseñas: TODAS las citas completadas reciben una reseña con
    //     calificaciones variadas, para que los promedios por profesional
    //     sean reales y los reportes muestren datos completos.
    const citasCompletadas = citasCreadas.filter((c) => c.estado === EstadoCita.COMPLETADA);

    const calificaciones = [
        { puntuacion: 5, comentario: "Excelente servicio, superó mis expectativas." },
        { puntuacion: 5, comentario: "Muy profesional y puntual." },
        { puntuacion: 4, comentario: "Buena atención y buenos productos." },
        { puntuacion: 4, comentario: "Todo estuvo bien, lo recomiendo." },
        { puntuacion: 3, comentario: "Aceptable, el tiempo de espera fue alto." },
        { puntuacion: 2, comentario: "No quedé del todo conforme con el resultado." },
        { puntuacion: 1, comentario: "Pésima experiencia, no lo recomiendo." },
        { puntuacion: 5, comentario: "Increíble trabajo, definitivamente regresaré." },
    ];

    for (let i = 0; i < citasCompletadas.length; i++) {
        const cita = citasCompletadas[i];
        const resenaData = calificaciones[i % calificaciones.length];

        await prisma.resena.create({
            data: {
                citaId: cita.id,
                clienteId: cita.clienteId,
                profesionalId: cita.profesionalId,
                puntuacion: resenaData.puntuacion,
                comentario: resenaData.comentario,
            },
        });
    }

    console.log(
        `Seed completado: ${citasCompletadas.length} citas completadas con su reseña.`
    );

    console.log("Seed completado exitosamente cumpliendo con todas las cuotas de datos.");
}

main()
    .catch((e) => {
        console.error("Error en el seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });