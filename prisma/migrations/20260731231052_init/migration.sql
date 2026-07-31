-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLEADO');

-- CreateEnum
CREATE TYPE "Direccion" AS ENUM ('ida', 'vuelta');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('pendiente', 'aprobada', 'rechazada');

-- CreateEnum
CREATE TYPE "TipoItem" AS ENUM ('vehiculo', 'carga_general', 'cajon266', 'cajon173', 'cajon231', 'contenedor10');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EMPLEADO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "direccion" "Direccion" NOT NULL DEFAULT 'ida',
    "cliente" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "vigenciaDias" INTEGER NOT NULL DEFAULT 7,
    "vendedor" TEXT NOT NULL DEFAULT '',
    "viajeN" TEXT NOT NULL DEFAULT '',
    "zarpe" TEXT NOT NULL DEFAULT '',
    "plazoRecepcion" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "estado" "Estado" NOT NULL DEFAULT 'pendiente',
    "lineasJson" TEXT NOT NULL DEFAULT '[]',
    "total" INTEGER NOT NULL DEFAULT 0,
    "abono" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tipo" "TipoItem" NOT NULL,
    "cargaM3" DOUBLE PRECISION,
    "cargaDesc" TEXT NOT NULL DEFAULT '',
    "cajonCantidad" INTEGER NOT NULL DEFAULT 1,
    "cajonDesc" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "quoteItemId" TEXT NOT NULL,
    "largo" DOUBLE PRECISION NOT NULL,
    "ancho" DOUBLE PRECISION NOT NULL,
    "alto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_numero_key" ON "Quote"("numero");

-- CreateIndex
CREATE INDEX "Quote_estado_idx" ON "Quote"("estado");

-- CreateIndex
CREATE INDEX "Quote_direccion_idx" ON "Quote"("direccion");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

-- CreateIndex
CREATE INDEX "Vehiculo_quoteItemId_idx" ON "Vehiculo"("quoteItemId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "QuoteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
