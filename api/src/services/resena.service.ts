import { prisma } from "../config/prisma"; 
 
export const ResenaService = { 
    async listar() { 
        return await prisma.resena.findMany(); 
    }, 

    async obtenerPorId(id: number) {
        return await prisma.resena.findUnique({
            where: { id }
        });
    }
}; 

