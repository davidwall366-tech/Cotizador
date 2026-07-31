# Guía de despliegue — Cotizador Naviera GV

Esta guía lleva la app desde el desarrollo local hasta producción en Vercel con
una base de datos Postgres gestionada. Está pensada para seguirse de arriba abajo.

---

## 1. Desarrollo local

Requisitos: Node.js 20+ y npm.

```bash
npm install
cp .env.example .env      # y completa los valores (ver más abajo)
npx prisma migrate dev    # aplica las migraciones a tu base Postgres
npm run db:seed           # crea el usuario admin + 3 cotizaciones de ejemplo
npm run dev               # http://localhost:3000
```

Login inicial: `admin` / `cambiar123` (cámbialo cuanto antes; ver §6).

> El proyecto usa **Postgres desde desarrollo** (ya no SQLite) — una única base
> gestionada en Neon sirve tanto para desarrollo como, hoy, para producción.
> Antes de tener tráfico real conviene separar ambos entornos (ver nota en §2.1).

---

## 2. Base de datos (Postgres)

### 2.1 Estado actual

Ya existe un proyecto Neon (`cotizador-naviera-gv`, Postgres 17, `us-west-2`)
creado con `neonctl`, cuya cadena de conexión está en `.env` como `DATABASE_URL`.
Las migraciones (`prisma/migrations/`) y el seed ya corrieron contra esa base.

> **Antes de invitar empleados reales:** considera crear un segundo proyecto/rama
> Neon solo para producción (`neonctl projects create` de nuevo, o usa branching
> de Neon) y dejar este para desarrollo — hoy ambos apuntan a la misma base.

Si en cambio prefieres partir de cero en otro proveedor (Supabase, RDS, etc.),
crea la base y copia su cadena de conexión, que se verá parecida a:

```
postgresql://usuario:password@host:5432/basedatos?sslmode=require
```

El `provider` de Prisma ya está en `"postgresql"` en
[`prisma/schema.prisma`](prisma/schema.prisma):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Aplicar migraciones contra una base nueva

Si apuntas `DATABASE_URL` a una base Postgres distinta (nueva, vacía):

```bash
npx prisma migrate deploy   # aplica las migraciones existentes tal cual
npm run db:seed
```

> Nota: las migraciones existentes en `prisma/migrations/` fueron generadas para
> SQLite. Lo más limpio al pasar a Postgres es empezar con un historial de
> migraciones nuevo (borra la carpeta `prisma/migrations/` **solo si** no tienes
> datos que conservar y vuelve a correr `migrate dev`). El esquema es idéntico;
> los enums funcionan nativamente en Postgres.

---

## 3. Despliegue en Vercel

### 3.1 Subir el repositorio

```bash
git remote add origin <url-del-repo-en-github>
git push -u origin main
```

