# SmashRank Argentina 🎮🇦🇷

![SmashRank Banner](https://img.shields.io/badge/SmashRank-Argentina-red?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

Plataforma web completa para gestionar torneos de **Super Smash Bros Ultimate** específicamente para Argentina, con estética inspirada en cómics manga y el estilo visual del juego.

## ✨ Características Principales

### 🎯 Sistema de Torneos
- ✅ Múltiples formatos: Single/Double Elimination, Round Robin, Swiss
- ✅ Sistema de check-in con ventana horaria configurable
- ✅ Inscripciones con control de cupos
- ✅ Generación automática de brackets
- ✅ Gestión de resultados en tiempo real

### 👥 Gestión de Usuarios
- ✅ Registro con selección de provincia argentina
- ✅ Roles: Admin y Usuario
- ✅ Perfiles personalizados con estadísticas
- ✅ Selección de personajes principales (mains)

### 🎮 Sistema de Personajes
- ✅ Base de datos completa con los 89 personajes de SSBU
- ✅ Incluye todos los personajes DLC
- ✅ 8 skins/cromas por personaje
- ✅ Selector visual interactivo

### 🗺️ Enfoque Argentina
- ✅ Filtrado por las 24 provincias argentinas
- ✅ Torneos locales, regionales y nacionales
- ✅ Torneos online y presenciales
- ✅ Rankings provinciales

### 🎨 Diseño Manga/Smash
- ✅ Paleta de colores vibrante inspirada en el juego
- ✅ Animaciones dinámicas tipo manga
- ✅ Efectos de impacto y líneas de velocidad
- ✅ Interfaz responsive para móviles

### 📱 PWA (Progressive Web App)
- ✅ Instalable en Android como aplicación nativa
- ✅ Funciona offline (caché de datos)
- ✅ Notificaciones push
- ✅ Optimizada para dispositivos móviles

## 🚀 Tecnologías

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones fluidas
- **Radix UI** - Componentes accesibles

### Backend
- **Next.js API Routes** - API serverless
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js** - Autenticación completa

### Autenticación y Seguridad
- **NextAuth.js** - Sistema de autenticación
- **bcryptjs** - Hash de contraseñas
- **JWT** - Tokens seguros
- **Zod** - Validación de schemas

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/smashrank-argentina.git
cd smashrank-argentina
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smashrank?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-super-seguro"
```

4. **Configurar la base de datos**
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Seed de la base de datos (personajes, usuarios de prueba, etc.)
npm run prisma:seed
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🎮 Uso

### Cuentas de Prueba

**Administrador:**
- Email: `admin@smashrank.ar`
- Contraseña: `admin123`

**Usuarios de prueba:**
- Email: `user1@smashrank.ar` hasta `user10@smashrank.ar`
- Contraseña: `user123`

### Como Administrador
1. Inicia sesión con la cuenta de administrador
2. Ve a "Crear Torneo" desde el navbar
3. Completa los datos del torneo
4. Los usuarios podrán inscribirse
5. Gestiona check-ins y brackets

### Como Usuario
1. Crea una cuenta o inicia sesión
2. Selecciona tu provincia
3. Añade tus personajes principales en tu perfil
4. Explora torneos y regístrate
5. Haz check-in antes del torneo

## 📱 Despliegue en Vercel

1. **Fork el repositorio** en GitHub

2. **Crear proyecto en Vercel**
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio
   - Configura las variables de entorno

3. **Configurar Base de Datos**
   - Usa Vercel Postgres o un servicio externo
   - Actualiza `DATABASE_URL` en Vercel

4. **Desplegar**
```bash
vercel --prod
```

## 🗂️ Estructura del Proyecto

```
smashrank-argentina/
├── app/                      # App Router de Next.js
│   ├── api/                  # API Routes
│   │   ├── auth/            # Autenticación
│   │   ├── tournaments/     # Endpoints de torneos
│   │   └── characters/      # Endpoints de personajes
│   ├── auth/                # Páginas de autenticación
│   ├── tournaments/         # Páginas de torneos
│   ├── profile/            # Perfil de usuario
│   └── admin/              # Panel de administración
├── components/              # Componentes React
│   ├── ui/                 # Componentes UI base
│   ├── layout/             # Layout components
│   └── tournaments/        # Componentes de torneos
├── lib/                    # Utilidades y configuración
│   ├── prisma.ts          # Cliente Prisma
│   ├── auth.ts            # Configuración NextAuth
│   └── utils.ts           # Funciones útiles
├── prisma/                 # Schema y migraciones
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts            # Seed de la BD
├── public/                 # Archivos estáticos
│   └── manifest.json      # PWA manifest
└── types/                  # Tipos TypeScript
```

## 🎨 Personalización

### Cambiar Colores
Edita `tailwind.config.ts`:
```typescript
colors: {
  primary: '#FF4655',      // Color principal
  secondary: '#00D9FF',    // Color secundario
  // ... más colores
}
```

### Añadir Provincias
Edita `lib/constants.ts`:
```typescript
export const PROVINCES = [
  'Buenos Aires',
  // ... más provincias
];
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Sistema completo de brackets con drag & drop
- [ ] Chat en vivo durante torneos
- [ ] Streaming integrado
- [ ] Sistema de notificaciones por email
- [ ] Modo espectador para brackets
- [ ] Estadísticas avanzadas de jugadores
- [ ] Sistema de replays/clips
- [ ] Integración con Discord
- [ ] Rankings ELO automatizados
- [ ] Badges y logros

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 💪 Créditos

- Desarrollado con ❤️ para la comunidad argentina de Smash Bros
- Iconos de personajes © Nintendo
- Super Smash Bros Ultimate © Nintendo

## 📞 Contacto

- Discord de la comunidad: [Link]
- Twitter: [@SmashRankAR]
- Email: contact@smashrank.ar

---

**¡Hecho con 💪 para la comunidad argentina de Smash!**
