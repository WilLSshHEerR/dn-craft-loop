# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## CMS

El panel privado está disponible en `/admin`. Permite administrar proyectos, servicios y los textos principales de la página de inicio. La página de detalle de Diamond Crown y el diseño/animaciones siguen definidos en el código.

### Configuración de Supabase

1. Crea un proyecto de Supabase y configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local` (o `.env` local). Usa únicamente la URL del proyecto y la clave publicable; nunca pongas una clave `service_role` en una variable `VITE_`.
2. En Supabase, abre **SQL Editor**, crea una consulta nueva, copia el contenido de [`supabase/schema.sql`](./supabase/schema.sql) y ejecútala. Esto crea las tablas, los datos iniciales, el bucket de imágenes y las políticas de acceso iniciales.
3. Ejecuta también [`supabase/roles.sql`](./supabase/roles.sql). Esta migración crea los perfiles, roles y permisos de la plataforma, asigna el rol Propietario a `dncraftloop@gmail.com` y actualiza las políticas del CMS para autorizar por permisos en Supabase.
4. Configura el enlace de redirección de invitaciones en **Authentication → URL Configuration** para incluir la URL de producción y `http://localhost:5173/admin` en desarrollo.
5. En **Edge Functions**, abre `invite-business-user`, copia el contenido de [`supabase/functions/invite-business-user/index.ts`](./supabase/functions/invite-business-user/index.ts) en el editor y pulsa **Deploy updates**. La función usa las variables seguras de Supabase en el servidor; nunca copies `SUPABASE_SERVICE_ROLE_KEY` a una variable `VITE_` ni al frontend.
6. En **Authentication → Users**, agrega `dncraftloop@gmail.com` si todavía no existe. Desde el panel, en **Usuarios y roles → Crear usuario**, puedes invitar por correo y asignar el rol inicial. Cada persona define su propia contraseña desde el correo de invitación.
7. Para crear una cuenta interna con contraseña temporal, selecciona esa opción y asígnala a Administrador de operaciones, Gestor de proyectos, Finanzas o Colaborador. Supabase enviará un correo de verificación y la persona tendrá 7 días para confirmarlo; después, el acceso a las áreas protegidas quedará bloqueado hasta verificar. En su primer acceso deberá cambiar la contraseña temporal. El administrador verá esa contraseña una sola vez y debe compartirla por un canal seguro. Los clientes deben seguir usando la invitación por correo.
8. Configura un proveedor SMTP en **Authentication → SMTP Settings** antes de crear cuentas con contraseña temporal. Sin SMTP, Supabase no puede enviar el enlace de verificación y la función revierte la cuenta si falla el envío. El SMTP predeterminado solo permite destinatarios del equipo del proyecto y tiene límites estrictos.
9. Si ya instalaste roles antes de habilitar contraseñas temporales, vuelve a ejecutar [`supabase/roles.sql`](./supabase/roles.sql) desde **SQL Editor** para agregar los campos de verificación, el plazo de 7 días y la función de finalización del cambio de contraseña.
10. Cada usuario puede consultar su estado y actualizar su nombre desde **Mi perfil**. Si el correo no está confirmado, desde el inicio de sesión puede solicitar que se reenvíe el enlace de verificación.
11. Ejecuta `npm run dev` y abre `http://localhost:5173/admin` para iniciar sesión y administrar el contenido y los roles.
12. En Vercel, configura las mismas dos variables en los entornos que uses y vuelve a desplegar después de cualquier cambio.

El archivo `.env` está excluido de Git. La clave publicable se puede usar en el navegador porque las lecturas y escrituras están protegidas por las políticas RLS de Supabase; no cambies esas políticas para hacer que el panel funcione. El acceso a clientes, proyectos internos, contratos, finanzas, contabilidad y el estimador se implementará sobre esta misma base de usuarios y permisos, por etapas.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
