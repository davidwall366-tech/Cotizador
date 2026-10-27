-- venta_contenedor items: closed amount (CLP) for the item and an optional
-- per-item discount percentage; 0 for every other type.
ALTER TABLE "QuoteItem" ADD COLUMN "ventaPrecio" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "QuoteItem" ADD COLUMN "ventaDescuentoPct" INTEGER NOT NULL DEFAULT 0;
