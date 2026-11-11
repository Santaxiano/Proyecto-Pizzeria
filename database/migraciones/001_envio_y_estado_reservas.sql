-- Migración para bases que ya existen (local y Render). Se puede ejecutar más de una vez.
-- psql "URL_DE_LA_BASE" -v ON_ERROR_STOP=1 -f database/migraciones/001_envio_y_estado_reservas.sql
BEGIN;

-- 1) Costo de envío configurable desde el gestor (una sola fila, id = 1).
--    envio_gratis_desde = 0 significa que no hay envío gratis.
CREATE TABLE IF NOT EXISTS Configuracion (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    costo_envio INT NOT NULL DEFAULT 1500 CHECK (costo_envio >= 0),
    envio_gratis_desde INT NOT NULL DEFAULT 15000 CHECK (envio_gratis_desde >= 0)
);

INSERT INTO Configuracion (id, costo_envio, envio_gratis_desde) VALUES (1, 1500, 15000)
ON CONFLICT (id) DO NOTHING;

-- 2) Estado de las reservas: Pendiente -> En curso (se ocupó la mesa) -> Finalizada (se liberó)
ALTER TABLE Reservas
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reservas_estado_valido'
    ) THEN
        ALTER TABLE Reservas
            ADD CONSTRAINT reservas_estado_valido
            CHECK (estado IN ('Pendiente', 'En curso', 'Finalizada'));
    END IF;
END $$;

COMMIT;
