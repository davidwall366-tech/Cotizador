-- Correos adicionales are now always sent (no opt-in checkbox); drop the
-- now-unused gate column.
ALTER TABLE "Quote" DROP COLUMN "enviarCorreosAdicionales";

-- Optional brand/model detail for Vehículos items.
ALTER TABLE "QuoteItem" ADD COLUMN "vehiculoDesc" TEXT NOT NULL DEFAULT '';
