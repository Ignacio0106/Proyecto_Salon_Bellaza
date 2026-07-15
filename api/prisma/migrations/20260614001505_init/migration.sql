/*
  Warnings:

  - You are about to drop the column `anosExperiencia` on the `perfiles_profesionales` table. All the data in the column will be lost.
  - You are about to drop the column `tarifaBaseHora` on the `perfiles_profesionales` table. All the data in the column will be lost.
  - You are about to drop the column `tituloProf` on the `perfiles_profesionales` table. All the data in the column will be lost.
  - You are about to drop the `especialidades_perfiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `especialidades_servicios` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `aniosExperiencia` to the `perfiles_profesionales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tarifaBase` to the `perfiles_profesionales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tituloProfesional` to the `perfiles_profesionales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `especialidades_perfiles` DROP FOREIGN KEY `especialidades_perfiles_especialidadId_fkey`;

-- DropForeignKey
ALTER TABLE `especialidades_perfiles` DROP FOREIGN KEY `especialidades_perfiles_perfilId_fkey`;

-- DropForeignKey
ALTER TABLE `especialidades_servicios` DROP FOREIGN KEY `especialidades_servicios_especialidadId_fkey`;

-- DropForeignKey
ALTER TABLE `especialidades_servicios` DROP FOREIGN KEY `especialidades_servicios_servicioId_fkey`;

-- AlterTable
ALTER TABLE `perfiles_profesionales` DROP COLUMN `anosExperiencia`,
    DROP COLUMN `tarifaBaseHora`,
    DROP COLUMN `tituloProf`,
    ADD COLUMN `aniosExperiencia` INTEGER NOT NULL,
    ADD COLUMN `tarifaBase` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `tituloProfesional` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `especialidades_perfiles`;

-- DropTable
DROP TABLE `especialidades_servicios`;

-- CreateTable
CREATE TABLE `profesionales_especialidades` (
    `perfilId` INTEGER NOT NULL,
    `especialidadId` INTEGER NOT NULL,

    PRIMARY KEY (`perfilId`, `especialidadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios_especialidades` (
    `servicioId` INTEGER NOT NULL,
    `especialidadId` INTEGER NOT NULL,

    PRIMARY KEY (`servicioId`, `especialidadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_estado_citas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citaId` INTEGER NOT NULL,
    `estadoAnterior` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NULL,
    `estadoNuevo` ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'COMPLETADA') NOT NULL,
    `fechaCambio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `comentario` TEXT NULL,
    `realizadoPorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profesionales_especialidades` ADD CONSTRAINT `profesionales_especialidades_perfilId_fkey` FOREIGN KEY (`perfilId`) REFERENCES `perfiles_profesionales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profesionales_especialidades` ADD CONSTRAINT `profesionales_especialidades_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `especialidades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicios_especialidades` ADD CONSTRAINT `servicios_especialidades_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `servicios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicios_especialidades` ADD CONSTRAINT `servicios_especialidades_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `especialidades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_estado_citas` ADD CONSTRAINT `historial_estado_citas_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `citas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_estado_citas` ADD CONSTRAINT `historial_estado_citas_realizadoPorId_fkey` FOREIGN KEY (`realizadoPorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resenas` ADD CONSTRAINT `resenas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resenas` ADD CONSTRAINT `resenas_profesionalId_fkey` FOREIGN KEY (`profesionalId`) REFERENCES `perfiles_profesionales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
