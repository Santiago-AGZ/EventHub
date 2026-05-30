export interface Evento {
  id: string
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  ubicacion: string
  categoria: 'Tecnología' | 'Educación' | 'Deportes' | 'Música'
  imagen: string
  organizador_id: string
  organizador_nombre: string
  cupos_totales: number
  cupos_disponibles: number
  creado_en: string
}

export const EVENT_CATEGORIES = [
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Deportes', label: 'Deportes' },
  { value: 'Música', label: 'Música' },
] as const

export const INITIAL_MOCK_EVENTS: Evento[] = [
  {
    id: "evt-1",
    titulo: "Hackathon de Inteligencia Artificial 2026",
    descripcion: "Pon a prueba tus habilidades de desarrollo y crea soluciones innovadoras impulsadas por IA. 24 horas de código continuo, mentoría experta de patrocinadores de la industria y excelentes premios en efectivo para las mejores ideas de la universidad.",
    fecha: "2026-06-15",
    hora: "09:00",
    ubicacion: "Auditorio Principal de Ingeniería",
    categoria: "Tecnología",
    imagen: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60",
    organizador_id: "org-1",
    organizador_nombre: "Club de Algoritmia e IA",
    cupos_totales: 120,
    cupos_disponibles: 45,
    creado_en: "2026-05-01T10:00:00Z"
  },
  {
    id: "evt-2",
    titulo: "Torneo de Fútbol Inter-facultades",
    descripcion: "Llega la copa deportiva universitaria más esperada del semestre. Arma tu equipo de 7 jugadores en representación de tu facultad y compite por la copa universitaria. Se requiere uniforme y credencial estudiantil vigente para la inscripción.",
    fecha: "2026-06-20",
    hora: "14:00",
    ubicacion: "Cancha Deportiva Central",
    categoria: "Deportes",
    imagen: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60",
    organizador_id: "org-2",
    organizador_nombre: "Coordinación de Bienestar Universitario",
    cupos_totales: 64,
    cupos_disponibles: 16,
    creado_en: "2026-05-10T12:00:00Z"
  },
  {
    id: "evt-3",
    titulo: "Concierto Acústico de Bienvenida",
    descripcion: "Disfruta de una tarde relajante de música en vivo y picnic en el campus. Contaremos con la participación especial de la Banda Sinfónica de la Universidad, bandas estudiantiles invitadas y comida gratis para los primeros 100 inscritos.",
    fecha: "2026-06-10",
    hora: "17:30",
    ubicacion: "Jardín de los Fundadores",
    categoria: "Música",
    imagen: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
    organizador_id: "org-3",
    organizador_nombre: "Sociedad de Talentos Musicales",
    cupos_totales: 300,
    cupos_disponibles: 124,
    creado_en: "2026-05-15T08:30:00Z"
  },
  {
    id: "evt-4",
    titulo: "Taller Práctico de Oratoria y Liderazgo",
    descripcion: "Aprende las claves fundamentales para hablar en público, estructurar discursos memorables y liderar equipos multidisciplinarios. Incluye dinámicas de expresión corporal, manejo de glosofobia y certificado de participación con valor extracurricular.",
    fecha: "2026-06-05",
    hora: "10:00",
    ubicacion: "Aula Magna 4B - Edificio Administrativo",
    categoria: "Educación",
    imagen: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60",
    organizador_id: "org-4",
    organizador_nombre: "Departamento de Humanidades y Liderazgo",
    cupos_totales: 50,
    cupos_disponibles: 50,
    creado_en: "2026-05-20T15:00:00Z"
  },
  {
    id: "evt-5",
    titulo: "Taller Avanzado de React y Zustand 2026",
    descripcion: "Domina el desarrollo frontend con las herramientas más demandadas del mercado. Aprenderás patrones de estado global avanzados con Zustand, animaciones fluidas con Tailwind y buenas prácticas de TypeScript en el diseño de interfaces web modernas.",
    fecha: "2026-07-02",
    hora: "15:00",
    ubicacion: "Laboratorio de Cómputo C-2",
    categoria: "Tecnología",
    imagen: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    organizador_id: "org-1",
    organizador_nombre: "Club de Algoritmia e IA",
    cupos_totales: 30,
    cupos_disponibles: 8,
    creado_en: "2026-05-25T11:45:00Z"
  },
  {
    id: "evt-6",
    titulo: "Feria de Empleo y Prácticas Profesionales",
    descripcion: "Conéctate directamente con más de 20 empresas líderes del sector tecnológico, financiero y de manufactura. Trae tu currículum impreso y digital para entrevistas rápidas (Speed Dating) de empleo y oportunidades de prácticas universitarias.",
    fecha: "2026-07-10",
    hora: "09:00",
    ubicacion: "Explanada del Edificio Central",
    categoria: "Educación",
    imagen: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
    organizador_id: "org-5",
    organizador_nombre: "Oficina de Egresados y Empleabilidad",
    cupos_totales: 500,
    cupos_disponibles: 480,
    creado_en: "2026-05-28T09:00:00Z"
  }
]
