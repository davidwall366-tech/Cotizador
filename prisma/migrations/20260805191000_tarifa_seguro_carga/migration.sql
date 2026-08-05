-- AlterTable: cargo insurance rate, $ per m³. Default 0 so it doesn't appear
-- on quotes until an admin sets a real value via /tarifas.
ALTER TABLE "Tarifa" ADD COLUMN "seguroCargaPorM3" INTEGER NOT NULL DEFAULT 0;
