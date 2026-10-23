export interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

export const services: Service[] = [
  {
    icon: "🌐",
    title: "Diseño & Desarrollo Web",
    description: "Sitios web modernos, rápidos y responsivos adaptados a tu identidad de marca.",
    features: ["Diseño UI/UX personalizado", "Responsive & mobile-first", "Optimización SEO", "Rendimiento web"],
  },
  {
    icon: "⚛️",
    title: "Aplicaciones React / Next.js",
    description: "Apps web interactivas y escalables con las últimas tecnologías del ecosistema React.",
    features: ["Single Page Apps", "Server Side Rendering", "Gestión de estado", "Integración de APIs"],
  },
  {
    icon: "🚀",
    title: "Landing Pages",
    description: "Páginas de aterrizaje diseñadas para convertir visitantes en clientes.",
    features: ["Alta conversión", "Carga ultra rápida", "Formularios y CTAs", "Analíticas integradas"],
  },
  {
    icon: "🔧",
    title: "Mantenimiento & Mejoras",
    description: "Optimización, corrección de bugs y mejoras para proyectos web existentes.",
    features: ["Auditoría de rendimiento", "Corrección de bugs", "Actualización de dependencias", "Mejoras de accesibilidad"],
  },
];
