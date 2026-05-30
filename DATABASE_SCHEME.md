# EventHub — Esquema de Base de Datos para Supabase (Versión Optimizada)

> ⚠️ **IMPORTANTE**: Este es el esquema oficial optimizado que está configurado y funcionando en la base de datos de Supabase en la nube. 
> Si deseas recrear la base de datos desde cero, puedes copiar y ejecutar este código SQL en el **SQL Editor** de Supabase.

---

## SQL Completo de Configuración

```sql
-- ============================================================================
-- EVENTHUB - SQL COMPLETO PARA SUPABASE (Versión Optimizada)
-- Copiar y pegar TODO en: Supabase > SQL Editor > New Query
-- ============================================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- PASO 1: PERFILES (vinculado a auth.users)
-- ============================================================================

CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_perfiles_email ON perfiles(email);

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver perfil" ON perfiles
  FOR SELECT USING (true);

CREATE POLICY "Crear perfil propio" ON perfiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Editar perfil propio" ON perfiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PASO 2: CATEGORÍAS (normalizado)
-- ============================================================================

CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#2563EB',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categorias_nombre ON categorias(nombre);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver categorías" ON categorias
  FOR SELECT USING (true);

-- ============================================================================
-- PASO 3: EVENTOS (tabla principal)
-- ============================================================================

CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  creador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  
  -- Información básica
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  
  -- Fecha y hora
  fecha_inicio TIMESTAMP NOT NULL,
  
  -- Ubicación
  ubicacion VARCHAR(255) NOT NULL,
  
  -- Capacidad
  max_inscritos INT,
  
  -- Media
  imagen_url TEXT,
  
  -- Estado
  estado VARCHAR(20) DEFAULT 'activo' 
    CHECK (estado IN ('activo', 'cancelado', 'finalizado')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT titulo_no_vacio CHECK (length(titulo) > 0),
  CONSTRAINT descripcion_minima CHECK (length(descripcion) >= 10),
  CONSTRAINT capacidad_valida CHECK (max_inscritos IS NULL OR max_inscritos > 0)
);

CREATE INDEX idx_eventos_creador_id ON eventos(creador_id);
CREATE INDEX idx_eventos_categoria_id ON eventos(categoria_id);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_inicio);
CREATE INDEX idx_eventos_estado ON eventos(estado);

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver eventos activos" ON eventos
  FOR SELECT USING (estado = 'activo' OR auth.uid() = creador_id);

CREATE POLICY "Crear evento" ON eventos
  FOR INSERT WITH CHECK (auth.uid() = creador_id);

CREATE POLICY "Editar evento propio" ON eventos
  FOR UPDATE USING (auth.uid() = creador_id)
  WITH CHECK (auth.uid() = creador_id);

CREATE POLICY "Eliminar evento propio" ON eventos
  FOR DELETE USING (auth.uid() = creador_id);

-- ============================================================================
-- PASO 4: INSCRIPCIONES (relación N:M)
-- ============================================================================

CREATE TABLE inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Restricciones
  UNIQUE(usuario_id, evento_id)
);

CREATE INDEX idx_inscripciones_usuario ON inscripciones(usuario_id);
CREATE INDEX idx_inscripciones_evento ON inscripciones(evento_id);

ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver mis inscripciones" ON inscripciones
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Crear inscripción" ON inscripciones
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Deletear inscripción propia" ON inscripciones
  FOR DELETE USING (auth.uid() = usuario_id);

CREATE POLICY "Organizador ve inscritos" ON inscripciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM eventos 
      WHERE eventos.id = inscripciones.evento_id 
      AND eventos.creador_id = auth.uid()
    )
  );

-- ============================================================================
-- PASO 5: TRIGGERS AUTOMÁTICOS
-- ============================================================================

-- Función: Auto-crear perfil cuando se registra usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, email)
  VALUES (new.id, new.raw_user_meta_data->>'nombre', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Se dispara cuando se crea usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar updated_at en perfiles
CREATE TRIGGER update_perfiles_updated_at
  BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Actualizar updated_at en eventos
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PASO 6: DATA INICIAL - CATEGORÍAS
-- ============================================================================

INSERT INTO categorias (nombre, descripcion, color) VALUES
  ('Tecnología', 'Conferencias, talleres, hackathons y meetups tecnológicos', '#2563EB'),
  ('Educación', 'Seminarios académicos, charlas y eventos educativos', '#10B981'),
  ('Deportes', 'Actividades deportivas, competencias y entrenamientos', '#EF4444'),
  ('Música', 'Conciertos, recitales y eventos musicales', '#A855F7');
```

