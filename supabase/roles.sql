create table if not exists public.business_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  is_active boolean not null default true,
  must_change_password boolean not null default false,
  password_setup_started_at timestamptz,
  requires_email_verification boolean not null default false,
  email_verification_deadline timestamptz,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_profiles
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_setup_started_at timestamptz,
  add column if not exists requires_email_verification boolean not null default false,
  add column if not exists email_verification_deadline timestamptz,
  add column if not exists email_verified_at timestamptz;

create table if not exists public.business_roles (
  id text primary key,
  name text not null,
  description text not null default '',
  is_system boolean not null default true
);

create table if not exists public.business_permissions (
  id text primary key,
  module text not null,
  name text not null,
  description text not null default ''
);

create table if not exists public.business_role_permissions (
  role_id text not null references public.business_roles(id) on delete cascade,
  permission_id text not null references public.business_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.business_user_roles (
  user_id uuid primary key references public.business_profiles(user_id) on delete cascade,
  role_id text not null references public.business_roles(id),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now()
);

create table if not exists public.business_user_permissions (
  user_id uuid not null references public.business_profiles(user_id) on delete cascade,
  permission_id text not null references public.business_permissions(id) on delete cascade,
  allowed boolean not null,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, permission_id)
);

insert into public.business_roles (id, name, description) values
  ('owner', 'Propietario', 'Acceso completo a la plataforma y a la gestión de usuarios.'),
  ('operations_admin', 'Administrador de operaciones', 'Gestiona clientes, proyectos, contratos y contenido del sitio.'),
  ('project_manager', 'Gestor de proyectos', 'Coordina proyectos, avances y contratos asignados.'),
  ('finance', 'Finanzas', 'Administra costos, pagos, presupuestos e informes contables.'),
  ('collaborator', 'Colaborador', 'Participa en los proyectos que se le asignen.'),
  ('client', 'Cliente', 'Consulta únicamente sus propios proyectos, contratos y pagos.')
on conflict (id) do update
set name = excluded.name, description = excluded.description;

insert into public.business_permissions (id, module, name, description) values
  ('cms.manage', 'cms', 'Administrar sitio', 'Gestionar proyectos públicos, servicios y textos del sitio.'),
  ('users.manage', 'users', 'Administrar usuarios', 'Consultar usuarios y asignar roles y permisos.'),
  ('clients.view', 'clients', 'Ver clientes', 'Consultar registros de clientes.'),
  ('clients.view_assigned', 'clients', 'Ver clientes asignados', 'Consultar únicamente los clientes asociados.'),
  ('clients.manage', 'clients', 'Gestionar clientes', 'Crear, editar y archivar clientes.'),
  ('projects.view', 'projects', 'Ver proyectos', 'Consultar proyectos de negocio autorizados.'),
  ('projects.view_assigned', 'projects', 'Ver proyectos asignados', 'Consultar únicamente los proyectos asignados.'),
  ('projects.manage', 'projects', 'Gestionar proyectos', 'Crear y actualizar proyectos, tareas y avances.'),
  ('projects.manage_assigned', 'projects', 'Gestionar proyectos asignados', 'Actualizar únicamente los proyectos asignados.'),
  ('projects.progress_update_assigned', 'projects', 'Actualizar avances asignados', 'Registrar avances en los proyectos asignados.'),
  ('tasks.manage_assigned', 'projects', 'Gestionar tareas asignadas', 'Actualizar tareas asignadas a la persona.'),
  ('contracts.view', 'contracts', 'Ver contratos', 'Consultar contratos autorizados.'),
  ('contracts.view_assigned', 'contracts', 'Ver contratos asignados', 'Consultar únicamente los contratos asociados.'),
  ('contracts.manage', 'contracts', 'Gestionar contratos', 'Crear, actualizar y archivar contratos.'),
  ('finance.view', 'finance', 'Ver finanzas', 'Consultar costos, presupuestos y pagos.'),
  ('finance.view_own', 'finance', 'Ver pagos propios', 'Consultar únicamente pagos asociados a la propia cuenta o proyecto.'),
  ('finance.manage', 'finance', 'Gestionar finanzas', 'Registrar y actualizar costos, presupuestos y pagos.'),
  ('accounting.view', 'accounting', 'Ver contabilidad', 'Consultar informes contables.'),
  ('accounting.manage', 'accounting', 'Gestionar contabilidad', 'Administrar registros e informes contables.'),
  ('estimator.manage', 'estimator', 'Administrar estimador', 'Configurar conceptos, rangos y reglas del estimador público.')
