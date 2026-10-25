import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type Project = {
  slug: string;
  title: string;
  meta: string;
  description: string;
  preview_kind: 'shop' | 'dashboard' | 'app';
  image_url: string;
  href: string;
  is_published: boolean;
  sort_order: number;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon_key: 'web' | 'react' | 'backend' | 'automation' | 'design' | 'support';
  is_published: boolean;
  sort_order: number;
};

export const DEFAULT_SITE_COPY = {
  hero_tag: '<Dn Craft & Loop />',
  hero_title: 'Ideas que cobran vida,',
  hero_emphasis: 'código que no se detiene',
  hero_description: 'Diseñamos, desarrollamos y desplegamos sitios y aplicaciones web a la medida. Estrategia clara, código limpio y entregas que funcionan desde el primer día.',
  services_heading: 'Todo lo que tu producto digital necesita',
  services_subheading: 'De la idea al servidor en producción: un solo equipo, una sola visión.',
  process_heading: 'Un loop que mejora en cada vuelta',
  process_subheading: 'Cuatro pasos claros. Cuando el proyecto sale a producción, el ciclo vuelve a empezar con datos reales.',
  projects_heading: 'Trabajo que se nota',
  projects_subheading: 'Una muestra del tipo de productos que construimos.',
  cta_heading: '¿Listo para poner tu idea en producción?',
  cta_description: 'Cuéntanos qué necesitas y te respondemos en menos de 24 horas con una propuesta clara.',
  contact_heading: 'Empecemos a construir',
  contact_description: 'Escríbenos con los detalles de tu proyecto: alcance, plazos y presupuesto aproximado.',
};

export type SiteCopy = typeof DEFAULT_SITE_COPY;

export const DEFAULT_PROJECTS: Project[] = [
  {
    slug: 'diamond-crown',
    title: 'Diamond Crown',
    meta: 'E-commerce · React · Firebase',
    description: 'Tienda, citas en línea y dashboard administrativo para un estudio de tatuajes, piercings y barbería.',
    preview_kind: 'shop',
    image_url: '',
    href: '/projects/diamond-crown',
    is_published: true,
    sort_order: 0,
  },
  {
    slug: 'panel-logistica-norte',
    title: 'Panel Logística Norte',
    meta: 'Dashboard · Laravel',
    description: 'Control de inventario y reportes en tiempo real para operaciones.',
    preview_kind: 'dashboard',
    image_url: '',
    href: '',
    is_published: true,
    sort_order: 1,
  },
  {
    slug: 'agenda-pulso',
    title: 'Agenda Pulso',
    meta: 'Web App · React',
    description: 'Reservas y recordatorios automáticos para clínicas y estudios.',
    preview_kind: 'app',
    image_url: '',
    href: '',
    is_published: true,
    sort_order: 2,
  },
];

export const DEFAULT_SERVICES: Service[] = [
  { id: 'web', title: 'Desarrollo web a la medida', description: 'Sitios corporativos y plataformas diseñadas para tu negocio, rápidas, seguras y fáciles de escalar.', icon_key: 'web', is_published: true, sort_order: 0 },
  { id: 'react', title: 'Aplicaciones React / Next.js', description: 'Interfaces modernas con renderizado híbrido, excelente SEO y rendimiento medible en Core Web Vitals.', icon_key: 'react', is_published: true, sort_order: 1 },
  { id: 'backend', title: 'Backend con Laravel', description: 'APIs robustas, paneles administrativos y lógica de negocio con arquitectura limpia y pruebas.', icon_key: 'backend', is_published: true, sort_order: 2 },
  { id: 'automation', title: 'Automatización', description: 'Integramos sistemas y eliminamos tareas repetitivas: reportes, correos, facturación y flujos internos.', icon_key: 'automation', is_published: true, sort_order: 3 },
  { id: 'design', title: 'Diseño UI/UX', description: 'Investigación, prototipos y sistemas de diseño que convierten visitantes en clientes.', icon_key: 'design', is_published: true, sort_order: 4 },
  { id: 'support', title: 'Mantenimiento y despliegue', description: 'Hosting, CI/CD, monitoreo y soporte continuo para que tu sitio nunca se detenga.', icon_key: 'support', is_published: true, sort_order: 5 },
];

export async function fetchProjects(): Promise<Project[]> {
  if (!supabase) return DEFAULT_PROJECTS;
  const { data, error } = await supabase
    .from('cms_projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');
  if (error) throw error;
  return data as Project[];
}

export async function fetchServices(): Promise<Service[]> {
  if (!supabase) return DEFAULT_SERVICES;
  const { data, error } = await supabase
    .from('cms_services')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');
  if (error) throw error;
  return data as Service[];
}

let siteCopyRequest: Promise<SiteCopy> | undefined;

export function fetchSiteCopy(): Promise<SiteCopy> {
  if (!supabase) return Promise.resolve(DEFAULT_SITE_COPY);
  if (siteCopyRequest) return siteCopyRequest;
  const request = Promise.resolve(supabase.from('cms_copy').select('key,value'))
    .then(({ data, error }) => {
      if (error) throw error;
      return {
        ...DEFAULT_SITE_COPY,
        ...Object.fromEntries((data ?? []).map(({ key, value }) => [key, value])),
      };
    })
    .catch((error: unknown) => {
      siteCopyRequest = undefined;
      throw error;
    });
  siteCopyRequest = request;
  return request;
}

export function invalidateSiteCopyCache() {
  siteCopyRequest = undefined;
}

export function useCmsValue<T>(load: () => Promise<T>, fallback: T): T {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    let active = true;
    load()
      .then(nextValue => {
        if (active) setValue(nextValue);
      })
      .catch((error: unknown) => {
        console.error('No se pudo cargar el contenido del CMS:', error);
      });
    return () => { active = false; };
  }, [load]);
  return value;
}

export async function fetchAdminProjects(): Promise<Project[]> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase.from('cms_projects').select('*').order('sort_order');
  if (error) throw error;
  return data as Project[];
}

export async function fetchAdminServices(): Promise<Service[]> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase.from('cms_services').select('*').order('sort_order');
  if (error) throw error;
  return data as Service[];
}

export async function fetchAdminCopy(): Promise<SiteCopy> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase.from('cms_copy').select('key,value');
  if (error) throw error;
  return {
    ...DEFAULT_SITE_COPY,
    ...Object.fromEntries((data ?? []).map(({ key, value }) => [key, value])),
  };
}
