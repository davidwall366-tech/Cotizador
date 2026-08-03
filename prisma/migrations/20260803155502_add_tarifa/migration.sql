-- CreateTable: singleton row of configurable pricing rates (see Tarifa model).
CREATE TABLE "Tarifa" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "maritimoIdaVehiculo" INTEGER NOT NULL DEFAULT 255800,
    "maritimoIdaOtros" INTEGER NOT NULL DEFAULT 240800,
    "maritimoVuelta" INTEGER NOT NULL DEFAULT 132800,
    "gruaVehiculo" INTEGER NOT NULL DEFAULT 95000,
    "fabricacionCajon266" INTEGER NOT NULL DEFAULT 84000,
    "fabricacionCajon173" INTEGER NOT NULL DEFAULT 66000,
    "fabricacionCajon231" INTEGER NOT NULL DEFAULT 84000,
    "fundaProteccion" INTEGER NOT NULL DEFAULT 21000,
    "consolidacionPorM3" INTEGER NOT NULL DEFAULT 11000,
    "arriendoContenedor10" INTEGER NOT NULL DEFAULT 45000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);

-- Seed the single settings row with the values already hardcoded in the app,
-- so behavior is unchanged until an admin edits them via /tarifas.
INSERT INTO "Tarifa" ("id", "updatedAt") VALUES ('default', CURRENT_TIMESTAMP);
