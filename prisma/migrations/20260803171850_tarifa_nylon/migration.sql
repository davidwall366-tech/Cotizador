-- AlterTable: new accessory rate for cajones. Default 0 so it doesn't
-- appear on quotes until an admin sets a real value via /tarifas.
ALTER TABLE "Tarifa" ADD COLUMN "nylon" INTEGER NOT NULL DEFAULT 0;
