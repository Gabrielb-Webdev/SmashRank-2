# 🚀 Guía de Activación del Sistema de Match Flow

## ⚠️ Estado Actual

Tu sistema SmashRank está casi listo, pero **NECESITAS EJECUTAR UNA MIGRACIÓN** antes de que funcione completamente.

Los siguientes errores desaparecerán después de la migración:
- ❌ `Cannot read properties of undefined (reading 'find')`
- ❌ `Cannot read properties of undefined (reading 'replace')`

---

## 📋 Pasos para Activar (5 minutos)

### 1️⃣ Abre Neon SQL Editor

1. Ve a: https://console.neon.tech/
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **SmashRank**
4. Click en **"SQL Editor"** en el menú lateral izquierdo

**Captura de referencia:**
```
┌─────────────────────────────────────┐
│  Neon Console                       │
├─────────────────────────────────────┤
│  📊 Dashboard                       │
│  🗂️  Branches                       │
│  📝 SQL Editor  <-- AQUÍ            │
│  ⚙️  Settings                       │
└─────────────────────────────────────┘
```

---

### 2️⃣ Copia el SQL de Migración

Abre el archivo: `neon_migration.sql` (está en la raíz del proyecto)

**Contenido completo:**

```sql
-- ============================================
-- 🚀 SmashRank Match Flow System - Migración
-- ============================================
-- Ejecutar este script en Neon SQL Editor
-- https://console.neon.tech/

-- 1. Agregar nuevas columnas a MatchGame
ALTER TABLE "MatchGame" 
ADD COLUMN IF NOT EXISTS "phase" TEXT NOT NULL DEFAULT 'LOBBY',
ADD COLUMN IF NOT EXISTS "currentTurn" TEXT,
ADD COLUMN IF NOT EXISTS "previousWinnerId" TEXT,
ADD COLUMN IF NOT EXISTS "bannedByPlayer1" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "bannedByPlayer2" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "banTurnCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "player1JoinedLobby" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "player2JoinedLobby" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- 2. Agregar nuevas columnas a Match
ALTER TABLE "Match" 
ADD COLUMN IF NOT EXISTS "player1WonStages" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "player2WonStages" TEXT[] DEFAULT '{}';

-- 3. Agregar nuevas columnas a Tournament
ALTER TABLE "Tournament" 
ADD COLUMN IF NOT EXISTS "starterStages" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "counterpickStages" TEXT[] DEFAULT '{}';

-- 4. Crear índices para mejor rendimiento
CREATE UNIQUE INDEX IF NOT EXISTS "MatchGame_matchId_gameNumber_key" 
ON "MatchGame"("matchId", "gameNumber");

CREATE INDEX IF NOT EXISTS "MatchGame_phase_idx" 
ON "MatchGame"("phase");

-- ✅ Migración completada!
```

---

### 3️⃣ Ejecuta la Migración

1. **Pega el SQL completo** en el editor de Neon
2. Click en el botón **"Run"** (o presiona `Ctrl + Enter`)
3. Espera 5-10 segundos
4. Verifica que aparezca: ✅ **"Query executed successfully"**

**Si ves errores:**
- Error `column already exists`: Normal, significa que ya lo ejecutaste antes
- Error `permission denied`: Verifica que estés en el branch correcto (probablemente `main`)
- Otro error: Copia el mensaje completo y consúltame

---

### 4️⃣ Configura los Stages (Escenarios)

Después de ejecutar la migración:

1. Ve a: https://smash-rank-2.vercel.app/admin/configure-stages
2. Selecciona un torneo del dropdown
3. Click en **"Quick Setup"** para configurar automáticamente:
   - **Starters:** Battlefield, Final Destination, Pokémon Stadium 2, Smashville, Town & City
   - **Counterpicks:** Hollow Bastion, Kalos Pokémon League, Small Battlefield
4. Click en **"Guardar Configuración"**

**IMPORTANTE:** Repite este paso para cada torneo donde quieras usar el match flow.

---

## ✅ Verificación

### Comprueba que todo funciona:

