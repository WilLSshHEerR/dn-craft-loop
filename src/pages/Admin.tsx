import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import logo from '../assets/Logo Dn Craft & Loop.png';
import {
  DEFAULT_SITE_COPY,
  fetchAdminCopy,
  fetchAdminProjects,
  fetchAdminServices,
  invalidateSiteCopyCache,
} from '../lib/cms';
import type { Project, Service, SiteCopy } from '../lib/cms';
import { adminEmail, supabase, supabaseConfigured } from '../lib/supabase';
import './admin.css';

type Tab = 'projects' | 'services' | 'copy' | 'users';

type BusinessRole = {
  id: string;
  name: string;
  description: string;
};

type BusinessPermission = {
  id: string;
  module: string;
  name: string;
  description: string;
};

type BusinessUser = {
  user_id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  role_id: string | null;
};

const copyFields: { key: keyof SiteCopy; label: string; section: string; multiline?: boolean }[] = [
  { key: 'hero_tag', label: 'Etiqueta', section: 'Inicio' },
  { key: 'hero_title', label: 'Título', section: 'Inicio' },
  { key: 'hero_emphasis', label: 'Texto destacado', section: 'Inicio' },
  { key: 'hero_description', label: 'Descripción', section: 'Inicio', multiline: true },
  { key: 'services_heading', label: 'Título', section: 'Servicios' },
  { key: 'services_subheading', label: 'Descripción', section: 'Servicios', multiline: true },
  { key: 'process_heading', label: 'Título', section: 'Proceso' },
  { key: 'process_subheading', label: 'Descripción', section: 'Proceso', multiline: true },
  { key: 'projects_heading', label: 'Título', section: 'Proyectos' },
  { key: 'projects_subheading', label: 'Descripción', section: 'Proyectos', multiline: true },
  { key: 'cta_heading', label: 'Título', section: 'Llamada a la acción' },
  { key: 'cta_description', label: 'Descripción', section: 'Llamada a la acción', multiline: true },
  { key: 'contact_heading', label: 'Título', section: 'Contacto' },
  { key: 'contact_description', label: 'Descripción', section: 'Contacto', multiline: true },
];

const emptyProject: Project = {
  slug: '',
  title: '',
  meta: '',
  description: '',
  preview_kind: 'shop',
  image_url: '',
  href: '',
  is_published: false,
  sort_order: 0,
};

