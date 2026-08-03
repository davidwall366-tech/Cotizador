-- AlterTable: new accessory rates for cajones. Default 0 so they don't
-- appear on quotes until an admin sets a real value via /tarifas.
ALTER TABLE "Tarifa" ADD COLUMN "zunchos" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Tarifa" ADD COLUMN "tapas" INTEGER NOT NULL DEFAULT 0;
