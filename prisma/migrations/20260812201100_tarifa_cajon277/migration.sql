-- AlterTable: fabrication rate for Cajón 2,77 m³, same default as the other
-- standard-size crates.
ALTER TABLE "Tarifa" ADD COLUMN "fabricacionCajon277" INTEGER NOT NULL DEFAULT 84000;
