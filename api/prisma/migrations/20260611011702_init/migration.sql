-- DropForeignKey
ALTER TABLE `citas` DROP FOREIGN KEY `citas_profesionalId_fkey`;

-- DropIndex
DROP INDEX `citas_profesionalId_fkey` ON `citas`;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_profesionalId_fkey` FOREIGN KEY (`profesionalId`) REFERENCES `perfiles_profesionales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
