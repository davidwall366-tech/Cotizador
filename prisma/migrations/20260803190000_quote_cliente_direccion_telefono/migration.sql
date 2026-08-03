-- AlterTable: optional client address/phone, each independently toggled to
-- appear on the formal document (same pattern as clienteRut/mostrarRut).
ALTER TABLE "Quote" ADD COLUMN "clienteDireccion" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Quote" ADD COLUMN "mostrarDireccion" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Quote" ADD COLUMN "clienteTelefono" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Quote" ADD COLUMN "mostrarTelefono" BOOLEAN NOT NULL DEFAULT false;
