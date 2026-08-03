-- AlterTable: optional client RUT, shown on the document only when mostrarRut is true.
ALTER TABLE "Quote" ADD COLUMN "clienteRut" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Quote" ADD COLUMN "mostrarRut" BOOLEAN NOT NULL DEFAULT false;
