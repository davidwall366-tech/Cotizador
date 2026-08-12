-- AlterEnum: new crate size, 2,77 m³ (largo 2,20 x alto 1,20 x ancho 1,05).
-- Kept in its own migration since PostgreSQL cannot use a newly added enum
-- value inside the same transaction that adds it.
ALTER TYPE "TipoItem" ADD VALUE 'cajon277';
