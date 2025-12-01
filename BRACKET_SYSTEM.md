# Sistema de Brackets para SmashRank 2

## Cambios Realizados

### 1. Base de Datos (Prisma Schema)

Se actualizó el schema para soportar el sistema de brackets:

- **User**: Agregados campos `wins`, `losses` y `points` para el seeding
- **Registration**: Agregado campo `seed` (nullable) para almacenar el seed asignado
- **Bracket**: Campo `tournamentId` ahora es único (un bracket por torneo)

### 2. Utilidades (`lib/bracket.ts`)

Sistema completo de generación de brackets con:

- **Seeding inteligente**: Ordena jugadores por victorias → win rate → puntos
- **Generación óptima**: Seed 1 vs peor seed, Seed 2 vs segundo peor, etc.
- **Doble Eliminación**: Genera winners bracket, losers bracket y grand finals
- **Gestión de resultados**: Avanza ganadores y envía perdedores al losers bracket

### 3. API Endpoints (`app/api/tournaments/[id]/bracket/route.ts`)

Tres endpoints para gestionar brackets:

#### POST - Generar Bracket
- Solo admins pueden generar
- Verifica que haya mínimo 2 participantes con check-in
- Asigna seeds automáticamente basados en estadísticas
- Genera estructura de doble eliminación
- Guarda en base de datos
- Cambia estado del torneo a `IN_PROGRESS`

#### GET - Obtener Bracket
- Devuelve el bracket actual del torneo
- Incluye información de todos los participantes
- Devuelve 404 si no existe bracket

#### PUT - Actualizar Resultado de Match
- Solo admins pueden actualizar
- Actualiza winnerId, loserId y score de un match
- Busca el match en winners, losers o grand finals

### 4. Interfaz de Usuario (`app/tournaments/[id]/bracket/page.tsx`)

Página completa de visualización y gestión de brackets:

- **Vista previa**: Muestra participantes antes de generar
- **Generación**: Botón para generar bracket con validaciones
- **Visualización**: 
  - Winners Bracket organizado por rondas
  - Losers Bracket organizado por rondas
  - Grand Finals destacado
- **Matches**: Cada match muestra:
  - Jugadores con avatares
  - Score si está disponible
  - Indicador de ganador (trofeo dorado)
  - TBD para posiciones pendientes

### 5. Integración en Detalle de Torneo

Se agregó botón "Bracket" en la página de detalle del torneo (solo visible para admins).

## Instrucciones de Deploy

### Paso 1: Actualizar el Schema en Producción

Desde tu terminal local, ejecuta:

```bash
# Opción 1: Si tienes npx funcionando
npx prisma db push

# Opción 2: Usando node directamente
node node_modules\prisma\build\index.js db push
```

**IMPORTANTE**: Si no puedes conectarte a la base de datos desde local, puedes usar Vercel:

1. Haz commit y push de los cambios
2. Espera a que Vercel haga el deploy automático
3. En el dashboard de Vercel, ve a Settings → Environment Variables
4. Asegúrate que `DATABASE_URL` esté correctamente configurada
5. Ve a la terminal de Vercel y ejecuta:
```bash
npx prisma db push
```

### Paso 2: Verificar los Cambios

Una vez aplicadas las migraciones, verifica en Neon o con Prisma Studio:

```bash
npx prisma studio
```

Deberías ver:
- Campo `seed` en la tabla `Registration`
- Campos `wins`, `losses`, `points` en la tabla `User`
- Campo `tournamentId` con constraint UNIQUE en `Bracket`

### Paso 3: Deploy a Producción

```bash
git add .
git commit -m "feat: Sistema de brackets con seeding automático"
git push origin main
```

Vercel hará el deploy automáticamente.

## Cómo Usar el Sistema

### 1. Crear Torneo
- Crea un torneo normalmente desde el dashboard de admin

### 2. Inscripciones
- Los jugadores se inscriben al torneo
- Los jugadores hacen check-in en la ventana habilitada (30 min antes del inicio)

### 3. Generar Bracket
- Ve a la página de detalle del torneo
- Haz clic en el botón "Bracket" (solo admins lo ven)
- Haz clic en "Generar Bracket"
- El sistema:
  - Toma todos los jugadores con check-in
  - Los ordena por victorias → win rate → puntos
  - Asigna seeds (1 = mejor, N = peor)
  - Crea el bracket de doble eliminación
  - Guarda en la base de datos

### 4. Ver Bracket
- Una vez generado, puedes ver:
  - Winners Bracket: Todos los matches del bracket de ganadores
  - Losers Bracket: Matches del bracket de perdedores
  - Grand Finals: El match final

### 5. Actualizar Resultados (Próximamente)
- Se puede implementar una interfaz para reportar resultados
- Los ganadores avanzan automáticamente
- Los perdedores caen al losers bracket

## Estructura del Bracket

### Seeding
```
Ejemplo con 8 jugadores:
Seed 1 (más victorias) vs Seed 8 (menos victorias)
Seed 2 vs Seed 7
Seed 3 vs Seed 6
Seed 4 vs Seed 5
```

### Doble Eliminación
```
Winners Bracket → Si pierdes, caes a Losers Bracket
Losers Bracket → Si pierdes, estás eliminado
Grand Finals → Ganador de Winners vs Ganador de Losers
```

## API Reference

### POST /api/tournaments/[id]/bracket
Genera el bracket del torneo

**Headers:**
```
Authorization: Bearer token (debe ser ADMIN)
```

**Response:**
```json
{
  "success": true,
  "bracket": {
    "winners": [...],
    "losers": [...],
    "grandFinals": {...}
  },
  "participants": 8
}
```

### GET /api/tournaments/[id]/bracket
Obtiene el bracket actual

**Response:**
```json
{
  "id": "...",
  "tournamentId": "...",
  "type": "double_elimination",
  "data": {
    "winners": [...],
    "losers": [...],
    "grandFinals": {...}
  },
  "tournament": {...}
}
```

### PUT /api/tournaments/[id]/bracket
Actualiza el resultado de un match

**Body:**
```json
{
  "matchId": "w-1-1",
  "winnerId": "user_id",
  "loserId": "user_id",
  "score": "3-2"
}
```

## Próximas Mejoras

1. **Interfaz de Reporte de Resultados**
   - Botón para reportar ganador de cada match
   - Validación de que ambos jugadores confirmen resultado
   - Avance automático al siguiente match

2. **Visualización Mejorada**
   - Vista en árbol estilo bracket tradicional
   - Líneas conectando matches
   - Animaciones de transición

3. **Edición Manual**
   - Drag & drop para reasignar jugadores
   - Edición de seeds antes de generar
   - Resetear bracket completo

4. **Streaming Integration**
   - Marcador de "Match en vivo"
   - Enlaces a streams de Twitch
   - Notificaciones cuando comienza un match

5. **Estadísticas Post-Torneo**
   - Actualización automática de wins/losses/points
   - Historial de matches del torneo
   - Rankings actualizados
