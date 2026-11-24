// Capturas de StudyHub en ordenador (1440×900) y móvil (390×844), en modo claro y oscuro.
// Uso (con backend y frontend en marcha), desde frontend/:
//   node scripts/capturas.mjs <carpeta> [rutas...]
//   node scripts/capturas.mjs ../docs/assets/revision / /inicio /empleo /social /social/foros /perfil
// Inicia sesión con la cuenta de prueba (irene@demo.studyhub) para ver las páginas privadas.
// En Git Bash: MSYS_NO_PATHCONV=1 node scripts/capturas.mjs ... (si no, convierte "/inicio" en una ruta de Windows).
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const [, , out = "capturas", ...args] = process.argv;
const routes = args.length ? args : ["/", "/inicio", "/empleo", "/social", "/social/foros", "/perfil"];
const API = process.env.API_URL ?? "http://localhost:8000";
const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

mkdirSync(out, { recursive: true });
const res = await fetch(`${API}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "irene@demo.studyhub", password: "Demo1234" }),
});
const { access_token } = await res.json();

const browser = await chromium.launch({ executablePath: CHROME });
const errors = [];
for (const theme of ["light", "dark"]) {
  for (const [width, height, tag] of [
    [1440, 900, "ordenador"],
    [390, 844, "movil"],
  ]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    await ctx.addInitScript(
      ([t, th]) => {
        // La portada redirige a Inicio con sesión iniciada: se mira sin sesión
        if (location.pathname === "/") localStorage.removeItem("studyhub_token");
        else localStorage.setItem("studyhub_token", t);
        localStorage.setItem("studyhub_theme", th);
      },
      [access_token, theme],
    );
    const page = await ctx.newPage();
    page.on("console", (m) => m.type() === "error" && errors.push(`${m.location().url}: ${m.text()}`));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    for (const route of routes) {
      await page.goto(WEB + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(2500); // deja que carguen los datos y la escena 3D
      const name = route === "/" ? "portada" : route.slice(1).replace(/[/?=&]/g, "_");
      await page.screenshot({ path: `${out}/${tag}-${theme}-${name}.png` });
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`Capturas en ${out}`);
if (errors.length) console.log(`Errores de consola (${errors.length}):\n` + [...new Set(errors)].join("\n"));
