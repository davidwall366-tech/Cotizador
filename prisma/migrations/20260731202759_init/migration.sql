-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLEADO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL DEFAULT 'ida',
    "cliente" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "vigenciaDias" INTEGER NOT NULL DEFAULT 7,
    "vendedor" TEXT NOT NULL DEFAULT '',
    "viajeN" TEXT NOT NULL DEFAULT '',
    "zarpe" TEXT NOT NULL DEFAULT '',
    "plazoRecepcion" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "lineasJson" TEXT NOT NULL DEFAULT '[]',
    "total" INTEGER NOT NULL DEFAULT 0,
    "abono" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tipo" TEXT NOT NULL,
    "cargaM3" REAL,
    "cargaDesc" TEXT NOT NULL DEFAULT '',
    "cajonCantidad" INTEGER NOT NULL DEFAULT 1,
    "cajonDesc" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteItemId" TEXT NOT NULL,
    "largo" REAL NOT NULL,
    "ancho" REAL NOT NULL,
    "alto" REAL NOT NULL,
    CONSTRAINT "Vehiculo_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "QuoteItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
