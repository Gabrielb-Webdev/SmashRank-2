# Guía de Inicio Rápido - SmashRank Argentina

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **PostgreSQL 14+** - [Descargar aquí](https://www.postgresql.org/download/)
- **Git** - [Descargar aquí](https://git-scm.com/)

Para verificar las instalaciones:
```bash
node --version   # Debe mostrar v18 o superior
npm --version    # Debe mostrar v9 o superior
psql --version   # Debe mostrar PostgreSQL 14 o superior
```

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
# Clona el proyecto
git clone https://github.com/tu-usuario/smashrank-argentina.git

# Entra al directorio
cd smashrank-argentina
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias (~2-3 minutos).

### 3. Configurar PostgreSQL

#### En Windows:

1. Abre pgAdmin 4 (viene con PostgreSQL)
2. Crea una nueva base de datos:
   - Click derecho en "Databases" → "Create" → "Database"
   - Nombre: `smashrank`
   - Click "Save"

#### En macOS/Linux:

```bash
# Iniciar PostgreSQL
brew services start postgresql  # macOS con Homebrew
sudo service postgresql start   # Linux

# Crear base de datos
createdb smashrank
```

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Reemplaza 'user' y 'password' con tus credenciales de PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/smashrank?schema=public"

# Estos valores están bien para desarrollo local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-de-desarrollo-local"
```

**Ejemplo real:**
```env
DATABASE_URL="postgresql://postgres:mipassword123@localhost:5432/smashrank?schema=public"
```

### 5. Configurar la Base de Datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma db push

# Llenar con datos de ejemplo (personajes, usuarios de prueba, etc.)
npm run prisma:seed
```

Deberías ver un mensaje como:
```
✅ 89 personajes creados con sus skins
✅ 11 usuarios creados
✅ Torneo de ejemplo creado
```

### 6. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Verás algo como:
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 7. ¡Listo! 🎉

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## 🎮 Primeros Pasos

### Iniciar Sesión como Admin

Usa estas credenciales de prueba:
- **Email:** `admin@smashrank.ar`
- **Contraseña:** `admin123`

### Iniciar Sesión como Usuario

Usa cualquiera de estas cuentas:
- **Email:** `user1@smashrank.ar` hasta `user10@smashrank.ar`
- **Contraseña:** `user123`

### Crear Tu Propia Cuenta

1. Click en "Registrarse" en la navbar
2. Completa el formulario
3. Selecciona tu provincia
4. ¡Listo para participar en torneos!

## 📱 Características para Probar

### Como Usuario Regular:

1. **Ver Torneos**
   - Ve a "Torneos" en el menú
   - Explora torneos disponibles
   - Filtra por provincia, estado y formato

2. **Inscribirse en un Torneo**
   - Abre un torneo
   - Click en "Inscribirse"
   - Selecciona tu personaje y skin favorito
   - Confirma la inscripción

3. **Personalizar Perfil**
   - Ve a "Mi Perfil"
   - Añade tus personajes principales (mains)
   - Sube un avatar
   - Actualiza tu bio

### Como Administrador:

1. **Crear un Torneo**
   - Click en "Crear Torneo" (solo visible para admins)
   - Completa la información del torneo
   - Configura fechas de inscripción y check-in
   - Publica el torneo

2. **Gestionar Torneos**
   - Editar información del torneo
   - Ver participantes inscritos
   - Monitorear check-ins
   - Generar brackets (próximamente)

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar tipos TypeScript
npm run build

# Linter
npm run lint
```

### Base de Datos
```bash
# Abrir Prisma Studio (interfaz visual de la BD)
npm run prisma:studio

# Ver datos en el navegador
# http://localhost:5555

# Resetear base de datos
npx prisma db push --force-reset
npm run prisma:seed

# Ver esquema actualizado
npx prisma format
```

### Producción
```bash
# Build de producción
npm run build

# Iniciar en producción
npm start
```

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Causa:** PostgreSQL no está corriendo o las credenciales son incorrectas.

**Solución:**
```bash
# Windows: Verificar que PostgreSQL esté corriendo
# Buscar "Services" → PostgreSQL debe estar en "Running"

# macOS/Linux: Iniciar PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Verificar conexión
psql -U postgres -d smashrank
```

### Error: "Module not found"

**Causa:** Dependencias no instaladas correctamente.

**Solución:**
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Prisma Client is not generated"

**Causa:** Cliente de Prisma no generado.

**Solución:**
```bash
npx prisma generate
```

### Puerto 3000 ya en uso

**Solución:**
```bash
# Cambiar el puerto
PORT=3001 npm run dev

# O matar el proceso en puerto 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Base de datos con datos incorrectos

**Solución:**
```bash
# Resetear completamente
npx prisma db push --force-reset
npm run prisma:seed
```

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Guía de TypeScript](https://www.typescriptlang.org/docs)

## 💡 Consejos de Desarrollo

### Hot Reload
Los cambios en el código se actualizan automáticamente en el navegador. No necesitas reiniciar el servidor.

### Debugging
Usa `console.log()` en:
- **Componentes:** Se muestran en la consola del navegador
- **API Routes:** Se muestran en la terminal donde corre el servidor

### Inspeccionar Base de Datos
```bash
# Abre Prisma Studio
npm run prisma:studio
```

### Ver Logs de Desarrollo
La terminal mostrará:
- Requests HTTP
- Errores de compilación
- Warnings de TypeScript

## 🎓 Próximos Pasos

1. **Personaliza el diseño** - Edita `app/globals.css` y `tailwind.config.ts`
2. **Añade funcionalidades** - El código está bien comentado y estructurado
3. **Integra servicios** - Cloudinary para imágenes, SendGrid para emails
4. **Despliega** - Sigue `DEPLOYMENT.md` para subir a producción

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. Revisa esta guía completa
2. Consulta `README.md` para más detalles
3. Abre un issue en GitHub
4. Pregunta en el Discord de la comunidad

---

¡Disfruta construyendo SmashRank! 🎮🚀
