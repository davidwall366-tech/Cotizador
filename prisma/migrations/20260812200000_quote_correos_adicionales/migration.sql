-- AlterTable: optional extra recipient addresses for the formal quote email.
ALTER TABLE "Quote" ADD COLUMN "correosAdicionales" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Quote" ADD COLUMN "enviarCorreosAdicionales" BOOLEAN NOT NULL DEFAULT false;
