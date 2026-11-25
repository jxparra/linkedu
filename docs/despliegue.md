# Despliegue de Linkedu (gratis)

Repositorio de despliegue: https://github.com/jxparra/linkedu (rama `main`, copia de `estetica-pizarra` de StudyHub).

- **Backend** (FastAPI) en **Render**, plan gratuito. Configuración en `render.yaml`.
- **Frontend** (Next.js) en **Vercel**, plan gratuito.
- **Datos:** el disco gratuito de Render se borra en cada reinicio. Al arrancar se restaura `backend/demo/linkedu-demo.db` (solo cuentas `@demo.studyhub`, contraseña `Demo1234`) con sus imágenes. Lo que se cree en la web dura hasta el siguiente reinicio.
- **Primera carga lenta:** el backend gratuito se duerme tras 15 minutos sin uso y tarda unos 50 s en despertar.

## 1. Backend en Render
1. Entrar en https://render.com con la cuenta de GitHub.
2. **New → Blueprint** → elegir el repositorio `jxparra/linkedu` (rama `main`), o directamente el botón «Deploy to Render» del README.
3. Render lee `render.yaml` y crea el servicio `linkedu-jxparra-api`. Pulsar **Apply** y esperar a que ponga *Live* (unos 3 minutos).
4. Copiar su dirección, del tipo `https://linkedu-jxparra-api.onrender.com`. Comprobar que `…/health` responde `{"status":"ok"}`.

## 2. Frontend en Vercel
1. Entrar en https://vercel.com con la cuenta de GitHub.
2. **Add New → Project** → importar `jxparra/linkedu`.
3. **Root Directory:** `frontend`. El framework (Next.js) se detecta solo.
4. **Environment Variables:** `NEXT_PUBLIC_API_URL` = la dirección del paso 1 (sin barra al final).
5. **Deploy.** La rama `main` es la de producción, que es pública (las vistas previas de otras ramas piden iniciar sesión en Vercel).
6. La dirección pública es la del dominio de producción, del tipo `https://linkedu-xxxx.vercel.app`.

## 3. Para el profesor
- Web: la dirección de Vercel.
- Cuentas de prueba (contraseña `Demo1234`): `irene@demo.studyhub` (estudiante), `technova@demo.studyhub` (empresa), `elena.profe@demo.studyhub` (docente).
- Si la primera carga tarda, es el backend despertando: esperar un minuto y recargar.

## Notas
- `DEBUG=true` en Render a propósito: sin servicio de correo, el código de verificación del registro se muestra en pantalla.
- CORS acepta cualquier `https://*.vercel.app` (`FRONTEND_ORIGIN_REGEX`), así que no hace falta tocar el backend al cambiar el dominio de Vercel.
- La base de datos de demostración se genera desde la local quitando las cuentas que no son `@demo.studyhub` (ver diario del 2026-11-25).
