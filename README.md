# EventHub

Plataforma universitaria de gestión y descubrimiento de eventos. Construida con React 19, TypeScript, Supabase y Tailwind CSS v4.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript 6 |
| Build | Vite 8 + SWC |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Backend/Database | Supabase (PostgreSQL 17 + Auth + Storage) |
| Estado global | Zustand 5 |
| Formularios | react-hook-form + Zod 4 |
| Routing | React Router v7 |
| Notificaciones | Sonner |
| Iconos | Lucide React |

## Arquitectura

```
┌─────────────────────────────────────┐
│           NAVEGADOR WEB              │
│  ┌───────────────────────────────┐  │
│  │     React 19 + TypeScript     │  │
│  │  ┌─────┐ ┌──────┐ ┌───────┐  │  │
│  │  │Pages│ │Components││Stores│  │  │
│  │  └──┬──┘ └──┬───┘ └──┬────┘  │  │
│  │     │       │        │        │  │
│  │  ┌──▼───────▼────────▼────┐   │  │
│  │  │   Servicios (Supabase) │   │  │
│  │  └────────────────────────┘   │  │
│  └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 │ HTTPS + JWT
┌────────────────▼────────────────────┐
│            SUPABASE                  │
│  ┌────────┬──────────┬──────────┐   │
│  │  Auth  │ Database │ Storage  │   │
│  │ (JWT)  │(Postgres)│(imágenes)│   │
│  └────────┴──────────┴──────────┘   │
└─────────────────────────────────────┘
```

### Capas

1. **Páginas** (`src/pages/`): 9 componentes de ruta (Home, Events, EventDetail, CreateEvent, MyEvents, Profile, Contact, Login, Register)
2. **Componentes UI** (`src/components/ui/`): 10 componentes shadcn/ui (Button, Card, Dialog, Input, Badge, Select, Skeleton, Separator, Sonner, ThemeToggle)
3. **Layout** (`src/components/layout/`): Navbar y Footer
4. **Hooks** (`src/hooks/`): useAuth, useEvents, useCategories
5. **Stores** (`src/stores/`): authStore (Zustand), eventStore (Zustand) — estado global con lógica de negocio
6. **Servicios** (`src/services/`): Cliente Supabase configurado con persistencia de sesión
7. **Librerías** (`src/lib/`): types, utils (cn), constants, validationSchemas (Zod)

## Base de Datos (Supabase/PostgreSQL)

### Tablas

| Tabla | Propósito | RLS |
|---|---|---|
| `perfiles` | Datos de usuarios (id, nombre, email) | SELECT/INSERT/UPDATE propias |
| `categorias` | Clasificación de eventos | SELECT pública |
| `eventos` | Información de eventos (imagenes JSONB) | SELECT activos, CRUD propios |
| `inscripciones` | Relación usuario-evento (N:M) | SELECT/INSERT/DELETE propias |
| `contact_messages` | Mensajes de contacto | INSERT/SELECT autenticados |

### Triggers

- `on_auth_user_created`: Crea perfil automático al registrarse
- `on_inscripcion_change`: Actualiza `inscritos_count` en INSERT/DELETE de inscripciones
- `update_updated_at`: Mantiene `updated_at` en perfiles y eventos

### Row Level Security (RLS)

14 políticas en schema `public` + 4 políticas en schema `storage` para el bucket `event-images`.

## Storage (Supabase)

- Bucket: `event-images` (público)
- Subida: Solo usuarios autenticados (INSERT policy)
- Lectura: Usuarios autenticados (SELECT policy)
- Eliminación: Solo el dueño (DELETE policy)
- Formatos permitidos: JPG, PNG, WebP, GIF
- Tamaño máximo: 5 MB

## Realtime

Suscripciones vía `postgres_changes`:
- Tabla `eventos`: recarga eventos en cualquier cambio
- Tabla `inscripciones`: actualiza datos cuando otro usuario se inscribe/cancela

## Flujo de Datos

1. Usuario interactúa con React (click, teclado, touch)
2. Componente llama a hook/store (Zustand)
3. Store ejecuta operación asíncrona contra Supabase
4. Supabase valida autenticación JWT + RLS
5. PostgreSQL ejecuta query + triggers
6. Respuesta viaja al store
7. Store actualiza estado global
8. React re-renderiza componentes afectados

## Variables de Entorno

```bash
VITE_SUPABASE_URL=https://xspjggazoguslyiqlqzb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon...key
```

## Instalación

```bash
# 1. Clonar repositorio
git clone <url>
cd eventhub

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env
# Editar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 4. Inicializar BD
# Ejecutar DATABASE_SCHEME.md en SQL Editor de Supabase

# 5. Iniciar desarrollo
npm run dev
```

## Scripts

```bash
npm run dev      # Servidor de desarrollo (Vite)
npm run build    # Build producción (tsc + Vite)
npm run lint     # ESLint
npm run preview  # Vista previa del build
```

## Limitaciones Conocidas

1. **Chunk JS >500 kB**: El bundle principal supera los 500 kB. Se recomienda `React.lazy()` para code-splitting por ruta.
2. **inscritos_count**: El trigger de BD funciona correctamente, pero la UI no siempre refleja cambios de otros usuarios en tiempo real (solo al navegar).
3. **Sin tests automatizados**: No hay pruebas E2E (Playwright) ni unitarias (Vitest).
4. **Sin CI/CD**: No hay pipeline de GitHub Actions para deploy automático.
5. **SEO**: Sin meta tags dinámicos para compartir eventos en redes sociales.
6. **Accesibilidad**: Contraste primario WCAG AA corregido, pero la navegación por teclado en dropdowns tiene soporte básico (Escape + Arrow navigación).

## Licencia

Proyecto académico — Universidad del Valle
