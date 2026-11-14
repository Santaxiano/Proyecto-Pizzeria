-- Migración para bases que ya existen (local y Render). Se puede ejecutar más de una vez.
-- psql "URL_DE_LA_BASE" -v ON_ERROR_STOP=1 -f database/migraciones/002_creado_en_reservas.sql
BEGIN;

-- Las reservas necesitan guardar cuándo se recibieron para poder armar el
-- historial de notificaciones por día en el gestor (igual que pedidos.creado_en).
ALTER TABLE Reservas
    ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ;

-- Las reservas viejas no tienen ese dato: se toma el momento de la migración.
UPDATE Reservas
SET creado_en = NOW()
WHERE creado_en IS NULL;

ALTER TABLE Reservas
    ALTER COLUMN creado_en SET DEFAULT NOW();

ALTER TABLE Reservas
    ALTER COLUMN creado_en SET NOT NULL;

COMMIT;
