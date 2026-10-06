-- Optional fixed price (CLP) per quote; 0 = not used.
ALTER TABLE "Quote" ADD COLUMN "montoCerrado" INTEGER NOT NULL DEFAULT 0;
