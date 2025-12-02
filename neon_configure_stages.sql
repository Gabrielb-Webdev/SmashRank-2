-- ====================================================================
-- CONFIGURAR STAGES EN TORNEOS EXISTENTES
-- Ejecuta esto DESPUÉS de la migración principal
-- ====================================================================

-- Obtener IDs de stages comunes (asumiendo que tienes estos stages)
-- Nota: Ajusta los nombres según tus stages reales

-- Opción 1: Si conoces los IDs de tus stages, úsalos directamente
-- Reemplaza 'stage-id-1', 'stage-id-2', etc. con los IDs reales

-- Opción 2: Obtener IDs de stages por nombre
-- Ejecuta esto primero para ver tus stages:
SELECT id, name, starter, counterpick FROM "Stage" ORDER BY name;

-- Luego usa este UPDATE con los IDs correctos:
-- Ejemplo con stages típicos de Smash Ultimate:

-- Battlefield, Final Destination, Pokemon Stadium 2, Smashville, Town & City = STARTERS
-- Kalos, Lylat, Yoshi's Story, etc. = COUNTERPICKS

-- UPDATE para agregar stages a todos los torneos
-- (Ajusta los arrays según los IDs de tus stages)

UPDATE "Tournament"
SET 
  "starterStages" = ARRAY[
    -- Pon aquí los IDs de tus starter stages
    -- Ejemplo: 'clxxx1', 'clxxx2', 'clxxx3', 'clxxx4', 'clxxx5'
  ],
  "counterpickStages" = ARRAY[
    -- Pon aquí los IDs de tus counterpick stages
    -- Ejemplo: 'clxxx6', 'clxxx7', 'clxxx8'
  ]
WHERE "starterStages" = '{}' OR "starterStages" IS NULL;

-- Verificar
SELECT id, name, "starterStages", "counterpickStages" 
FROM "Tournament" 
LIMIT 5;