```javascript
// Abre la consola del navegador (F12) y ejecuta:
fetch('/api/tournaments').then(r => r.json()).then(data => {
  const firstTournament = data.tournaments[0];
  console.log('Starter Stages:', firstTournament.starterStages);
  console.log('Counterpick Stages:', firstTournament.counterpickStages);
  
  if (firstTournament.starterStages && firstTournament.counterpickStages) {
    console.log('✅ MIGRACIÓN EXITOSA!');
  } else {
    console.log('⚠️ Configura los stages en /admin/configure-stages');
  }
});
```

**Resultado esperado:**
```
Starter Stages: ["Battlefield", "Final Destination", ...]
Counterpick Stages: ["Hollow Bastion", ...]
✅ MIGRACIÓN EXITOSA!
```

---

## 🎮 Prueba el Match Flow Completo

1. **Crea un torneo de prueba**
2. **Regístrate con 2 usuarios** (puedes usar modo incógnito para el segundo)
3. **Inicia el torneo** (como admin)
4. **Click en un match** del bracket
5. Verás el **MatchFlowModal** con 3 pestañas:
   - 📋 **Resumen:** Estado actual, historial de juegos
   - ✅ **Tareas:** Pasos a seguir (check-in, personajes, stages)
   - 💬 **Chat:** Comunicación entre jugadores

---

## 🔄 Flujo Completo BO3

### Game 1:
1. ✅ Ambos jugadores hacen **check-in**
2. 🦊 Ambos seleccionan **personaje**
3. 🚫 **Banear stages** (patrón 1-2-1):
   - Jugador 1 banea 1
   - Jugador 2 banea 2
   - Jugador 1 banea 1
4. 🎯 Jugador 1 selecciona **stage** (de los no baneados)
5. 🎮 Juegan
6. 📊 Reportar resultado (requiere confirmación del oponente)

### Game 2 (si hay empate 1-1):
1. 🏆 **Ganador del Game 1** selecciona personaje primero
2. 💀 **Perdedor** selecciona personaje
3. 🏆 **Ganador** banea 3 stages
4. 💀 **Perdedor** selecciona stage (con DSR: no puede elegir stages que ya ganó)
5. 🎮 Juegan
6. 📊 Reportar resultado

### Game 3 (desempate):
- Mismo proceso que Game 2

---

## 🐛 Solución de Problemas

### El modal no abre
- Verifica que el match esté en estado `PENDING` o `ONGOING`
- Refresca la página (F5)

### No aparecen personajes/stages
- Verifica que ejecutaste los seeds: `npm run seed`
- Comprueba la API: `fetch('/api/characters')`, `fetch('/api/stages')`

### Error "Turn inválido"
- El sistema controla estrictamente los turnos
- Cada jugador debe esperar su turno
- Refresca para sincronizar

### DSR no funciona
- Verifica que los stages estén configurados correctamente
- El sistema previene que un jugador elija un stage donde ya ganó

---

## 📦 Archivos Relevantes

```
prisma/
  ├── schema.prisma           # Modelos actualizados
  └── neon_migration.sql      # SQL a ejecutar

components/
  ├── matches/
  │   └── MatchFlowModal.tsx  # Modal principal (555 líneas)
  └── brackets/
      └── BracketViewerV2.tsx # Visualizador integrado

app/api/tournaments/[id]/matches/[matchId]/
  ├── checkin/route.ts        # Check-in
  ├── select-character/route.ts
  ├── ban-stage/route.ts
  ├── select-stage/route.ts
  └── report-result/route.ts

app/admin/
  └── configure-stages/page.tsx  # Configuración de stages
```

---

## 🎯 Próximos Pasos

Una vez completada la migración:

1. ✅ Configura stages para tus torneos principales
2. 🧪 Haz una prueba completa de BO3 con usuarios reales
3. 📸 Documenta cualquier bug con screenshots
4. 🚀 Anuncia la nueva feature a tu comunidad

---

## 📞 Soporte

Si algo no funciona después de seguir esta guía:

1. **Copia el error exacto** (con stack trace si aparece)
2. **Captura de pantalla** del problema
3. **Indica el paso** donde ocurrió el problema
4. Consúltame con esa información

**¡Éxito con tu migración! 🎮🚀**
