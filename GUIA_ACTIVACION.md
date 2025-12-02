# 🚀 GUÍA PASO A PASO - Activar Sistema de Match Flow

## ✅ **PASO 1: Ejecutar Migración en Neon**

### 1.1 Ir a Neon Console
🔗 https://console.neon.tech/

### 1.2 Seleccionar tu proyecto
- Busca el proyecto "SmashRank" o el que tenga tu base de datos

### 1.3 Ir al SQL Editor
- En el menú lateral, click en **"SQL Editor"**

### 1.4 Copiar y pegar el SQL
- Abre el archivo: `neon_migration.sql`
- Copia TODO el contenido
- Pégalo en el SQL Editor de Neon
- Click en **"Run"** (botón verde)

### 1.5 Verificar éxito
Deberías ver al final:
```
status: "Migration completed!"
```

---

## ✅ **PASO 2: Reiniciar Aplicación**

### Opción A: Si estás en desarrollo local
```powershell
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev
```

### Opción B: Si estás en Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto SmashRank
3. Ve a "Deployments"
4. Click en "..." del último deployment
5. Click "Redeploy"

---

## ✅ **PASO 3: Configurar Stages de Torneos**

### 3.1 Ir al Panel de Admin
🔗 https://tu-dominio.vercel.app/admin/dashboard

### 3.2 Click en "Configurar Stages"
- Verás el nuevo botón en Quick Actions

### 3.3 Seleccionar un torneo
- Elige el torneo que quieres configurar
- Click en "⚡ Configuración Rápida" (opcional - configura automáticamente stages típicos)

### 3.4 Seleccionar Stages
**Starter Stages (para Game 1):**
- Marca 5-7 stages balanceados
- Ejemplo: Battlefield, Final Destination, Pokemon Stadium 2, Smashville, Town & City

**Counterpick Stages (para Games 2-3):**
- Marca 2-3 stages adicionales
- Ejemplo: Kalos, Lylat, Yoshi's Story

### 3.5 Guardar
- Click en "💾 Guardar Configuración"
- Verás mensaje de éxito

---

## ✅ **PASO 4: Probar el Sistema**

### 4.1 Ir a un torneo
- Ve a tu torneo configurado
- Click en la pestaña "Brackets"

### 4.2 Generar bracket (si no está generado)
- Como admin, click en "Generar Bracket"

### 4.3 Abrir un match
- Click en cualquier match que tenga ambos jugadores asignados
- Verás el NUEVO MODAL con tabs

### 4.4 Probar el flujo completo

#### Game 1:
1. **Check-in**: Ambos jugadores hacen check-in ✅
2. **Character Select**: 
   - Player 1 selecciona personaje primero ✅
   - Player 2 selecciona personaje ✅
3. **Stage Ban** (patrón 1-2-1):
   - Player 1 banea 1 stage ✅
   - Player 2 banea 2 stages ✅
   - Player 1 banea 1 stage más ✅
4. **Stage Select**:
   - Player 1 elige stage de los no baneados ✅
5. **Report Result**:
   - Un jugador reporta ganador ✅
   - El otro jugador confirma ✅
6. Sistema automáticamente crea Game 2 🎉

#### Game 2 (si es necesario):
1. **Character Select**:
   - Ganador del Game 1 elige primero ✅
   - Perdedor elige segundo ✅
2. **Stage Ban**:
   - Ganador banea 3 stages ✅
3. **Stage Select**:
   - Perdedor elige stage ✅
   - DSR activo: No puede elegir donde ganó ✅
4. **Report Result**: Mismo proceso ✅

#### Match Completo:
- Primer jugador en ganar 2 games = Ganador del Match 🏆

---

## 🎯 **Características Implementadas**

- ✅ Check-in obligatorio
- ✅ Selección de personajes por turnos
- ✅ Sistema de banning de stages (1-2-1 y winner-bans-3)
- ✅ Selección de stages con turnos
- ✅ DSR (Dave's Stupid Rule) - No puedes repetir stage donde ganaste
- ✅ Sistema de confirmación de resultados
- ✅ Auto-creación de siguiente game
- ✅ Best of 3 completo
- ✅ Tracking completo de todo el match

---

## 🐛 **Si algo no funciona**

### Error: "Column does not exist"
➡️ No ejecutaste la migración en Neon. Ve al PASO 1.

### Error: "No se pueden cargar stages"
➡️ No configuraste stages en el torneo. Ve al PASO 3.

### El modal se ve raro o no carga
➡️ Limpia caché del navegador: Ctrl + Shift + R

### "No es tu turno"
➡️ El sistema está funcionando! Espera a que sea tu turno según la fase.

---

## 📞 **Verificar que todo funciona**

### En Neon SQL Editor, ejecuta:
```sql
-- Verificar que las columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'MatchGame' 
  AND column_name IN ('phase', 'currentTurn', 'previousWinnerId');

-- Debe mostrar 3 filas
```

### En tu app, verifica:
1. ✅ Puedes abrir el modal de match
2. ✅ Ves 3 tabs: Summary, Tasks, Chat
3. ✅ Puedes hacer check-in
4. ✅ Los botones de acciones están activos

---

## 🎉 **¡Listo!**

Tu sistema de match flow estilo start.gg está completamente funcional.

**Archivos importantes creados:**
- `neon_migration.sql` - Migración principal
- `app/admin/configure-stages/page.tsx` - Página de configuración
- `app/api/admin/configure-stages/route.ts` - API endpoint
- `components/matches/MatchFlowModal.tsx` - Modal principal

**Siguiente mejora recomendada:**
- Agregar imágenes reales de stages/personajes
- Implementar chat en tiempo real
- Agregar timer para acciones