on conflict (id) do update
set module = excluded.module, name = excluded.name, description = excluded.description;

insert into public.business_role_permissions (role_id, permission_id)
select 'owner', id from public.business_permissions
on conflict do nothing;

insert into public.business_role_permissions (role_id, permission_id) values
  ('operations_admin', 'cms.manage'),
  ('operations_admin', 'clients.view'),
  ('operations_admin', 'clients.manage'),
  ('operations_admin', 'projects.view'),
  ('operations_admin', 'projects.manage'),
  ('operations_admin', 'contracts.view'),
  ('operations_admin', 'contracts.manage'),
  ('project_manager', 'clients.view_assigned'),
  ('project_manager', 'projects.view_assigned'),
  ('project_manager', 'projects.manage_assigned'),
  ('project_manager', 'contracts.view_assigned'),
  ('finance', 'clients.view'),
  ('finance', 'projects.view'),
  ('finance', 'contracts.view'),
  ('finance', 'finance.view'),
  ('finance', 'finance.manage'),
  ('finance', 'accounting.view'),
  ('finance', 'accounting.manage'),
  ('collaborator', 'projects.view_assigned'),
  ('collaborator', 'projects.progress_update_assigned'),
  ('collaborator', 'tasks.manage_assigned'),
  ('client', 'projects.view_assigned'),
  ('client', 'contracts.view_assigned'),
  ('client', 'finance.view_own')
on conflict do nothing;

create or replace function public.has_business_permission(permission_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_profiles profile
    join auth.users auth_user on auth_user.id = profile.user_id
    left join public.business_user_roles user_role on user_role.user_id = profile.user_id
    left join public.business_role_permissions role_permission on role_permission.role_id = user_role.role_id
    left join public.business_user_permissions user_permission
      on user_permission.user_id = profile.user_id
      and user_permission.permission_id = permission_name
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and not profile.must_change_password
      and (
        not profile.requires_email_verification
        or auth_user.email_confirmed_at is not null
        or profile.email_verification_deadline > now()
      )
      and (
        user_role.role_id = 'owner'
        or coalesce(user_permission.allowed, false)
        or (
          user_permission.user_id is null
          and role_permission.permission_id = permission_name
        )
      )
  );
$$;

create or replace function public.is_business_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_profiles profile
    join auth.users auth_user on auth_user.id = profile.user_id
    join public.business_user_roles user_role on user_role.user_id = profile.user_id
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and user_role.role_id = 'owner'
  );
$$;

create or replace function public.complete_business_user_password_setup()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  setup_started_at timestamptz;
  auth_updated_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'Se requiere una sesión válida.';
  end if;

  select profile.password_setup_started_at
  into setup_started_at
  from public.business_profiles profile
  where profile.user_id = current_user_id
    and profile.must_change_password;

  if setup_started_at is null then
    raise exception 'Esta cuenta no tiene un cambio de contraseña pendiente.';
  end if;

  select auth_user.updated_at
  into auth_updated_at
  from auth.users auth_user
  where auth_user.id = current_user_id;

  if auth_updated_at is null or auth_updated_at <= setup_started_at then
    raise exception 'Actualiza la contraseña antes de completar la configuración.';
  end if;

  update public.business_profiles
  set must_change_password = false,
      password_setup_started_at = null,
      updated_at = now()
  where user_id = current_user_id;
end;
$$;

