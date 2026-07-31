# Cotizador de Embarque — Naviera GV

App web interna para que los empleados de Naviera GV generen cotizaciones formales
del servicio de cabotaje **Valparaíso ↔ Rapa Nui**. Combina uno o más ítems de
carga (vehículos, carga general, cajones de madera, contenedor 10 pies), calcula
los precios automáticamente y produce un documento formal en PDF que se puede
guardar en Dropbox y enviar por correo al cliente.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Prisma** + SQLite (dev) / Postgres (producción)
- **NextAuth v5** (Credentials) — login de empleados con contraseñas hasheadas
- **Puppeteer** / `@sparticuz/chromium` — generación de PDF
- **Dropbox SDK** — guardado en carpeta compartida
- **Nodemailer** (Gmail) — envío al cliente

## Desarrollo

```bash
npm install
cp .env.example .env      # completa los valores
npx prisma migrate dev
npm run db:seed           # admin + cotizaciones de ejemplo
npm run dev
```

Abre http://localhost:3000. Login inicial: `admin` / `cambiar123`.

## Estructura

- `src/lib/pricing.ts` — motor de cálculo (portado fielmente del prototipo aprobado)
- `src/lib/quote-view.ts` — modelo de vista del documento formal
- `src/components/QuoteDocument.tsx` — documento formal (compartido por vista previa y PDF)
- `src/app/(app)/cotizaciones/` — listado, formulario (nueva/editar) y documento
- `src/app/actions/` — server actions (guardar cotización, integraciones)
- `src/lib/pdf.ts`, `src/lib/dropbox.ts`, `src/lib/gmail.ts` — integraciones

## Despliegue

Ver **[DEPLOY.md](DEPLOY.md)** para los pasos completos (Postgres, Vercel, Gmail,
Dropbox).

## Reglas de negocio

La lógica de precios y el texto del documento están fijados según el handoff de
diseño (idas vs. vueltas, tarifas marítimas, cargos por tipo de ítem, cláusulas
dinámicas). **Siempre "Rapa Nui", nunca "Isla de Pascua"** en cualquier texto.
