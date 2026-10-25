create table if not exists public.cms_projects (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  meta text not null default '',
  description text not null default '',
  preview_kind text not null default 'shop' check (preview_kind in ('shop', 'dashboard', 'app')),
  image_url text not null default '',
  href text not null default '',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_services (
  id text primary key check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  icon_key text not null default 'web' check (icon_key in ('web', 'react', 'backend', 'automation', 'design', 'support')),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_copy (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.cms_projects enable row level security;
alter table public.cms_services enable row level security;
alter table public.cms_copy enable row level security;

drop policy if exists "Public can read published projects" on public.cms_projects;
create policy "Public can read published projects"
  on public.cms_projects for select
  using (is_published or (auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');

drop policy if exists "Admin can manage projects" on public.cms_projects;
create policy "Admin can manage projects"
  on public.cms_projects for all
  using ((auth.jwt() ->> 'email') = 'dncraftloop@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');

drop policy if exists "Public can read published services" on public.cms_services;
create policy "Public can read published services"
  on public.cms_services for select
  using (is_published or (auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');

drop policy if exists "Admin can manage services" on public.cms_services;
create policy "Admin can manage services"
  on public.cms_services for all
  using ((auth.jwt() ->> 'email') = 'dncraftloop@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');

drop policy if exists "Public can read site copy" on public.cms_copy;
create policy "Public can read site copy"
  on public.cms_copy for select
  using (true);

drop policy if exists "Admin can manage site copy" on public.cms_copy;
create policy "Admin can manage site copy"
  on public.cms_copy for all
  using ((auth.jwt() ->> 'email') = 'dncraftloop@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');

insert into public.cms_projects (slug, title, meta, description, preview_kind, href, is_published, sort_order)
values
  ('diamond-crown', 'Diamond Crown', 'E-commerce · React · Firebase', 'Tienda, citas en línea y dashboard administrativo para un estudio de tatuajes, piercings y barbería.', 'shop', '/projects/diamond-crown', true, 0),
  ('panel-logistica-norte', 'Panel Logística Norte', 'Dashboard · Laravel', 'Control de inventario y reportes en tiempo real para operaciones.', 'dashboard', '', true, 1),
  ('agenda-pulso', 'Agenda Pulso', 'Web App · React', 'Reservas y recordatorios automáticos para clínicas y estudios.', 'app', '', true, 2)
on conflict (slug) do nothing;

insert into public.cms_services (id, title, description, icon_key, is_published, sort_order)
values
  ('web', 'Desarrollo web a la medida', 'Sitios corporativos y plataformas diseñadas para tu negocio, rápidas, seguras y fáciles de escalar.', 'web', true, 0),
  ('react', 'Aplicaciones React / Next.js', 'Interfaces modernas con renderizado híbrido, excelente SEO y rendimiento medible en Core Web Vitals.', 'react', true, 1),
  ('backend', 'Backend con Laravel', 'APIs robustas, paneles administrativos y lógica de negocio con arquitectura limpia y pruebas.', 'backend', true, 2),
  ('automation', 'Automatización', 'Integramos sistemas y eliminamos tareas repetitivas: reportes, correos, facturación y flujos internos.', 'automation', true, 3),
  ('design', 'Diseño UI/UX', 'Investigación, prototipos y sistemas de diseño que convierten visitantes en clientes.', 'design', true, 4),
  ('support', 'Mantenimiento y despliegue', 'Hosting, CI/CD, monitoreo y soporte continuo para que tu sitio nunca se detenga.', 'support', true, 5)
on conflict (id) do nothing;

insert into public.cms_copy (key, value)
values
  ('hero_tag', '<Dn Craft & Loop />'),
  ('hero_title', 'Ideas que cobran vida,'),
  ('hero_emphasis', 'código que no se detiene'),
  ('hero_description', 'Diseñamos, desarrollamos y desplegamos sitios y aplicaciones web a la medida. Estrategia clara, código limpio y entregas que funcionan desde el primer día.'),
  ('services_heading', 'Todo lo que tu producto digital necesita'),
  ('services_subheading', 'De la idea al servidor en producción: un solo equipo, una sola visión.'),
  ('process_heading', 'Un loop que mejora en cada vuelta'),
  ('process_subheading', 'Cuatro pasos claros. Cuando el proyecto sale a producción, el ciclo vuelve a empezar con datos reales.'),
  ('projects_heading', 'Trabajo que se nota'),
  ('projects_subheading', 'Una muestra del tipo de productos que construimos.'),
  ('cta_heading', '¿Listo para poner tu idea en producción?'),
  ('cta_description', 'Cuéntanos qué necesitas y te respondemos en menos de 24 horas con una propuesta clara.'),
  ('contact_heading', 'Empecemos a construir'),
  ('contact_description', 'Escríbenos con los detalles de tu proyecto: alcance, plazos y presupuesto aproximado.')
on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
values ('cms-projects', 'cms-projects', true)
on conflict (id) do nothing;

drop policy if exists "Public can view CMS project images" on storage.objects;
create policy "Public can view CMS project images"
  on storage.objects for select
  using (bucket_id = 'cms-projects');

drop policy if exists "Admin can upload CMS project images" on storage.objects;
create policy "Admin can upload CMS project images"
  on storage.objects for insert
  with check (bucket_id = 'cms-projects' and (auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');

drop policy if exists "Admin can update CMS project images" on storage.objects;
create policy "Admin can update CMS project images"
  on storage.objects for update
  using (bucket_id = 'cms-projects' and (auth.jwt() ->> 'email') = 'dncraftloop@gmail.com')
  with check (bucket_id = 'cms-projects' and (auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');

drop policy if exists "Admin can delete CMS project images" on storage.objects;
create policy "Admin can delete CMS project images"
  on storage.objects for delete
  using (bucket_id = 'cms-projects' and (auth.jwt() ->> 'email') = 'dncraftloop@gmail.com');
