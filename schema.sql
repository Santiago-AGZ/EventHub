-- ==========================================
-- EVENTHUB - CONFIGURACIÓN DEL BACKEND
-- ==========================================
-- Copia y pega este script SQL en el Editor SQL de tu proyecto en Supabase (supabase.com)
-- para inicializar las tablas de la base de datos de manera correcta.

-- 1. Habilitar la extensión de UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Eliminar tablas existentes para evitar conflictos si se resetea
DROP TABLE IF EXISTS inscripciones;
DROP TABLE IF EXISTS eventos;

-- 3. Crear Tabla de Eventos
CREATE TABLE eventos (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'evt-' || ROUND(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(10) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Tecnología', 'Educación', 'Deportes', 'Música')),
    imagen TEXT,
    organizador_id VARCHAR(100) NOT NULL,
    organizador_nombre VARCHAR(150) NOT NULL,
    cupos_totales INTEGER NOT NULL CHECK (cupos_totales > 0),
    cupos_disponibles INTEGER NOT NULL CHECK (cupos_disponibles >= 0),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Crear Tabla de Inscripciones
CREATE TABLE inscripciones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id VARCHAR(100) REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Evitar inscripciones duplicadas
    UNIQUE (event_id, user_id)
);

-- 5. Crear Índices para Optimizar Búsquedas y Consultas
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_inscripciones_user ON inscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_event ON inscripciones(event_id);

-- 6. Configurar Políticas de Seguridad (RLS - Row Level Security)
-- Habilitamos RLS en ambas tablas
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla 'eventos'
CREATE POLICY "Permitir lectura de eventos a cualquiera"
    ON eventos FOR SELECT
    USING (true);

CREATE POLICY "Permitir creación de eventos a usuarios autenticados"
    ON eventos FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización de eventos a su creador"
    ON eventos FOR UPDATE
    USING (auth.uid()::TEXT = organizador_id)
    WITH CHECK (auth.uid()::TEXT = organizador_id);

CREATE POLICY "Permitir borrado de eventos a su creador"
    ON eventos FOR DELETE
    USING (auth.uid()::TEXT = organizador_id);

-- Políticas para la tabla 'inscripciones'
CREATE POLICY "Permitir lectura de inscripciones a usuarios autenticados"
    ON inscripciones FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inscripciones a usuarios autenticados"
    ON inscripciones FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::TEXT = user_id);

CREATE POLICY "Permitir cancelación de inscripciones a su dueño"
    ON inscripciones FOR DELETE
    USING (auth.role() = 'authenticated' AND auth.uid()::TEXT = user_id);

-- ==========================================
-- SEED DATA (DATOS INICIALES OPCIONALES)
-- ==========================================
-- Puedes insertar estos eventos de prueba si lo deseas:

INSERT INTO eventos (id, titulo, descripcion, fecha, hora, ubicacion, categoria, imagen, organizador_id, organizador_nombre, cupos_totales, cupos_disponibles)
VALUES 
('evt-1', 'Hackathon de Inteligencia Artificial 2026', 'Pon a prueba tus habilidades de desarrollo y crea soluciones innovadoras impulsadas por IA. 24 horas de código continuo, mentoría experta y excelentes premios en efectivo.', '2026-06-15', '09:00', 'Auditorio Principal de Ingeniería', 'Tecnología', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 'usr-org-1', 'Dr. Alejandro Silva', 120, 120),
('evt-2', 'Torneo de Fútbol Inter-facultades', 'Llega la copa deportiva universitaria más esperada del semestre. Arma tu equipo de 7 jugadores en representación de tu facultad.', '2026-06-20', '14:00', 'Cancha Deportiva Central', 'Deportes', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800', 'usr-org-1', 'Dr. Alejandro Silva', 64, 64),
('evt-3', 'Concierto Acústico de Bienvenida', 'Disfruta de una tarde relajante de música en vivo y picnic en el campus. Contaremos con la participación especial de la Banda Sinfónica.', '2026-06-10', '17:30', 'Jardín de los Fundadores', 'Música', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'usr-org-1', 'Dr. Alejandro Silva', 300, 300);
