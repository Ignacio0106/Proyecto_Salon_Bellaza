import { prisma } from "../config/prisma"; 
import { CrearResenaDto } from "../dtos/resena.dto";
import { AppError } from "../utils/app-error";
 
export const ResenaService = { 
    async listar() { 
        return await prisma.resena.findMany(); 
    }, 

    async obtenerPorId(id: number) {
        return await prisma.resena.findUnique({
            where: { id }
        });
    },

    // Registra la reseña de una cita completada.
    // Regla: una reseña por cita, y solo la puede crear el cliente dueño
    // de la cita, una vez que esta quedó en estado COMPLETADA.
    async crear(data: CrearResenaDto, clienteId: number) {
        const cita = await prisma.cita.findUnique({
            where: { id: data.citaId },
            include: { resena: { select: { id: true } } },
        });

        if (!cita) {
            throw AppError.badRequest("La cita indicada no existe");
        }

        if (cita.clienteId !== clienteId) {
            throw AppError.forbidden(
                "No puede reseñar una cita que no le pertenece"
            );
        }

        if (cita.estado !== "COMPLETADA") {
            throw AppError.conflict(
                "Solo se pueden reseñar citas completadas"
            );
        }

        if (cita.resena) {
            throw AppError.conflict(
                "Esta cita ya tiene una reseña registrada"
            );
        }

        return prisma.resena.create({
            data: {
                citaId: cita.id,
                clienteId,
                profesionalId: cita.profesionalId,
                puntuacion: data.puntuacion,
                comentario: data.comentario,
            },
        });
    },
}; 

