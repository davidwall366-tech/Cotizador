-- New item type: container sale. Must be its own migration — Postgres
-- disallows using a newly-added enum value in the same transaction.
ALTER TYPE "TipoItem" ADD VALUE 'venta_contenedor';