create or replace function public.sync_business_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_role_id text;
begin
  insert into public.business_profiles as profile (user_id, email, display_name, email_verified_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email_confirmed_at
  )
  on conflict (user_id) do update
    set email = excluded.email,
        display_name = case when excluded.display_name = '' then profile.display_name else excluded.display_name end,
    email_verified_at = new.email_confirmed_at,
    password_setup_started_at = case
      when old.email_confirmed_at is null
        and new.email_confirmed_at is not null
        and profile.must_change_password
        then now()
      else profile.password_setup_started_at
    end,
    updated_at = now();

  if lower(coalesce(new.email, '')) = 'dncraftloop@gmail.com' then
    select id into owner_role_id from public.business_roles where id = 'owner';
    insert into public.business_user_roles (user_id, role_id)
    values (new.id, owner_role_id)
    on conflict (user_id) do update set role_id = excluded.role_id;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_last_business_owner_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_count integer;
begin
  if old.role_id = 'owner' and (tg_op = 'DELETE' or new.role_id <> 'owner') then
    select count(*) into owner_count
    from public.business_user_roles
    where role_id = 'owner' and user_id <> old.user_id;
    if owner_count = 0 then
      raise exception 'No se puede quitar el último rol de propietario.';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.prevent_business_owner_deactivation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.is_active and not new.is_active and exists (
    select 1 from public.business_user_roles
    where user_id = old.user_id and role_id = 'owner'
  ) then
    raise exception 'No se puede desactivar al propietario de la plataforma.';
  end if;
  return new;
end;
$$;

create or replace function public.prevent_owner_permission_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role_id = 'owner' then
    raise exception 'Los permisos del rol Propietario no se pueden modificar.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_business_profile on auth.users;
create trigger on_auth_user_business_profile
  after insert or update of email, raw_user_meta_data, email_confirmed_at on auth.users
  for each row execute function public.sync_business_profile();

update public.business_profiles profile
set email_verified_at = auth_user.email_confirmed_at
from auth.users auth_user
where auth_user.id = profile.user_id
  and profile.email_verified_at is distinct from auth_user.email_confirmed_at;

drop trigger if exists protect_last_business_owner on public.business_user_roles;
create trigger protect_last_business_owner
  before update or delete on public.business_user_roles
  for each row execute function public.prevent_last_business_owner_change();

drop trigger if exists protect_business_owner_deactivation on public.business_profiles;
create trigger protect_business_owner_deactivation
  before update of is_active on public.business_profiles
  for each row execute function public.prevent_business_owner_deactivation();

drop trigger if exists protect_owner_permissions on public.business_role_permissions;
create trigger protect_owner_permissions
  before update or delete on public.business_role_permissions
  for each row execute function public.prevent_owner_permission_changes();

insert into public.business_profiles (user_id, email, display_name)
select id, coalesce(email, ''), coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', '')
from auth.users
on conflict (user_id) do update
set email = excluded.email, updated_at = now();

insert into public.business_user_roles (user_id, role_id)
select profile.user_id, 'owner'
from public.business_profiles profile
where lower(profile.email) = 'dncraftloop@gmail.com'
on conflict (user_id) do update set role_id = excluded.role_id;

alter table public.business_profiles enable row level security;
alter table public.business_roles enable row level security;
alter table public.business_permissions enable row level security;
alter table public.business_role_permissions enable row level security;
alter table public.business_user_roles enable row level security;
alter table public.business_user_permissions enable row level security;

drop policy if exists "Users can read own business profile" on public.business_profiles;
create policy "Users can read own business profile"
  on public.business_profiles for select to authenticated
  using (user_id = (select auth.uid()) or public.has_business_permission('users.manage'));

drop policy if exists "Owners can manage business profiles" on public.business_profiles;
create policy "Owners can manage business profiles"
  on public.business_profiles for update to authenticated
  using (public.is_business_owner())
  with check (public.is_business_owner());

drop policy if exists "Authenticated users can read business roles" on public.business_roles;
create policy "Authenticated users can read business roles"
  on public.business_roles for select to authenticated using (true);

drop policy if exists "Owners can manage business roles" on public.business_roles;
create policy "Owners can manage business roles"
  on public.business_roles for all to authenticated
  using (public.is_business_owner())
  with check (public.is_business_owner());

drop policy if exists "Authenticated users can read business permissions" on public.business_permissions;
create policy "Authenticated users can read business permissions"
  on public.business_permissions for select to authenticated using (true);

drop policy if exists "Owners can manage business permissions" on public.business_permissions;
create policy "Owners can manage business permissions"
  on public.business_permissions for all to authenticated
  using (public.is_business_owner())
  with check (public.is_business_owner());