Luego importa el repo en [vercel.com/new](https://vercel.com/new). Vercel detecta
Next.js automáticamente; no hace falta configurar el comando de build.

### 3.2 Variables de entorno en Vercel

En **Project Settings → Environment Variables**, agrega (ver `.env.example` para el
detalle de cada una):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | cadena de conexión Postgres |
| `AUTH_SECRET` | secreto aleatorio (genera uno nuevo, no reuses el de dev) |
| `NEXTAUTH_URL` | la URL pública, p.ej. `https://cotizador.navieragv.cl` |
| `APP_URL` | igual que `NEXTAUTH_URL` |
| `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET`, `DROPBOX_REFRESH_TOKEN` | credenciales Dropbox (ver §5) |
| `DROPBOX_ROOT_FOLDER` | `""` (raíz de la carpeta de la app) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | credenciales Gmail (ver §4) |
| `PUPPETEER_SKIP_DOWNLOAD` | `1` — evita descargar Chromium en el build (en Vercel se usa `@sparticuz/chromium`) |

> `DROPBOX_AUTO_EXPORT` es opcional: ponlo en `1` solo si quieres que **cada
> guardado** suba el PDF a la carpeta compartida automáticamente.

### 3.3 Generación de PDF en serverless

Ya está resuelto en el código:

- `src/lib/pdf.ts` usa `@sparticuz/chromium` + `puppeteer-core` cuando detecta
  `process.env.VERCEL`, y el `puppeteer` completo solo en local.
- Las rutas que generan PDF (`/api/cotizaciones/[id]/pdf` y la página del documento)
  declaran `maxDuration = 60` para no cortar por el timeout de 10s del plan Hobby.

> Si sigues en el plan Hobby y ves timeouts, considera el plan Pro (permite
> `maxDuration` mayor) — la generación de PDF con Chromium es intensiva.

### 3.4 Aplicar migraciones en el primer deploy

Después del primer deploy, corre las migraciones y el seed contra la base de
producción (desde tu máquina, con `DATABASE_URL` apuntando a producción):

```bash
npx prisma migrate deploy
npm run db:seed
```

---

## 4. Gmail (envío de cotizaciones por correo)

La cuenta a usar es `dwall@navieragv.cl`.

1. La cuenta debe tener **verificación en 2 pasos** activada.
2. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   y genera una **contraseña de aplicación** (16 caracteres, sin espacios).
3. Define en el entorno:
   - `GMAIL_USER=dwall@navieragv.cl`
   - `GMAIL_APP_PASSWORD=<los 16 caracteres>`

Con eso, el botón "Enviar por correo al cliente" se activa. El correo lleva el
PDF adjunto y, si el empleado marca "Copiarme", va con copia a su propio correo
(campo `email` del usuario; ver §6).

---

## 5. Dropbox (guardar cotizaciones en la carpeta compartida)

La app sube el PDF a la carpeta de negocio (scope de carpeta de la Dropbox App).
Necesitas tres valores: `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET` y un
`DROPBOX_REFRESH_TOKEN` (token de larga duración).

Si ya los tienes en el entorno (como en el equipo de desarrollo actual), la app
los toma solos. Para crearlos desde cero:

1. Crea una app en [dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
   (tipo "Scoped access", acceso "App folder"), con permisos `files.content.write`
   y `files.content.read`.
2. Anota el **App key** y **App secret**.
3. Genera un **refresh token** con el flujo OAuth de Dropbox (una vez).
4. Convención de nombres de archivo (ya implementada):
   `/{año}/{N°}-{cliente}.pdf` dentro de la carpeta de la app.

---

## 6. Gestión de empleados

Los usuarios con rol `ADMIN` ven un link "Empleados" en la barra superior que
lleva a `/empleados`. Ahí puedes:

- Crear un empleado nuevo (usuario, nombre, correo opcional, contraseña, rol).
- Editar un empleado existente (cambiar datos, resetear contraseña, cambiar
  rol, activarlo/desactivarlo).
- El admin no puede quitarse su propio rol ni desactivarse a sí mismo (evita
  quedarse afuera del sistema).

El usuario `admin` inicial se crea con el seed (`npm run db:seed`), a partir de
`SEED_ADMIN_*` en el entorno. **Cambia esa contraseña por defecto (`cambiar123`)
lo antes posible** desde la pantalla `/empleados/[id]/editar`.

Los empleados desactivados no pueden iniciar sesión (verificado en el callback
de NextAuth, no solo en la UI).

---

## 7. Checklist final antes de producción

- [ ] `provider` de Prisma en `postgresql` y migración aplicada
- [ ] `AUTH_SECRET` nuevo y único en producción
- [ ] `NEXTAUTH_URL` / `APP_URL` apuntando al dominio real
- [ ] Contraseña del admin cambiada
- [ ] `GMAIL_APP_PASSWORD` configurado y correo de prueba enviado
- [ ] Credenciales Dropbox configuradas y subida de prueba verificada
- [ ] `PUPPETEER_SKIP_DOWNLOAD=1` en Vercel
- [ ] `npm run build` pasa localmente
