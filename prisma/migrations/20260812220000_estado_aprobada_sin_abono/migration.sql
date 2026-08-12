-- AlterEnum: new estado for approved quotes that don't require a deposit
-- (e.g. state entities). Must be its own migration — Postgres disallows
-- using a newly-added enum value within the same transaction that added it.
ALTER TYPE "Estado" ADD VALUE 'aprobada_sin_abono';
