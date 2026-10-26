import { createClient, type User } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateTemporaryPassword(length = 32) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+';
  const maxUnbiasedValue = 256 - (256 % alphabet.length);
  let password = '';
  while (password.length < length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= maxUnbiasedValue) continue;
      password += alphabet[byte % alphabet.length];
      if (password.length === length) break;
    }
  }
  return password;
}

const temporaryPasswordRoleIds = new Set([
  'operations_admin',
  'project_manager',
  'finance',
  'collaborator',
]);

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Método no permitido.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization) return jsonResponse({ error: 'Se requiere una sesión válida.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Falta configurar SUPABASE_URL, SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY.');
    return jsonResponse({ error: 'La función de invitaciones no está configurada.' }, 500);
  }

  const requesterClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await requesterClient.auth.getUser();
  if (authError || !authData.user) return jsonResponse({ error: 'La sesión no es válida o ha expirado.' }, 401);

  const { data: canManageUsers, error: permissionError } = await requesterClient.rpc(
    'has_business_permission',
    { permission_name: 'users.manage' },
  );
  if (permissionError) {
    console.error('No se pudieron verificar los permisos de invitación:', permissionError.message);
    return jsonResponse({ error: 'No se pudieron verificar los permisos de la cuenta.' }, 500);
  }
  if (canManageUsers !== true) return jsonResponse({ error: 'No tienes permiso para invitar usuarios.' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'El cuerpo de la solicitud debe ser JSON válido.' }, 400);
  }
  if (typeof payload !== 'object' || payload === null) {
    return jsonResponse({ error: 'La información del usuario no es válida.' }, 400);
  }

  const {
    email,
    display_name: displayName,
    role_id: roleId,
    delivery = 'email',
  } = payload as Record<string, unknown>;
  if (typeof email !== 'string' || typeof displayName !== 'string' || typeof roleId !== 'string') {
    return jsonResponse({ error: 'Completa el correo, nombre y rol de la persona.' }, 400);
  }
  if (delivery !== 'email' && delivery !== 'temporary_password') {
    return jsonResponse({ error: 'El método de acceso seleccionado no es válido.' }, 400);
  }
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = displayName.trim();
  if (
    normalizedEmail.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    || normalizedName.length < 1
    || normalizedName.length > 100
  ) {
    return jsonResponse({ error: 'El correo o nombre no tiene un formato válido.' }, 400);
  }
  if (roleId === 'owner') return jsonResponse({ error: 'No se puede invitar a otra cuenta con el rol Propietario.' }, 403);
  if (delivery === 'temporary_password' && !temporaryPasswordRoleIds.has(roleId)) {
    return jsonResponse({ error: 'Las cuentas con contraseña temporal solo están disponibles para roles internos autorizados.' }, 403);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: role, error: roleError } = await adminClient
    .from('business_roles')
    .select('id')
    .eq('id', roleId)
    .maybeSingle();
  if (roleError) {
    console.error('No se pudo validar el rol solicitado:', roleError.message);
    return jsonResponse({ error: 'No se pudo validar el rol seleccionado.' }, 500);
  }
  if (!role) return jsonResponse({ error: 'El rol seleccionado no existe.' }, 400);

  let temporaryPassword: string | undefined;
  let createdUser: User;
  if (delivery === 'temporary_password') {
    temporaryPassword = generateTemporaryPassword();
    const { data, error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: temporaryPassword,
      email_confirm: false,
      user_metadata: { full_name: normalizedName },
    });
    if (error || !data.user) {
      return jsonResponse({ error: error?.message ?? 'No se pudo crear la cuenta.' }, 400);
    }
    createdUser = data.user;
  } else {
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
      normalizedEmail,
      { data: { full_name: normalizedName } },
    );
    if (error || !data.user) {
      return jsonResponse({ error: error?.message ?? 'No se pudo crear la invitación.' }, 400);
    }
    createdUser = data.user;
  }

  const { error: assignmentError } = await adminClient
    .from('business_user_roles')
    .upsert({
      user_id: createdUser.id,
      role_id: roleId,
      assigned_by: authData.user.id,
    }, { onConflict: 'user_id' });
  let profileError: string | null = null;
  const verificationDeadline = delivery === 'temporary_password'
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : null;
  if (delivery === 'temporary_password') {
    const setupStartedAt = new Date().toISOString();
    const profileResult = await adminClient.from('business_profiles').update({
      must_change_password: true,
      password_setup_started_at: setupStartedAt,
      requires_email_verification: true,
      email_verification_deadline: verificationDeadline,
      updated_at: setupStartedAt,
    }).eq('user_id', createdUser.id).select('user_id').maybeSingle();
    profileError = profileResult.error?.message
      ?? (profileResult.data ? null : 'No se encontró el perfil de negocio creado para el usuario.');
  }
  if (assignmentError || profileError) {
    const { error: rollbackError } = await adminClient.auth.admin.deleteUser(createdUser.id);
    if (rollbackError) {
      console.error('No se pudo revertir la cuenta tras un fallo de configuración:', rollbackError.message);
    }
    console.error('No se pudo completar la configuración del usuario:', assignmentError?.message ?? profileError);
    return jsonResponse({ error: 'No se pudo completar la configuración de la cuenta. No se creó el acceso.' }, 500);
  }

  if (delivery === 'temporary_password') {
    const verificationClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: verificationError } = await verificationClient.auth.resend({
      type: 'signup',
      email: normalizedEmail,
    });
    if (verificationError) {
      const { error: rollbackError } = await adminClient.auth.admin.deleteUser(createdUser.id);
      if (rollbackError) {
        console.error('No se pudo revertir la cuenta tras fallar el envío de verificación:', rollbackError.message);
      }
      console.error('No se pudo enviar la verificación del correo:', verificationError.message);
      return jsonResponse({
        error: `No se pudo enviar el correo de verificación. Configura SMTP en Supabase y vuelve a intentarlo. ${verificationError.message}`,
      }, 502);
    }
  }

  return jsonResponse({
    user_id: createdUser.id,
    email: createdUser.email ?? normalizedEmail,
    role_id: roleId,
    ...(verificationDeadline ? { email_verification_deadline: verificationDeadline } : {}),
    ...(temporaryPassword ? { temporary_password: temporaryPassword } : {}),
  }, 201);
});
