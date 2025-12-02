# 🎮 Sistema de Match Flow - Pasos de Implementación

## ✅ Completado

1. ✅ **MatchFlowModal.tsx** - Modal con tabs (Summary, Tasks, Chat)
2. ✅ **Schema de Prisma actualizado** con todos los campos necesarios:
   - `MatchGame`: phase, currentTurn, previousWinnerId, bannedStages, etc.
   - `Match`: player1WonStages, player2WonStages (DSR)
   - `Tournament`: starterStages[], counterpickStages[]
3. ✅ **Endpoints API completos**:
   - `/api/tournaments/[id]/matches/[matchId]/checkin` 
   - `/api/tournaments/[id]/matches/[matchId]/select-character`
   - `/api/tournaments/[id]/matches/[matchId]/ban-stage`
   - `/api/tournaments/[id]/matches/[matchId]/select-stage`
   - `/api/tournaments/[id]/matches/[matchId]/report-result`
   - `/api/tournaments/[id]/matches/[matchId]` (GET para cargar datos)
4. ✅ **BracketViewerV2** actualizado para usar MatchFlowModal

## ⚠️ IMPORTANTE - Migración de Base de Datos

La base de datos necesita actualizarse con los nuevos campos. **Debes ejecutar esto manualmente:**

### Opción 1: Migración automática (Recomendado)
```powershell
cd "e:\Users\gabri\Documentos\Brodev Lab\SmashRank 2"
npx prisma migrate deploy
```

### Opción 2: Si la Opción 1 falla, ejecuta SQL directamente en Neon

Ve a tu dashboard de Neon (neon.tech) y ejecuta este SQL en el Query Editor:

```sql
-- Agregar campos a MatchGame
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "phase" TEXT DEFAULT 'LOBBY';
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "currentTurn" TEXT;
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "previousWinnerId" TEXT;
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "bannedByPlayer1" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "bannedByPlayer2" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "banTurnCount" INTEGER DEFAULT 0;
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "player1JoinedLobby" BOOLEAN DEFAULT false;
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "player2JoinedLobby" BOOLEAN DEFAULT false;
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- Agregar campos a Match
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "player1WonStages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "player2WonStages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Agregar campos a Tournament
ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "starterStages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "counterpickStages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Agregar índice único para MatchGame
CREATE UNIQUE INDEX IF NOT EXISTS "MatchGame_matchId_gameNumber_key" ON "MatchGame"("matchId", "gameNumber");

-- Agregar índice para phase
CREATE INDEX IF NOT EXISTS "MatchGame_phase_idx" ON "MatchGame"("phase");
```

## 📝 Siguientes Pasos Después de la Migración

### 1. Reinicia el servidor de desarrollo
```powershell
npm run dev
```

### 2. Crea un nuevo torneo o edita uno existente
Ve a crear torneo y asegúrate de seleccionar stages. Por ahora todos los stages se guardarán como starters. En el futuro necesitarás actualizar el formulario para separar starter/counterpick.

### 3. Genera el bracket
Como admin, genera el bracket del torneo.

### 4. Abre un match
Haz clic en cualquier match donde ambos jugadores estén asignados.

### 5. Prueba el flujo completo
1. Ambos jugadores deben hacer check-in
2. Seleccionar personajes (Player 1 primero)
3. Banear stages (patrón 1-2-1)
4. Seleccionar stage
5. Reportar resultado
6. El sistema automáticamente creará Game 2 si es necesario

## 🎯 Flujo de Match BO3

### Game 1:
1. ✅ Check-in (ambos jugadores)
2. ✅ Player 1 selecciona personaje
3. ✅ Player 2 selecciona personaje
4. ✅ Player 1 banea 1 stage
5. ✅ Player 2 banea 2 stages
6. ✅ Player 1 banea 1 stage más (total 4 bans)
7. ✅ Player 1 elige stage de los no baneados
8. ⏱️ Juegan
9. ✅ Reportan resultado → Confirmación requerida
10. ✅ Sistema guarda stage ganado para DSR

### Game 2 (si necesario):
1. ✅ Ganador de Game 1 selecciona personaje primero
2. ✅ Perdedor selecciona personaje
3. ✅ Ganador banea 3 stages
4. ✅ Perdedor elige stage (no puede elegir donde ganó - DSR)
5. ⏱️ Juegan
6. ✅ Reportan resultado → Confirmación requerida

### Game 3 (si 1-1):
- Mismo flujo que Game 2
- Cuando alguien gana, match completo

## 🐛 Posibles Problemas

### "Cannot reach database"
- Tu base de datos local no está corriendo
- Usa Neon en producción
- Asegúrate de que DATABASE_URL en .env apunte a Neon

### "Column does not exist"
- No ejecutaste la migración
- Ejecuta el SQL manual en Neon dashboard

### "Match no encontrado" o datos vacíos
- El match no tiene games creados aún
- Haz check-in primero para inicializar el primer game

### Toast no funciona
- react-hot-toast necesita un proveedor
- Agrega `<Toaster />` en tu layout principal

## 📦 Dependencias que podrías necesitar

```powershell
npm install react-hot-toast
```

Y en tu layout principal (`app/layout.tsx`):
```tsx
import { Toaster } from 'react-hot-toast';

// Dentro del return:
<Toaster position="top-right" />
```

## 🎨 Mejoras Futuras

1. **Formulario de torneos**: Separar starter/counterpick stages
2. **Chat real**: Implementar WebSockets o polling
3. **Notificaciones push**: Avisar cuando es tu turno
4. **Timer**: Límite de tiempo por acción
5. **Admin override**: Permitir a admins forzar acciones
6. **Imágenes de stages/characters**: En lugar de emojis
7. **Historial detallado**: Ver replay de todas las acciones
8. **Match voice chat**: Integración con Discord

## 🔧 Comandos Útiles

```powershell
# Ver estado de migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Regenerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio (GUI)
npx prisma studio
```

## 📞 Si algo no funciona

1. Verifica que la migración se aplicó correctamente
2. Revisa la consola del navegador para errores
3. Verifica la consola del servidor para errores de API
4. Usa Prisma Studio para ver los datos: `npx prisma studio`
5. Verifica que los stages del torneo estén configurados

¡Buena suerte! 🚀
