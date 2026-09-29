-- Optional per-quote discount percentage (0-100), applied on top of the
-- computed total and shown as its own line in the cost breakdown.
ALTER TABLE "Quote" ADD COLUMN "descuentoPct" INTEGER NOT NULL DEFAULT 0;