drop policy if exists "Authenticated users can read role permissions" on public.business_role_permissions;
create policy "Authenticated users can read role permissions"
  on public.business_role_permissions for select to authenticated using (true);

drop policy if exists "Owners can manage role permissions" on public.business_role_permissions;
create policy "Owners can manage role permissions"
  on public.business_role_permissions for all to authenticated
  using (public.is_business_owner())
  with check (public.is_business_owner());

drop policy if exists "Users can read own business role" on public.business_user_roles;
create policy "Users can read own business role"
  on public.business_user_roles for select to authenticated
  using (user_id = (select auth.uid()) or public.has_business_permission('users.manage'));

drop policy if exists "Authorized users can assign business roles" on public.business_user_roles;
create policy "Authorized users can assign business roles"
  on public.business_user_roles for all to authenticated
  using (
    public.has_business_permission('users.manage')
    and (role_id <> 'owner' or public.is_business_owner())
  )
  with check (
    public.has_business_permission('users.manage')
    and (role_id <> 'owner' or public.is_business_owner())
  );

drop policy if exists "Users can read own permission overrides" on public.business_user_permissions;
create policy "Users can read own permission overrides"
  on public.business_user_permissions for select to authenticated
  using (user_id = (select auth.uid()) or public.has_business_permission('users.manage'));

drop policy if exists "Owners can manage permission overrides" on public.business_user_permissions;
create policy "Owners can manage permission overrides"
  on public.business_user_permissions for all to authenticated
  using (public.is_business_owner())
  with check (public.is_business_owner());

grant execute on function public.has_business_permission(text) to anon, authenticated;
grant execute on function public.is_business_owner() to authenticated;
revoke all on function public.complete_business_user_password_setup() from public, anon;
grant execute on function public.complete_business_user_password_setup() to authenticated;

drop policy if exists "Admin can manage projects" on public.cms_projects;
drop policy if exists "Authorized users can manage projects" on public.cms_projects;
create policy "Authorized users can manage projects"
  on public.cms_projects for all to authenticated
  using (public.has_business_permission('cms.manage'))
  with check (public.has_business_permission('cms.manage'));

drop policy if exists "Public can read published projects" on public.cms_projects;
create policy "Public can read published projects"
  on public.cms_projects for select
  using (is_published or public.has_business_permission('cms.manage'));

drop policy if exists "Admin can manage services" on public.cms_services;
drop policy if exists "Authorized users can manage services" on public.cms_services;
create policy "Authorized users can manage services"
  on public.cms_services for all to authenticated
  using (public.has_business_permission('cms.manage'))
  with check (public.has_business_permission('cms.manage'));

drop policy if exists "Public can read published services" on public.cms_services;
create policy "Public can read published services"
  on public.cms_services for select
  using (is_published or public.has_business_permission('cms.manage'));

drop policy if exists "Admin can manage site copy" on public.cms_copy;
drop policy if exists "Authorized users can manage site copy" on public.cms_copy;
create policy "Authorized users can manage site copy"
  on public.cms_copy for all to authenticated
  using (public.has_business_permission('cms.manage'))
  with check (public.has_business_permission('cms.manage'));

drop policy if exists "Admin can upload CMS project images" on storage.objects;
drop policy if exists "Authorized users can upload CMS project images" on storage.objects;
create policy "Authorized users can upload CMS project images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'cms-projects' and public.has_business_permission('cms.manage'));

drop policy if exists "Admin can update CMS project images" on storage.objects;
drop policy if exists "Authorized users can update CMS project images" on storage.objects;
create policy "Authorized users can update CMS project images"
  on storage.objects for update to authenticated
  using (bucket_id = 'cms-projects' and public.has_business_permission('cms.manage'))
  with check (bucket_id = 'cms-projects' and public.has_business_permission('cms.manage'));

drop policy if exists "Admin can delete CMS project images" on storage.objects;
drop policy if exists "Authorized users can delete CMS project images" on storage.objects;
create policy "Authorized users can delete CMS project images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cms-projects' and public.has_business_permission('cms.manage'));