const emptyService: Service = {
  id: '',
  title: '',
  description: '',
  icon_key: 'web',
  is_published: false,
  sort_order: 0,
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function ServicePreviewIcon({ icon }: { icon: Service['icon_key'] }) {
  const shapes: Record<Service['icon_key'], ReactNode> = {
    web: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18M8 21h8M12 18v3" /></>,
    react: <><circle cx="12" cy="12" r="2" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></>,
    backend: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    automation: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
    design: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    support: <><path d="M12 2a10 10 0 0 0-3 19.5M12 2c4 3 5 8 3 12l-3 8M8 14l-4 2M15 14l5 2" /><circle cx="12" cy="10" r="2" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{shapes[icon]}</svg>;
}

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  icon: string;
  description?: string;
};

const projectPreviewOptions: ChoiceOption<Project['preview_kind']>[] = [
  { value: 'shop', label: 'Tienda en línea', icon: '◇', description: 'Productos y comercio digital' },
  { value: 'dashboard', label: 'Dashboard', icon: '▥', description: 'Paneles e información' },
  { value: 'app', label: 'Aplicación', icon: '▯', description: 'Aplicaciones web y móviles' },
];

const serviceIconOptions: ChoiceOption<Service['icon_key']>[] = [
  { value: 'web', label: 'Desarrollo web', icon: '⌘', description: 'Sitios y plataformas web' },
  { value: 'react', label: 'React', icon: '◎', description: 'Aplicaciones e interfaces' },
  { value: 'backend', label: 'Backend', icon: '▤', description: 'APIs y bases de datos' },
  { value: 'automation', label: 'Automatización', icon: 'ϟ', description: 'Integraciones y procesos' },
  { value: 'design', label: 'Diseño', icon: '✳', description: 'Experiencia e interfaz' },
  { value: 'support', label: 'Soporte', icon: '⌁', description: 'Mantenimiento y despliegue' },
];

const individualPermissionOptions: ChoiceOption<'default' | 'allow' | 'deny'>[] = [
  { value: 'default', label: 'Usar rol', icon: '↔', description: 'Hereda el permiso asignado a su rol' },
  { value: 'allow', label: 'Permitir', icon: '✓', description: 'Concede este permiso solo a esta persona' },
  { value: 'deny', label: 'Denegar', icon: '−', description: 'Bloquea este permiso solo a esta persona' },
];

const permissionModuleNames: Record<string, string> = {
  cms: 'Sitio web',
  users: 'Usuarios',
  clients: 'Clientes',
  projects: 'Proyectos',
  contracts: 'Contratos',
  finance: 'Finanzas',
  accounting: 'Contabilidad',
  estimator: 'Estimador',
};

function ChoiceSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className = '',
  disabled = false,
}: {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
}) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex(option => option.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeOption = options.find(option => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLButtonElement>(`[data-option-index="${activeIndex}"]`)?.focus();
  }, [open, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab' && open) {
      setOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setActiveIndex(Math.max(0, options.findIndex(option => option.value === value)));
        setOpen(true);
        return;
      }
      setActiveIndex(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) selectOption(activeIndex);
      else setOpen(true);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    }
  };

  return (
    <div className={`admin-choice-field ${className}`}>
      <span className="admin-choice-label">{label}</span>
      <div className="admin-choice" ref={rootRef}>
        <button
          className={`admin-choice-trigger ${open ? 'is-open' : ''}`}
          type="button"
          ref={triggerRef}
          aria-label={label}
          disabled={disabled}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(current => !current)}
          onKeyDown={handleKeyDown}
        >
          <span className="admin-choice-icon" aria-hidden="true">{activeOption.icon}</span>
          <span className="admin-choice-selected">{activeOption.label}</span>
          <span className={`admin-choice-chevron ${open ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
        </button>
        {open && (
          <div id={menuId} className="admin-choice-menu" role="listbox" aria-label={label}>
            {options.map((option, index) => (
              <button
                key={option.value}
                className={`admin-choice-option ${option.value === value ? 'is-selected' : ''} ${index === activeIndex ? 'is-active' : ''}`}
                type="button"
                disabled={disabled}
                role="option"
                aria-selected={option.value === value}
                data-option-index={index}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
              >
                <span className="admin-choice-icon" aria-hidden="true">{option.icon}</span>
                <span className="admin-choice-option-copy"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
                {option.value === value && <span className="admin-choice-check" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasCmsAccess, setHasCmsAccess] = useState<boolean | null>(null);
  const [permissionsUserId, setPermissionsUserId] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([]);
  const [businessRoles, setBusinessRoles] = useState<BusinessRole[]>([]);
  const [businessPermissions, setBusinessPermissions] = useState<BusinessPermission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [userPermissionOverrides, setUserPermissionOverrides] = useState<Record<string, Record<string, boolean>>>({});
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [copy, setCopy] = useState<SiteCopy>(DEFAULT_SITE_COPY);
  const [project, setProject] = useState<Project>(emptyProject);
  const [service, setService] = useState<Service>(emptyService);
  const [editingProject, setEditingProject] = useState(false);
  const [editingService, setEditingService] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loginEmail, setLoginEmail] = useState(adminEmail);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setErrorMessage(error.message);
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !supabase) return;
    const client = supabase;
    let active = true;
    Promise.all([
      client.rpc('has_business_permission', { permission_name: 'cms.manage' }),
      client.rpc('has_business_permission', { permission_name: 'users.manage' }),
    ])
      .then(async ([cmsPermission, usersPermission]) => {
        if (!active) return;
        if (cmsPermission?.error) throw cmsPermission.error;
        if (usersPermission?.error) throw usersPermission.error;
        const hasAccess = cmsPermission?.data === true;
        setHasCmsAccess(hasAccess);
        setPermissionsUserId(session.user.id);
        setCanManageUsers(usersPermission?.data === true);
        if (!hasAccess) return;
        const [nextProjects, nextServices, nextCopy] = await Promise.all([
          fetchAdminProjects(),
          fetchAdminServices(),
          fetchAdminCopy(),
        ]);
        if (!active) return;
        setProjects(nextProjects);
        setServices(nextServices);
        setCopy(nextCopy);
        setErrorMessage('');
      })
      .catch((error: unknown) => {
        if (active) {
          setHasCmsAccess(false);
          setPermissionsUserId(session.user.id);
          setErrorMessage(`No se pudieron verificar tus permisos o cargar el contenido: ${getErrorMessage(error)}`);
        }
      })
      .finally(() => {
        if (active) setLoadingContent(false);
      });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!session || tab !== 'users' || !supabase || !hasCmsAccess) return;
    const client = supabase;
    let active = true;
    Promise.resolve(client.rpc('has_business_permission', { permission_name: 'users.manage' }))
      .then(async ({ data: canManage, error: permissionError }) => {
        if (permissionError) throw permissionError;
        if (!active) return;
        setCanManageUsers(canManage === true);
        if (!canManage) return;
        const [profilesResult, userRolesResult, rolesResult, permissionsResult, rolePermissionsResult, userPermissionsResult] = await Promise.all([
          client.from('business_profiles').select('user_id,email,display_name,is_active').order('email'),
          client.from('business_user_roles').select('user_id,role_id'),
          client.from('business_roles').select('id,name,description').order('name'),
          client.from('business_permissions').select('id,module,name,description').order('module').order('name'),
          client.from('business_role_permissions').select('role_id,permission_id'),
          client.from('business_user_permissions').select('user_id,permission_id,allowed'),
        ]);
        if (profilesResult.error) throw profilesResult.error;
        if (userRolesResult.error) throw userRolesResult.error;
        if (rolesResult.error) throw rolesResult.error;
        if (permissionsResult.error) throw permissionsResult.error;
        if (rolePermissionsResult.error) throw rolePermissionsResult.error;
        if (userPermissionsResult.error) throw userPermissionsResult.error;
        if (!active) return;
        const assignedRoles = new Map((userRolesResult.data ?? []).map(row => [row.user_id, row.role_id]));
        setBusinessUsers((profilesResult.data ?? []).map(profile => ({
          ...profile,
          role_id: assignedRoles.get(profile.user_id) ?? null,
        })));
        setBusinessRoles(rolesResult.data ?? []);
        setBusinessPermissions(permissionsResult.data ?? []);
        setRolePermissions((rolePermissionsResult.data ?? []).reduce<Record<string, string[]>>((map, item) => {
          map[item.role_id] = [...(map[item.role_id] ?? []), item.permission_id];
          return map;
        }, {}));
        setUserPermissionOverrides((userPermissionsResult.data ?? []).reduce<Record<string, Record<string, boolean>>>((map, item) => {
          map[item.user_id] = { ...(map[item.user_id] ?? {}), [item.permission_id]: item.allowed };
          return map;
        }, {}));
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(`No se pudieron cargar los usuarios: ${getErrorMessage(error)}`);
      })
      .finally(() => {
        if (active) setUsersLoaded(true);
      });
    return () => { active = false; };
  }, [session, tab, hasCmsAccess]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password,
    });
    setBusy(false);
    if (error) setErrorMessage(`No se pudo iniciar sesión: ${error.message}`);
  };

  const assignBusinessRole = async (userId: string, roleId: string) => {
    if (!supabase || !session || !canManageUsers) return;
    setBusy(true);
    setErrorMessage('');
    setNotice('');
    const { error } = await supabase
      .from('business_user_roles')
      .upsert({ user_id: userId, role_id: roleId, assigned_by: session.user.id }, { onConflict: 'user_id' });
    setBusy(false);
    if (error) {
      setErrorMessage(`No se pudo asignar el rol: ${error.message}`);
      return;
    }
    setBusinessUsers(users => users.map(user => user.user_id === userId ? { ...user, role_id: roleId } : user));
    setNotice('Rol asignado correctamente.');
  };

  const updateRolePermission = async (roleId: string, permissionId: string, allowed: boolean) => {
    if (!supabase || !canManageUsers || roleId === 'owner') return;
    setBusy(true);
    setErrorMessage('');
    setNotice('');
    const result = allowed
      ? await supabase.from('business_role_permissions').insert({ role_id: roleId, permission_id: permissionId })
      : await supabase.from('business_role_permissions').delete().eq('role_id', roleId).eq('permission_id', permissionId);
    setBusy(false);
    if (result.error) {
      setErrorMessage(`No se pudo actualizar el permiso: ${result.error.message}`);
      return;
    }
    setRolePermissions(current => ({
      ...current,
      [roleId]: allowed
        ? [...(current[roleId] ?? []), permissionId]
        : (current[roleId] ?? []).filter(id => id !== permissionId),
    }));
    setNotice('Permisos del rol actualizados.');
  };

  const updateUserPermission = async (userId: string, permissionId: string, value: string) => {
    if (!supabase || !canManageUsers) return;
    setBusy(true);
    setErrorMessage('');
    setNotice('');
    const result = value === 'default'
      ? await supabase.from('business_user_permissions').delete().eq('user_id', userId).eq('permission_id', permissionId)
      : await supabase.from('business_user_permissions').upsert({
        user_id: userId,
        permission_id: permissionId,
        allowed: value === 'allow',
        assigned_by: session?.user.id,
      }, { onConflict: 'user_id,permission_id' });
    setBusy(false);
    if (result.error) {
      setErrorMessage(`No se pudo actualizar el permiso individual: ${result.error.message}`);
      return;
    }
    setUserPermissionOverrides(current => {
      const userOverrides = { ...(current[userId] ?? {}) };
      if (value === 'default') delete userOverrides[permissionId];
      else userOverrides[permissionId] = value === 'allow';
      return { ...current, [userId]: userOverrides };
    });
    setNotice('Permiso individual actualizado.');
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const slug = editingProject ? project.slug : slugify(project.title);
    if (!slug) {
      setErrorMessage('El título debe contener letras o números para generar el identificador.');
      return;
    }
    const record = { ...project, slug };
    setBusy(true);
    setErrorMessage('');
    setNotice('');
    const result = editingProject
      ? await supabase.from('cms_projects').update(record).eq('slug', project.slug)
      : await supabase.from('cms_projects').insert(record);
    setBusy(false);
    if (result.error) {
      setErrorMessage(`No se pudo guardar el proyecto: ${result.error.message}`);
      return;
    }
    setProjects(await fetchAdminProjects());
    setProject(emptyProject);
    setEditingProject(false);
    setShowProjectForm(false);
    setNotice('Proyecto guardado.');
  };

  const saveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const id = editingService ? service.id : slugify(service.title);
    if (!id) {
      setErrorMessage('El título debe contener letras o números para generar el identificador.');
      return;
    }
    const record = { ...service, id };
    setBusy(true);
    setErrorMessage('');
    setNotice('');
    const result = editingService
      ? await supabase.from('cms_services').update(record).eq('id', service.id)
      : await supabase.from('cms_services').insert(record);
    setBusy(false);
    if (result.error) {
      setErrorMessage(`No se pudo guardar el servicio: ${result.error.message}`);
      return;
    }
    setServices(await fetchAdminServices());
    setService(emptyService);
    setEditingService(false);
    setShowServiceForm(false);
    setNotice('Servicio guardado.');
  };

  const deleteRecord = async (table: 'cms_projects' | 'cms_services', id: string, label: string) => {
    if (!supabase || !window.confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    setErrorMessage('');
    const { error } = await supabase.from(table).delete().eq(table === 'cms_projects' ? 'slug' : 'id', id);
    setBusy(false);
    if (error) {
      setErrorMessage(`No se pudo eliminar: ${error.message}`);
      return;
    }
    if (table === 'cms_projects') setProjects(await fetchAdminProjects());
    else setServices(await fetchAdminServices());
    setNotice('Elemento eliminado.');
  };

  const saveCopy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setErrorMessage('');
    setNotice('');
    const { error } = await supabase.from('cms_copy').upsert(
      Object.entries(copy).map(([key, value]) => ({ key, value })),
    );
    setBusy(false);
    if (error) {
      setErrorMessage(`No se pudo guardar el texto: ${error.message}`);
      return;
    }
    invalidateSiteCopyCache();
    setNotice('Textos guardados.');
  };

  const uploadImage = async (file?: File) => {
    if (!supabase || !file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selecciona un archivo de imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen debe pesar menos de 5 MB.');
      return;
    }
    const slug = slugify(project.title) || 'proyecto';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const path = `${slug}/${crypto.randomUUID()}-${safeName}`;
    setBusy(true);
    setErrorMessage('');
    const { error } = await supabase.storage.from('cms-projects').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    setBusy(false);
    if (error) {
      setErrorMessage(`No se pudo subir la imagen: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from('cms-projects').getPublicUrl(path);
    setProject(current => ({ ...current, image_url: data.publicUrl }));
    setNotice('Imagen subida. Guarda el proyecto para publicar el cambio.');
  };

  if (!supabaseConfigured) {
    return <main className="admin-page"><section className="admin-panel"><h1>CMS no configurado</h1><p>Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.</p></section></main>;
  }

  if (checkingSession) {
    return <main className="admin-page admin-centered"><p className="admin-loading">Verificando sesión…</p></main>;
  }

  if (!session) {
    return (
      <main className="admin-page">
        <form className="admin-panel admin-login" onSubmit={handleLogin}>
          <a className="admin-back" href="/">← Volver al sitio</a>
          <img className="admin-login-logo" src={logo} alt="Dn Craft & Loop" />
          <p className="admin-eyebrow">Dn Craft &amp; Loop</p>
          <h1>Tu contenido,<br /><span>bajo control.</span></h1>
          <p className="admin-login-description">Inicia sesión para actualizar proyectos, servicios y textos de tu sitio.</p>
          <label htmlFor="admin-email">Correo</label>
          <input id="admin-email" type="email" autoComplete="username" value={loginEmail} onChange={event => setLoginEmail(event.target.value)} required />
          <label htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
          <button className="admin-button" type="submit" disabled={busy}>{busy ? 'Verificando…' : <>Iniciar sesión <span aria-hidden="true">→</span></>}</button>
          <p className="admin-login-footnote">Acceso privado para el equipo de Dn Craft &amp; Loop</p>
        </form>
      </main>
    );
  }

  if (permissionsUserId !== session.user.id) {
    return <main className="admin-page admin-centered"><p className="admin-loading">Verificando permisos…</p></main>;
  }

  if (!hasCmsAccess) {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <h1>Acceso no autorizado</h1>
          <p>Esta cuenta no tiene asignado un rol con permiso para administrar el sitio.</p>
          {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
          <button className="admin-button" onClick={() => void supabase?.auth.signOut()}>Cerrar sesión</button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <a className="admin-brand" href="/" aria-label="Dn Craft & Loop, página principal"><img src={logo} alt="" /></a>
          <p className="admin-sidebar-label">ADMINISTRACIÓN</p>
          <nav className="admin-tabs" aria-label="Secciones del panel">
            <button className={tab === 'projects' ? 'active' : ''} aria-current={tab === 'projects' ? 'page' : undefined} onClick={() => setTab('projects')}><span className="admin-nav-icon" aria-hidden="true">▦</span> Proyectos <span className="admin-nav-count">{projects.length}</span></button>
            <button className={tab === 'services' ? 'active' : ''} aria-current={tab === 'services' ? 'page' : undefined} onClick={() => setTab('services')}><span className="admin-nav-icon" aria-hidden="true">◇</span> Servicios <span className="admin-nav-count">{services.length}</span></button>
            <button className={tab === 'copy' ? 'active' : ''} aria-current={tab === 'copy' ? 'page' : undefined} onClick={() => setTab('copy')}><span className="admin-nav-icon" aria-hidden="true">Aa</span> Textos del sitio</button>
            {canManageUsers && <button className={tab === 'users' ? 'active' : ''} aria-current={tab === 'users' ? 'page' : undefined} onClick={() => setTab('users')}><span className="admin-nav-icon" aria-hidden="true">♙</span> Usuarios y roles</button>}
          </nav>
          <div className="admin-sidebar-bottom">
            <span className="admin-online-dot" />
            <span><strong>Conectado</strong><small>{session.user.email}</small></span>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <div><p className="admin-eyebrow">ESCRITORIO / {tab === 'projects' ? 'PROYECTOS' : tab === 'services' ? 'SERVICIOS' : tab === 'copy' ? 'CONTENIDO' : 'USUARIOS'}</p><h1>{tab === 'projects' ? 'Proyectos' : tab === 'services' ? 'Servicios' : tab === 'copy' ? 'Textos del sitio' : 'Usuarios y roles'}</h1><p>{tab === 'users' ? 'Asigna a cada persona el nivel de acceso que necesita.' : 'Gestiona el contenido que se muestra en tu página.'}</p></div>
            <div className="admin-header-actions"><a className="admin-link" href="/" target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span> Ver sitio</a><button className="admin-button admin-button-secondary" onClick={() => void supabase?.auth.signOut()}><span aria-hidden="true">↪</span> Cerrar sesión</button></div>
          </header>
          {errorMessage && <p className="admin-error admin-alert" role="alert"><span aria-hidden="true">!</span>{errorMessage}</p>}
          {notice && <p className="admin-success admin-alert" role="status"><span aria-hidden="true">✓</span>{notice}</p>}
          {(busy || loadingContent) && <p className="admin-loading"><span className="admin-spinner" />{loadingContent ? 'Cargando contenido…' : 'Guardando cambios…'}</p>}

        {tab === 'projects' && (
          <section className="admin-section">
            <div className="admin-summary-grid">
              <article className="admin-summary-card"><span className="admin-summary-icon">▦</span><div><span>Total de proyectos</span><strong>{projects.length}</strong></div></article>
              <article className="admin-summary-card"><span className="admin-summary-icon published">✓</span><div><span>Publicados</span><strong>{projects.filter(item => item.is_published).length}</strong></div></article>
              <article className="admin-summary-card"><span className="admin-summary-icon draft">◷</span><div><span>Borradores</span><strong>{projects.filter(item => !item.is_published).length}</strong></div></article>
            </div>
            <div className="admin-section-heading"><div><h2>Todos los proyectos</h2><p>Administra las tarjetas de la sección de proyectos.</p></div><button className="admin-button" onClick={() => { setProject(emptyProject); setEditingProject(false); setShowProjectForm(true); setErrorMessage(''); }}><span aria-hidden="true">＋</span> Nuevo proyecto</button></div>
            {(showProjectForm || editingProject) && <form className="admin-form" onSubmit={saveProject}>
              <div className="admin-form-heading"><div><span className="admin-eyebrow">{editingProject ? 'EDITANDO' : 'NUEVO CONTENIDO'}</span><h3>{editingProject ? 'Editar proyecto' : 'Crear proyecto'}</h3></div><button className="admin-close-button" type="button" aria-label="Cerrar formulario" onClick={() => { setProject(emptyProject); setEditingProject(false); setShowProjectForm(false); }}>×</button></div>
              <div className="admin-editor-layout">
              <div className="admin-editor-fields">
                <fieldset className="admin-editor-group">
                  <legend><span>01</span> Contenido del proyecto</legend>
                  <p className="admin-editor-hint">La información principal que verá quien visite tu página.</p>
                  <div className="admin-form-grid">
                    <label className="admin-wide">Nombre del proyecto<input value={project.title} onChange={event => setProject({ ...project, title: event.target.value })} placeholder="Ej. Diamond Crown" required /></label>
                    <label className="admin-wide">Categoría y tecnologías<input value={project.meta} onChange={event => setProject({ ...project, meta: event.target.value })} placeholder="E-commerce · React · Firebase" /></label>
                    <label className="admin-wide">Descripción<textarea value={project.description} onChange={event => setProject({ ...project, description: event.target.value })} rows={4} placeholder="Describe brevemente el proyecto, qué resuelve y para quién." required /></label>
                  </div>
                </fieldset>
                <fieldset className="admin-editor-group">
                  <legend><span>02</span> Presentación y publicación</legend>
                  <p className="admin-editor-hint">Personaliza la imagen y dónde aparecerá la tarjeta.</p>
                  <div className="admin-form-grid">
                    <ChoiceSelect label="Tipo de proyecto" value={project.preview_kind} options={projectPreviewOptions} onChange={preview_kind => setProject({ ...project, preview_kind })} />
                    <label>Posición en la página<input type="number" min="0" value={project.sort_order} onChange={event => setProject({ ...project, sort_order: Number(event.target.value) })} /></label>
                    <label className="admin-wide">Enlace al proyecto <span className="admin-field-hint">Opcional · por ejemplo, /projects/diamond-crown</span><input value={project.href} onChange={event => setProject({ ...project, href: event.target.value })} placeholder="/projects/..." /></label>
                    <div className="admin-wide admin-upload">
                      <label htmlFor="project-image">Imagen de portada <span className="admin-field-hint">JPG, PNG o WebP · máximo 5 MB</span></label>
                      <input id="project-image" type="file" accept="image/*" onChange={event => void uploadImage(event.target.files?.[0])} />
                      {project.image_url && <span className="admin-image-status">✓ Imagen lista para guardar</span>}
                    </div>
                    <label className="admin-publish-toggle"><input type="checkbox" checked={project.is_published} onChange={event => setProject({ ...project, is_published: event.target.checked })} /><span className="admin-toggle-track" aria-hidden="true" /><span><strong>Publicar proyecto</strong><small>{project.is_published ? 'Visible para todas las personas' : 'Solo visible en el panel'}</small></span></label>
                  </div>
                </fieldset>
              </div>
              <aside className="admin-live-preview" aria-label="Previsualización de la tarjeta del proyecto">
                <div className="admin-preview-heading"><div><span className="admin-eyebrow">VISTA PREVIA</span><h4>Tarjeta en la página</h4></div><span className={`admin-status ${project.is_published ? 'is-published' : 'is-draft'}`}><i />{project.is_published ? 'Publicado' : 'Borrador'}</span></div>
                <article className="admin-preview-card">
                  <div className={`admin-preview-art ${project.preview_kind}`}>
                    {project.image_url
                      ? <img src={project.image_url} alt="" />
                      : <div className="admin-preview-illustration" aria-hidden="true"><span className="preview-window"><i /><i /><i /><b>{project.preview_kind === 'shop' ? '✦' : project.preview_kind === 'dashboard' ? '▥' : '▯'}</b><em /><em /><em /></span></div>}
                  </div>
                  <div className="admin-preview-copy">
                    <span className="admin-preview-meta">{project.meta || 'E-commerce · React · Firebase'}</span>
                    <h5>{project.title || 'Nombre del proyecto'}</h5>
                    <p>{project.description || 'Aquí aparecerá una breve descripción de tu proyecto para quienes visiten el sitio.'}</p>
                  </div>
                </article>
                <p className="admin-preview-note">La vista se actualiza mientras editas.</p>
              </aside>
              </div>
              <div className="admin-form-actions"><button className="admin-button" type="submit" disabled={busy}>{editingProject ? 'Guardar cambios' : 'Crear proyecto'} <span aria-hidden="true">→</span></button><button className="admin-button admin-button-secondary" type="button" onClick={() => { setProject(emptyProject); setEditingProject(false); setShowProjectForm(false); }}>Cancelar</button></div>
            </form>}
            <div className="admin-list-toolbar"><label className="admin-search"><span aria-hidden="true">⌕</span><input aria-label="Buscar proyectos" placeholder="Buscar proyectos..." value={search} onChange={event => setSearch(event.target.value)} /></label><span>{projects.length} {projects.length === 1 ? 'elemento' : 'elementos'}</span></div>
            <div className="admin-list">{projects.filter(item => `${item.title} ${item.meta}`.toLowerCase().includes(search.toLowerCase())).map(item => <article className="admin-item" key={item.slug}>
              <div className="admin-item-info">{item.image_url ? <img src={item.image_url} alt="" /> : <span className={`admin-project-placeholder ${item.preview_kind}`} aria-hidden="true">{item.preview_kind === 'shop' ? '◇' : item.preview_kind === 'dashboard' ? '▥' : '▯'}</span>}<div><h3>{item.title}</h3><p>{item.meta || 'Sin categoría'}</p></div></div>
              <div className="admin-item-end"><span className={`admin-status ${item.is_published ? 'is-published' : 'is-draft'}`}><i />{item.is_published ? 'Publicado' : 'Borrador'}</span><div className="admin-item-actions"><button onClick={() => { setProject(item); setEditingProject(true); setShowProjectForm(true); setErrorMessage(''); }}>Editar</button><button className="danger" onClick={() => void deleteRecord('cms_projects', item.slug, item.title)}>Eliminar</button></div></div>
            </article>)}
              {projects.filter(item => `${item.title} ${item.meta}`.toLowerCase().includes(search.toLowerCase())).length === 0 && <div className="admin-empty"><span aria-hidden="true">⌕</span><h3>No encontramos proyectos</h3><p>Prueba con otra búsqueda o crea un proyecto nuevo.</p></div>}
            </div>
          </section>
        )}

        {tab === 'services' && (
          <section className="admin-section">
            <div className="admin-summary-grid admin-summary-grid-small"><article className="admin-summary-card"><span className="admin-summary-icon">◇</span><div><span>Servicios registrados</span><strong>{services.length}</strong></div></article><article className="admin-summary-card"><span className="admin-summary-icon published">✓</span><div><span>Visibles en el sitio</span><strong>{services.filter(item => item.is_published).length}</strong></div></article></div>
            <div className="admin-section-heading"><div><h2>Servicios ofrecidos</h2><p>Los servicios publicados aparecen en la landing.</p></div><button className="admin-button" onClick={() => { setService(emptyService); setEditingService(false); setShowServiceForm(true); setErrorMessage(''); }}><span aria-hidden="true">＋</span> Nuevo servicio</button></div>
            {(showServiceForm || editingService) && <form className="admin-form" onSubmit={saveService}>
              <div className="admin-form-heading"><div><span className="admin-eyebrow">{editingService ? 'EDITANDO' : 'NUEVO CONTENIDO'}</span><h3>{editingService ? 'Editar servicio' : 'Crear servicio'}</h3></div><button className="admin-close-button" type="button" aria-label="Cerrar formulario" onClick={() => { setService(emptyService); setEditingService(false); setShowServiceForm(false); }}>×</button></div>
              <div className="admin-editor-layout">
                <div className="admin-editor-fields">
                  <fieldset className="admin-editor-group">
                    <legend><span>01</span> Contenido del servicio</legend>
                    <p className="admin-editor-hint">Explica con claridad qué ofreces y cómo ayudas a tus clientes.</p>
                    <div className="admin-form-grid">
                      <label className="admin-wide">Nombre del servicio<input value={service.title} onChange={event => setService({ ...service, title: event.target.value })} placeholder="Ej. Diseño UI/UX" required /></label>
                      <label className="admin-wide">Descripción<textarea value={service.description} onChange={event => setService({ ...service, description: event.target.value })} rows={4} placeholder="Describe el valor de este servicio y qué incluye." required /></label>
                    </div>
                  </fieldset>
                  <fieldset className="admin-editor-group">
                    <legend><span>02</span> Presentación y publicación</legend>
                    <p className="admin-editor-hint">Elige el icono y el orden en el que aparecerá.</p>
                    <div className="admin-form-grid">
                      <ChoiceSelect label="Icono del servicio" value={service.icon_key} options={serviceIconOptions} onChange={icon_key => setService({ ...service, icon_key })} />
                      <label>Posición en la página<input type="number" min="0" value={service.sort_order} onChange={event => setService({ ...service, sort_order: Number(event.target.value) })} /></label>
                      <label className="admin-publish-toggle admin-wide"><input type="checkbox" checked={service.is_published} onChange={event => setService({ ...service, is_published: event.target.checked })} /><span className="admin-toggle-track" aria-hidden="true" /><span><strong>Publicar servicio</strong><small>{service.is_published ? 'Visible para todas las personas' : 'Solo visible en el panel'}</small></span></label>
                    </div>
                  </fieldset>
                </div>
                <aside className="admin-live-preview" aria-label="Previsualización de la tarjeta del servicio">
                  <div className="admin-preview-heading"><div><span className="admin-eyebrow">VISTA PREVIA</span><h4>Tarjeta en la página</h4></div><span className={`admin-status ${service.is_published ? 'is-published' : 'is-draft'}`}><i />{service.is_published ? 'Publicado' : 'Borrador'}</span></div>
                  <article className="admin-service-preview-card">
                    <span className="admin-service-preview-icon"><ServicePreviewIcon icon={service.icon_key} /></span>
                    <h5>{service.title || 'Nombre del servicio'}</h5>
                    <p>{service.description || 'Aquí aparecerá una descripción de lo que incluye este servicio y cómo ayuda a tus clientes.'}</p>
                  </article>
                  <p className="admin-preview-note">La vista se actualiza mientras editas.</p>
                </aside>
              </div>
              <div className="admin-form-actions"><button className="admin-button" type="submit" disabled={busy}>{editingService ? 'Guardar cambios' : 'Crear servicio'} <span aria-hidden="true">→</span></button><button className="admin-button admin-button-secondary" type="button" onClick={() => { setService(emptyService); setEditingService(false); setShowServiceForm(false); }}>Cancelar</button></div>
            </form>}
            <div className="admin-list">{services.map(item => <article className="admin-item" key={item.id}><div className="admin-item-info"><span className="admin-service-icon" aria-hidden="true"><ServicePreviewIcon icon={item.icon_key} /></span><div><h3>{item.title}</h3><p>{item.description}</p></div></div><div className="admin-item-end"><span className={`admin-status ${item.is_published ? 'is-published' : 'is-draft'}`}><i />{item.is_published ? 'Publicado' : 'Borrador'}</span><div className="admin-item-actions"><button onClick={() => { setService(item); setEditingService(true); setShowServiceForm(true); setErrorMessage(''); }}>Editar</button><button className="danger" onClick={() => void deleteRecord('cms_services', item.id, item.title)}>Eliminar</button></div></div></article>)}
              {services.length === 0 && <div className="admin-empty"><span aria-hidden="true">◇</span><h3>Aún no hay servicios</h3><p>Agrega los servicios que quieres mostrar en tu página.</p></div>}
            </div>
          </section>
        )}

        {tab === 'users' && (
          <section className="admin-section">
            {!canManageUsers ? (
              <div className="admin-empty"><span aria-hidden="true">♙</span><h3>Acceso restringido</h3><p>Tu rol no tiene permiso para administrar usuarios.</p></div>
            ) : (
              <>
                <div className="admin-summary-grid admin-summary-grid-small">
                  <article className="admin-summary-card"><span className="admin-summary-icon">♙</span><div><span>Usuarios registrados</span><strong>{businessUsers.length}</strong></div></article>
                  <article className="admin-summary-card"><span className="admin-summary-icon published">◇</span><div><span>Roles disponibles</span><strong>{businessRoles.length}</strong></div></article>
                </div>
                <div className="admin-section-heading"><div><h2>Equipo y accesos</h2><p>Cada persona ve únicamente las áreas permitidas por su rol.</p></div></div>
                <p className="admin-info-note">Para invitar a alguien, crea primero su cuenta en Supabase: Authentication → Users → Invite user. Después de aceptar la invitación e iniciar sesión, aparecerá aquí para asignarle un rol.</p>
                <div className="admin-list">
                  {businessUsers.map(user => {
                    const role = businessRoles.find(item => item.id === user.role_id);
                    return (
                      <article className="admin-item admin-user-item" key={user.user_id}>
                        <div className="admin-item-info">
                          <span className="admin-user-avatar" aria-hidden="true">{(user.display_name || user.email).slice(0, 1).toUpperCase()}</span>
                          <div><h3>{user.display_name || user.email}</h3><p>{user.display_name ? user.email : role?.description ?? 'Cuenta sin rol asignado.'}</p></div>
                        </div>
                        <div className="admin-user-role">
                          <span className={`admin-status ${user.is_active ? 'is-published' : 'is-draft'}`}><i />{user.is_active ? 'Activo' : 'Desactivado'}</span>
                          {user.role_id && <ChoiceSelect
                            className="admin-choice-user-role"
                            label="Rol asignado"
                            value={user.role_id}
                            options={businessRoles.map(item => ({
                              value: item.id,
                              label: item.name,
                              icon: item.id === 'owner' ? '♛' : '♙',
                              description: item.description,
                            }))}
                            onChange={roleId => void assignBusinessRole(user.user_id, roleId)}
                            disabled={busy || !user.is_active}
                          />}
                        </div>
                        {user.role_id !== 'owner' && (
                          <details className="admin-user-permissions">
                            <summary>Permisos individuales de esta persona</summary>
                            <div className="admin-user-permission-grid">
                              {businessPermissions.map(permission => {
                                const override = userPermissionOverrides[user.user_id]?.[permission.id];
                                const inherited = (rolePermissions[user.role_id ?? ''] ?? []).includes(permission.id);
                                return (
                                  <div className="admin-user-permission-option" key={permission.id}>
                                    <span><strong>{permission.name}</strong><small>Por rol: {inherited ? 'permitido' : 'sin acceso'}</small></span>
                                    <ChoiceSelect
                                      className="admin-choice-permission"
                                      label={`${permission.name} para ${user.email}`}
                                      value={override === undefined ? 'default' : override ? 'allow' : 'deny'}
                                      options={individualPermissionOptions}
                                      disabled={busy || !user.is_active}
                                      onChange={value => void updateUserPermission(user.user_id, permission.id, value)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </details>
                        )}
                      </article>
                    );
                  })}
                  {businessUsers.length === 0 && usersLoaded && <div className="admin-empty"><span aria-hidden="true">♙</span><h3>Aún no hay usuarios</h3><p>Invita a las personas desde Supabase Authentication y después asígnales un rol aquí.</p></div>}
                </div>
                <div className="admin-role-access">
                  <div className="admin-section-heading"><div><h2>Permisos por rol</h2><p>Ajusta qué módulos puede utilizar cada rol. Los cambios aplican a todas las personas con ese rol.</p></div></div>
                  <div className="admin-role-grid">
                    {businessRoles.map(role => (
                      <article className="admin-role-card" key={role.id}>
                        <div className="admin-role-card-heading"><h3>{role.name}</h3><p>{role.description}</p></div>
                        {role.id === 'owner' ? (
                          <p className="admin-owner-lock">Acceso total permanente. Este rol no se puede restringir.</p>
                        ) : (
                          [...new Set(businessPermissions.map(permission => permission.module))].map(module => (
                            <fieldset className="admin-permission-group" key={module}>
                              <legend>{permissionModuleNames[module] ?? module}</legend>
                              {businessPermissions.filter(permission => permission.module === module).map(permission => (
                                <label className="admin-permission-option" key={permission.id}>
                                  <input
                                    type="checkbox"
                                    checked={(rolePermissions[role.id] ?? []).includes(permission.id)}
                                    disabled={busy}
                                    onChange={event => void updateRolePermission(role.id, permission.id, event.target.checked)}
                                  />
                                  <span><strong>{permission.name}</strong><small>{permission.description}</small></span>
                                </label>
                              ))}
                            </fieldset>
                          ))
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'copy' && (
          <section className="admin-section">
            <div className="admin-section-heading"><div><h2>Textos de la página</h2><p>Edita los encabezados y descripciones principales de la landing.</p></div></div>
            <form className="admin-form" onSubmit={saveCopy}>
              {['Inicio', 'Servicios', 'Proceso', 'Proyectos', 'Llamada a la acción', 'Contacto'].map(section => <fieldset className="admin-copy-group" key={section}><legend>{section}</legend>{copyFields.filter(field => field.section === section).map(field => <label key={field.key}>{field.label}{field.multiline ? <textarea rows={3} value={copy[field.key]} onChange={event => setCopy({ ...copy, [field.key]: event.target.value })} /> : <input value={copy[field.key]} onChange={event => setCopy({ ...copy, [field.key]: event.target.value })} />}</label>)}</fieldset>)}
              <button className="admin-button" type="submit" disabled={busy}>Guardar textos</button>
            </form>
          </section>
        )}
        </div>
      </div>
    </main>
  );
}