---

## Estructura de la Base de Datos

El diseño consta de 4 tablas principales vinculadas y optimizadas con políticas de RLS (Row Level Security), triggers y funciones en PostgreSQL:

### 1. `perfiles`
Almacena la información de los usuarios registrados. Se alimenta de forma automática gracias al trigger `on_auth_user_created` cuando un usuario nuevo se registra a través del servicio de autenticación de Supabase (Auth).
* **`id`** (`UUID`): Clave primaria referenciada a `auth.users(id)` con eliminación en cascada.
* **`nombre`** (`VARCHAR(255)`): Nombre del usuario extraído de los metadatos del registro.
* **`email`** (`VARCHAR(255)`): Correo del usuario (único e indexado).
* **`created_at`** / **`updated_at`** (`TIMESTAMP`): Fechas de registro y actualización automática.

### 2. `categorias`
Mesa de categorías normalizada para clasificar los eventos de manera formal.
* **`id`** (`UUID`): Clave primaria generada por UUID.
* **`nombre`** (`VARCHAR(100)`): Nombre único (ej. `Tecnología`, `Educación`, `Deportes`, `Música`).
* **`descripcion`** (`TEXT`): Explicación breve de la categoría.
* **`color`** (`VARCHAR(7)`): Código hexadecimal para la visualización del color en la interfaz del frontend.

### 3. `eventos`
Almacena toda la información referente a los eventos creados dentro de la aplicación.
* **`id`** (`UUID`): Clave primaria generada por UUID.
* **`creador_id`** (`UUID`): Relación con el organizador (`auth.users(id)`).
* **`categoria_id`** (`UUID`): Relación de categoría normalizada con eliminación establecida a `SET NULL` si la categoría se borra.
* **`titulo`** (`VARCHAR(255)`): Título del evento.
* **`descripcion`** (`TEXT`): Detalles del evento (mínimo 10 caracteres).
* **`fecha_inicio`** (`TIMESTAMP`): Fecha y hora completa de inicio del evento.
* **`ubicacion`** (`VARCHAR(255)`): Lugar o enlace de la reunión.
* **`max_inscritos`** (`INT`): Capacidad límite de asistentes (opcional).
* **`imagen_url`** (`TEXT`): Enlace de la portada o afiche del evento.
* **`estado`** (`VARCHAR(20)`): Estado actual (`activo`, `cancelado`, `finalizado`).

### 4. `inscripciones`
Tabla relacional intermedia de muchos-a-muchos (N:M) que registra las asistencias.
* **`id`** (`UUID`): Clave primaria única.
* **`usuario_id`** (`UUID`): Relación con el asistente (`auth.users(id)`).
* **`evento_id`** (`UUID`): Relación con el evento inscrito (`eventos(id)`).
* **`created_at`** (`TIMESTAMP`): Fecha de inscripción.
* *Restricción*: La pareja (`usuario_id`, `evento_id`) es **Única** para evitar duplicidades de reservas.

---

## Triggers automáticos en Supabase

1. **`on_auth_user_created`**: Se ejecuta después de un registro de usuario exitoso en `auth.users`. Inserta un registro correspondiente en `public.perfiles` con su ID de autenticación, su email y su nombre completo.
2. **`update_perfiles_updated_at`** & **`update_eventos_updated_at`**: Modifican de manera interna e instantánea la columna `updated_at` cada vez que se efectúa un cambio (`UPDATE`) en los perfiles o en los eventos correspondientes.
