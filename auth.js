/* Acceso privado de IKI: inicia sesión con Supabase Auth y entrega las cabeceras de cada petición.
   Los datos están protegidos en la base de datos; esta pantalla solo gestiona la sesión. */
(function () {
  'use strict';
  const URL_SB = 'https://xylwfdqvcxlrkjohlgig.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bHdmZHF2Y3hscmtqb2hsZ2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMTU5NzUsImV4cCI6MjEwNzg5MTk3NX0.CmCl8SiFQB5g6OGvIE9CFYsHxFyyri15OekNdIySqHM';
  const CLAVE = 'iki_sesion';
  const prueba = !!window.__IKI_PRUEBA;
  let ses = null, resolver, hayPantalla = false;
  const listo = new Promise((r) => { resolver = r; });
  const ahora = () => Math.floor(Date.now() / 1000);

  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { return null; } };
  const guardar = (s) => { ses = s; try { if (s) localStorage.setItem(CLAVE, JSON.stringify(s)); else localStorage.removeItem(CLAVE); } catch (e) {} };
  const aSesion = (d) => ({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: ahora() + (d.expires_in || 3600) });

  const MENSAJES = {
    invalid_credentials: 'El correo o la contraseña no son correctos.',
    email_not_confirmed: 'Confirma tu correo antes de entrar.',
    over_request_rate_limit: 'Demasiados intentos. Espera un momento y vuelve a probar.',
    weak_password: 'La contraseña es demasiado débil. Usa al menos 8 caracteres.',
    same_password: 'La nueva contraseña debe ser distinta de la actual.'
  };

  async function llamar(ruta, cuerpo, metodo, token) {
    const r = await fetch(URL_SB + '/auth/v1/' + ruta, { method: metodo || 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (token || KEY) }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
    const t = await r.text();
    let d = {};
    try { d = t ? JSON.parse(t) : {}; } catch (e) {}
    if (!r.ok) { const e = new Error(d.error_code || d.msg || String(r.status)); e.codigo = d.error_code || d.code; throw e; }
    return d;
  }

  async function renovar() {
    if (!ses || !ses.refresh_token) throw new Error('sin_sesion');
    const d = await llamar('token?grant_type=refresh_token', { refresh_token: ses.refresh_token });
    guardar(aSesion(d));
  }

  async function cabeceras() {
    if (prueba) return { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
    if (!ses) throw new Error('sin_sesion');
    if (ses.expires_at - ahora() < 60) { try { await renovar(); } catch (e) { caducada(); throw e; } }
    return { apikey: KEY, Authorization: 'Bearer ' + ses.access_token, 'Content-Type': 'application/json' };
  }

  function caducada() { guardar(null); mostrar(); }
  async function salir() {
    try { if (ses) await llamar('logout', null, 'POST', ses.access_token); } catch (e) {}
    guardar(null);
    location.reload();
  }
  async function cambiarPassword(nueva) { await llamar('user', { password: nueva }, 'PUT', ses.access_token); }

  /* ---------- pantalla de acceso ---------- */
  const CSS = '#iki-acceso{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto;background:radial-gradient(70% 45% at 8% -8%,color-mix(in srgb,var(--accent) 38%,transparent),transparent 70%),radial-gradient(60% 40% at 100% 0%,color-mix(in srgb,var(--accent2) 30%,transparent),transparent 70%),var(--bg);color:var(--txt);font-family:var(--fuente)}' +
    '#iki-acceso .ac{width:100%;max-width:400px;background:var(--surf);border:var(--bw) solid var(--borde);border-radius:calc(var(--radio) + 6px);padding:28px 24px;box-shadow:var(--sombra);-webkit-backdrop-filter:blur(var(--blur));backdrop-filter:blur(var(--blur));box-sizing:border-box}' +
    '#iki-acceso .lg{font-size:1.6rem;font-weight:800;letter-spacing:-.03em;background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:10px}' +
    '#iki-acceso h2{margin:0 0 6px;font-size:1.6rem;line-height:1.15;letter-spacing:-.025em}' +
    '#iki-acceso p{margin:0}#iki-acceso .sb{color:var(--suave);font-size:.92rem;margin-bottom:18px}' +
    '#iki-acceso label{display:block;margin:14px 0 6px;font-size:.8rem;color:var(--suave)}' +
    '#iki-acceso input{width:100%;box-sizing:border-box;padding:13px 14px;border-radius:calc(var(--radio)*.75);border:1.5px solid var(--borde);background:transparent;color:inherit;font:inherit;font-size:16px}' +
    '#iki-acceso input:focus{outline:none;border-color:var(--accent)}' +
    '#iki-acceso button{width:100%;margin-top:22px;padding:14px 18px;border-radius:calc(var(--radio)*.85);border:1.5px solid transparent;color:#fff;background:linear-gradient(90deg,var(--accent),var(--accent2));font:inherit;font-weight:600;cursor:pointer}' +
    '#iki-acceso button:disabled{opacity:.5;cursor:default}' +
    '#iki-acceso .er{min-height:1.2em;margin-top:14px;font-size:.88rem;color:var(--suave)}';

  function mostrar() {
    if (hayPantalla) return;
    hayPantalla = true;
    const est = document.createElement('style'); est.id = 'iki-acceso-css'; est.textContent = CSS; document.head.appendChild(est);
    const c = document.createElement('div'); c.id = 'iki-acceso';
    c.innerHTML = '<form class="ac" id="iki-form" autocomplete="on"><div class="lg">IKI</div><h2>Accede a tu espacio</h2><p class="sb">Solo tú puedes entrar.</p>' +
      '<label for="iki-correo">Correo</label><input id="iki-correo" name="username" type="email" autocomplete="username" inputmode="email" required>' +
      '<label for="iki-clave">Contraseña</label><input id="iki-clave" name="password" type="password" autocomplete="current-password" required>' +
      '<button type="submit" id="iki-entrar">Entrar</button><p class="er" id="iki-error" role="alert"></p></form>';
    document.body.appendChild(c);
    document.getElementById('iki-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const b = document.getElementById('iki-entrar'), er = document.getElementById('iki-error');
      b.disabled = true; er.textContent = 'Comprobando';
      try {
        const d = await llamar('token?grant_type=password', { email: document.getElementById('iki-correo').value.trim(), password: document.getElementById('iki-clave').value });
        guardar(aSesion(d));
        document.getElementById('iki-clave').value = '';
        ocultar(); resolver();
      } catch (e) { er.textContent = MENSAJES[e.codigo] || MENSAJES[e.message] || 'No se ha podido entrar. Inténtalo de nuevo.'; b.disabled = false; }
    });
  }
  function ocultar() { const c = document.getElementById('iki-acceso'); if (c) c.remove(); const s = document.getElementById('iki-acceso-css'); if (s) s.remove(); hayPantalla = false; }

  async function iniciar() {
    if (prueba) { resolver(); return; }
    ses = leer();
    if (ses) { try { if (ses.expires_at - ahora() < 60) await renovar(); ocultar(); resolver(); return; } catch (e) { guardar(null); } }
    mostrar();
  }
  const arrancar = () => { iniciar(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();

  window.IKIAuth = { listo: listo, cabeceras: cabeceras, salir: salir, cambiarPassword: cambiarPassword, caducada: caducada, mostrar: mostrar };
})();
