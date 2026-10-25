import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
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

type Tab = 'projects' | 'services' | 'copy';

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

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);
  const [tab, setTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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
    if (!session) return;
    if (session.user.email?.toLowerCase() !== adminEmail) return;
    let active = true;
    Promise.all([fetchAdminProjects(), fetchAdminServices(), fetchAdminCopy()])
      .then(([nextProjects, nextServices, nextCopy]) => {
        if (!active) return;
        setProjects(nextProjects);
        setServices(nextServices);
        setCopy(nextCopy);
        setErrorMessage('');
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(`No se pudo cargar el contenido: ${getErrorMessage(error)}`);
      })
      .finally(() => {
        if (active) setLoadingContent(false);
      });
    return () => { active = false; };
  }, [session]);

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
    return <main className="admin-page"><p className="admin-loading">Verificando sesión…</p></main>;
  }

  if (!session) {
    return (
      <main className="admin-page">
        <form className="admin-panel admin-login" onSubmit={handleLogin}>
          <a className="admin-back" href="/">← Volver al sitio</a>
          <p className="admin-eyebrow">Dn Craft &amp; Loop</p>
          <h1>Administrar contenido</h1>
          <p>Inicia sesión con la cuenta administradora autorizada.</p>
          <label htmlFor="admin-email">Correo</label>
          <input id="admin-email" type="email" autoComplete="username" value={loginEmail} onChange={event => setLoginEmail(event.target.value)} required />
          <label htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
          <button className="admin-button" type="submit" disabled={busy}>{busy ? 'Verificando…' : 'Iniciar sesión'}</button>
        </form>
      </main>
    );
  }

  if (session.user.email?.toLowerCase() !== adminEmail) {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <h1>Acceso no autorizado</h1>
          <p>Esta cuenta no tiene permiso para administrar el sitio. El CMS está limitado a {adminEmail}.</p>
          <button className="admin-button" onClick={() => void supabase?.auth.signOut()}>Cerrar sesión</button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div><p className="admin-eyebrow">Dn Craft &amp; Loop</p><h1>Panel de contenido</h1><p>Sesión: {session.user.email}</p></div>
          <div className="admin-header-actions"><a className="admin-link" href="/" target="_blank" rel="noreferrer">Ver sitio ↗</a><button className="admin-button admin-button-secondary" onClick={() => void supabase?.auth.signOut()}>Cerrar sesión</button></div>
        </header>
        <nav className="admin-tabs" aria-label="Secciones del panel">
          <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}>Proyectos</button>
          <button className={tab === 'services' ? 'active' : ''} onClick={() => setTab('services')}>Servicios</button>
          <button className={tab === 'copy' ? 'active' : ''} onClick={() => setTab('copy')}>Textos del sitio</button>
        </nav>
        {errorMessage && <p className="admin-error admin-alert" role="alert">{errorMessage}</p>}
        {notice && <p className="admin-success admin-alert" role="status">{notice}</p>}
        {(busy || loadingContent) && <p className="admin-loading">Guardando o cargando…</p>}

        {tab === 'projects' && (
          <section className="admin-section">
            <div className="admin-section-heading"><div><h2>Proyectos</h2><p>Gestiona las tarjetas que aparecen en la sección Proyectos.</p></div><button className="admin-button" onClick={() => { setProject(emptyProject); setEditingProject(false); setErrorMessage(''); }}>Nuevo proyecto</button></div>
            <form className="admin-form" onSubmit={saveProject}>
              <h3>{editingProject ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
              <div className="admin-form-grid">
                <label>Título<input value={project.title} onChange={event => setProject({ ...project, title: event.target.value })} required /></label>
                <label>Meta / tecnologías<input value={project.meta} onChange={event => setProject({ ...project, meta: event.target.value })} placeholder="E-commerce · React" /></label>
                <label>Enlace (opcional)<input value={project.href} onChange={event => setProject({ ...project, href: event.target.value })} placeholder="/projects/..." /></label>
                <label>Orden<input type="number" value={project.sort_order} onChange={event => setProject({ ...project, sort_order: Number(event.target.value) })} /></label>
                <label>Vista previa<select value={project.preview_kind} onChange={event => setProject({ ...project, preview_kind: event.target.value as Project['preview_kind'] })}><option value="shop">Tienda</option><option value="dashboard">Dashboard</option><option value="app">Aplicación</option></select></label>
                <label className="admin-checkbox"><input type="checkbox" checked={project.is_published} onChange={event => setProject({ ...project, is_published: event.target.checked })} /> Publicado</label>
                <label className="admin-wide">Descripción<textarea value={project.description} onChange={event => setProject({ ...project, description: event.target.value })} rows={3} required /></label>
                <label className="admin-wide">Imagen (opcional)<input type="file" accept="image/*" onChange={event => void uploadImage(event.target.files?.[0])} />{project.image_url && <span className="admin-image-status">Imagen lista para guardar</span>}</label>
              </div>
              <div className="admin-form-actions"><button className="admin-button" type="submit" disabled={busy}>{editingProject ? 'Guardar cambios' : 'Crear proyecto'}</button><button className="admin-button admin-button-secondary" type="button" onClick={() => { setProject(emptyProject); setEditingProject(false); }}>Cancelar</button></div>
            </form>
            <div className="admin-list">{projects.map(item => <article className="admin-item" key={item.slug}>
              <div>{item.image_url && <img src={item.image_url} alt="" />}<h3>{item.title}</h3><p>{item.meta} · {item.is_published ? 'Publicado' : 'Borrador'}</p></div>
              <div className="admin-item-actions"><button onClick={() => { setProject(item); setEditingProject(true); setErrorMessage(''); }}>Editar</button><button className="danger" onClick={() => void deleteRecord('cms_projects', item.slug, item.title)}>Eliminar</button></div>
            </article>)}</div>
          </section>
        )}

        {tab === 'services' && (
          <section className="admin-section">
            <div className="admin-section-heading"><div><h2>Servicios</h2><p>Los servicios publicados aparecen en la landing.</p></div><button className="admin-button" onClick={() => { setService(emptyService); setEditingService(false); setErrorMessage(''); }}>Nuevo servicio</button></div>
            <form className="admin-form" onSubmit={saveService}>
              <h3>{editingService ? 'Editar servicio' : 'Nuevo servicio'}</h3>
              <div className="admin-form-grid">
                <label>Título<input value={service.title} onChange={event => setService({ ...service, title: event.target.value })} required /></label>
                <label>Icono<select value={service.icon_key} onChange={event => setService({ ...service, icon_key: event.target.value as Service['icon_key'] })}><option value="web">Desarrollo web</option><option value="react">React</option><option value="backend">Backend</option><option value="automation">Automatización</option><option value="design">Diseño</option><option value="support">Soporte</option></select></label>
                <label>Orden<input type="number" value={service.sort_order} onChange={event => setService({ ...service, sort_order: Number(event.target.value) })} /></label>
                <label className="admin-checkbox"><input type="checkbox" checked={service.is_published} onChange={event => setService({ ...service, is_published: event.target.checked })} /> Publicado</label>
                <label className="admin-wide">Descripción<textarea value={service.description} onChange={event => setService({ ...service, description: event.target.value })} rows={3} required /></label>
              </div>
              <div className="admin-form-actions"><button className="admin-button" type="submit" disabled={busy}>{editingService ? 'Guardar cambios' : 'Crear servicio'}</button><button className="admin-button admin-button-secondary" type="button" onClick={() => { setService(emptyService); setEditingService(false); }}>Cancelar</button></div>
            </form>
            <div className="admin-list">{services.map(item => <article className="admin-item" key={item.id}><div><h3>{item.title}</h3><p>{item.is_published ? 'Publicado' : 'Borrador'} · Orden {item.sort_order}</p></div><div className="admin-item-actions"><button onClick={() => { setService(item); setEditingService(true); setErrorMessage(''); }}>Editar</button><button className="danger" onClick={() => void deleteRecord('cms_services', item.id, item.title)}>Eliminar</button></div></article>)}</div>
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
    </main>
  );
}
