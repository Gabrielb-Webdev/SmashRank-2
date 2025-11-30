# Instrucciones de Despliegue - SmashRank Argentina

## Despliegue en Vercel (Recomendado)

### 1. Preparación

1. **Crear cuenta en Vercel** (si no tienes una)
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con tu cuenta de GitHub

2. **Crear base de datos PostgreSQL**
   
   Opción A - Vercel Postgres (Recomendado):
   ```bash
   # Instala Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Crea el proyecto
   vercel
   
   # Añade Vercel Postgres desde el dashboard
   ```
   
   Opción B - Supabase (Gratis):
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia la connection string de PostgreSQL

   Opción C - Railway (Gratis):
   - Ve a [railway.app](https://railway.app)
   - Crea un nuevo proyecto PostgreSQL
   - Copia la connection string

### 2. Configuración en Vercel

1. **Importar desde GitHub**
   - En Vercel Dashboard: "Add New..." → "Project"
   - Selecciona tu repositorio de SmashRank
   - Click en "Import"

2. **Configurar Variables de Entorno**
   
   En "Environment Variables", añade:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXTAUTH_SECRET=genera-uno-aleatorio-muy-largo
   ```
   
   Para generar NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. **Build Settings** (ya están configuradas en el proyecto)
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`

4. **Deploy**
   - Click en "Deploy"
   - Espera a que termine el build (~3-5 minutos)

### 3. Configurar Base de Datos

Una vez desplegado, ejecuta las migraciones:

```bash
# Opción 1: Desde local (necesitas DATABASE_URL de producción)
DATABASE_URL="tu-url-de-produccion" npx prisma db push
DATABASE_URL="tu-url-de-produccion" npx prisma db seed

# Opción 2: Desde Vercel CLI
vercel env pull
npx prisma db push
npm run prisma:seed
```

### 4. Verificación

1. Visita tu URL de Vercel
2. Crea una cuenta
3. Prueba crear un torneo (como admin)
4. Verifica que funciona correctamente

## Configuración de Dominio Personalizado

### En Vercel:
1. Ve a Project Settings → Domains
2. Añade tu dominio (ej: smashrank.ar)
3. Configura los DNS según las instrucciones

### Registrar Dominio en Argentina:
- [nic.ar](https://nic.ar) - Dominios .ar
- [Cloudflare](https://cloudflare.com) - DNS gratis

## PWA - Instalación en Android

### Para Usuarios:
1. Abre la web en Chrome en Android
2. Click en menú (3 puntos) → "Agregar a pantalla de inicio"
3. La app se instalará como nativa

### Verificar PWA:
1. Abre Chrome DevTools
2. Ve a Lighthouse
3. Ejecuta auditoría PWA
4. Debe obtener 100% en PWA

## Actualizar la Aplicación

### Método 1: Git Push (Automático)
```bash
git add .
git commit -m "Update: descripción del cambio"
git push origin main
# Vercel desplegará automáticamente
```

### Método 2: Vercel CLI
```bash
vercel --prod
```

## Base de Datos - Backups

### Backup Manual:
```bash
# Exportar
pg_dump $DATABASE_URL > backup.sql

# Importar
psql $DATABASE_URL < backup.sql
```

### Backup Automático:
- Vercel Postgres: backups automáticos incluidos
- Supabase: backups diarios automáticos
- Railway: configura backups en el dashboard

## Monitoreo y Logs

### Ver Logs en Vercel:
1. Ve al proyecto en Vercel
2. Click en "Deployments"
3. Click en el deployment activo
4. Pestaña "Functions" → ver logs en tiempo real

### Monitoreo de Errores (Opcional):
Integra Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## Optimización de Performance

### 1. Imágenes
```bash
# Optimiza imágenes antes de subir
npm install -g sharp-cli
sharp -i input.png -o output.webp
```

### 2. Caché
- Vercel CDN automático
- Headers de caché ya configurados

### 3. Analytics
Añade Vercel Analytics:
```bash
npm install @vercel/analytics
```

En `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Troubleshooting

### Build Falla
```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

### Error de Base de Datos
- Verifica DATABASE_URL
- Verifica que Prisma esté actualizado
- Ejecuta `npx prisma generate`

### Error 500
- Revisa logs en Vercel
- Verifica variables de entorno
- Revisa conexión a base de datos

## Costos Aproximados

### Tier Gratuito (Hobby):
- ✅ Vercel: Gratis (100GB bandwidth)
- ✅ Supabase: Gratis (500MB DB, 2GB bandwidth)
- ✅ Railway: Gratis ($5 crédito mensual)

### Tier Pro (Recomendado para producción):
- 💰 Vercel Pro: $20/mes
- 💰 Supabase Pro: $25/mes
- 💰 Railway Pro: $5/mes base + uso

## Soporte

Si tienes problemas:
1. Revisa los logs en Vercel
2. Consulta la documentación de Next.js
3. Abre un issue en GitHub
4. Contacta en Discord de la comunidad

---

¡Buena suerte con tu despliegue! 🚀
