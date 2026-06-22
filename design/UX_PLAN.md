# Plan de UX — Flappy Bird Web

> Juego canvas-based con overlays HTML/Tailwind. La paleta del juego (cielo, suelo, tuberías, pájaro) se dibuja dentro del `<canvas>` usando las constantes de `lib/game/constants.ts`; la UI alrededor (navbar, página `/about`, créditos) usa los tokens y clases de `app/globals.css`.

---

## 0. Convenciones globales

- **Idioma**: todo texto visible en español, orientado al jugador (sin jerga).
- **Tema del juego**: oscuro/retro. El `<canvas>` mantiene su estética propia (cielo `#70c5ce`, suelo `#ded895`, etc.); el chrome alrededor (navbar, `/about`) usa `--surface` / `--text` del design system y respeta `prefers-color-scheme`.
- **Overlay sobre canvas**: los overlays (Inicio, HUD, Game Over) son HTML posicionado en capa superior con `pointer-events: none` por defecto, salvo los botones interactivos.
- **Accesibilidad del canvas**: el `<canvas>` lleva `role="application"` y `aria-label="Juego Flappy Bird"`; los overlays con contenido legible usan `role="dialog"` y `aria-live` para cambios de estado.
- **Responsive**: el canvas ocupa el alto del viewport con `max-width` y `aspect-ratio` fijo (400:600); mínimo 320px de ancho. Touch ≥ 40px garantizados.

---

## 1. Layout raíz — `app/layout.tsx`

- **Objetivo**: shell HTML común con `<html lang="es">`, metadatos SEO y body centrado vertical/horizontal.
- **Estructura**: `body` con fondo `--bg`, fuente `--font-sans`. Sin navbar global (el juego es la pantalla principal); opcionalmente un footer mínimo con enlace a `/about`.
- **Metadatos**: `title`: "Flappy Bird — Juego web", `description`: "Un juego arcade donde esquivas tuberías y acumulas puntos. Juega gratis en el navegador."
- **Accesibilidad**: saltar al contenido con enlace "Saltar al juego" (`sr-only` / foco visible).

---

## 2. Pantalla principal — `app/page.tsx` (ruta `/`)

- **Objetivo para el usuario**: jugar una partida inmediatamente.
- **Componente**: `<FlappyGame />` (client component) ocupa pantalla casi completa.
- **Layout**:
  - Contenedor flex centrado (`min-height: 100dvh`, `align-items: center`, `justify-content: center`).
  - Wrapper del canvas con `aspect-ratio: 400/600`, `max-height: 100dvh`, `max-width: 100vw`, `touch-action: none`.
  - Envoltorio relativo para posicionar los overlays (Start, HUD, GameOver) encima del canvas con `absolute inset-0`.
- **Footer/chrome**: enlace discreto "Cómo jugar" → `/about` (debajo o al lado del canvas, no encima).
- **Estados**: el juego gestiona READY / PLAYING / GAME_OVER. Solo se muestra el canvas; no hay estados de carga/vacío/error de datos en esta pantalla (no lista datos).
- **Responsive**: en móvil, canvas a ancho completo con padding lateral mínimo (8–16px); en desktop, alto limitado por viewport.
- **Accesibilidad**: foco inicial va al contenedor del juego; primer tab llega al botón "Reiniciar" cuando aparezca Game Over.

---

## 3. Sub-pantalla: Inicio (READY) — `components/StartOverlay.tsx`

- **Objetivo**: invitar a jugar y enseñar el control.
- **Visibilidad**: solo cuando `status === 'READY'`.
- **Layout**: overlay centrado vertical y horizontal sobre el canvas. Tarjeta translúcida (`background: rgba(0,0,0,.45)` + `backdrop-blur` opcional) con texto blanco.
- **Contenido (copy en español)**:
  - **Título h1**: "Flappy Bird"
  - **Subtítulo**: "Atraviesa las tuberías sin chocar."
  - **Instrucciones**: "Pulsa **Espacio** o **tocá la pantalla** para volar"
  - **Pista secundaria (muted)**: "En móvil: tocá. En PC: Espacio, clic o flecha arriba."
  - **Puntaje histórico**: si `highScore > 0`, mostrar "Mejor marca: **15**" (kpi pequeño) — no es jerga, es lenguaje del jugador.
- **Animación**: pájaro del canvas flotando arriba/abajo (sprite animado); el overlay se muestra encima sin taparlo.
- **Interacción**: cualquier tap/click/Space sobre el canvas → cambia a PLAYING. No hace falta botón visible; el área completa del canvas es el botón.
- **Accesibilidad**: `role="dialog"` con `aria-label="Pantalla de inicio"`. El texto de instrucciones está visible (no solo emoji/icono).

---

## 4. Sub-pantalla: HUD de puntaje (PLAYING) — `components/ScoreHUD.tsx`

- **Objetivo**: mostrar el puntaje en curso sin distraer.
- **Visibilidad**: solo cuando `status === 'PLAYING'`.
- **Layout**: número grande centrado horizontalmente, pegado al borde superior interno del canvas (margen ~16px). Sombra de texto para legibilidad sobre el cielo.
- **Tipografía**: estilo arcade/retro (sans-serif bold, `font-size` proporcional al alto del canvas; clamp recomendado para escalar). Color blanco con `text-shadow` negro.
- **Contenido**: solo el número (ej. "07" con zero-padding para legibilidad).
- **Comportamiento**: se actualiza vía ref/estado ligero sin re-render del canvas (sin flicker).
- **Responsive**: tamaño de fuente escalado por `vmin` o `clamp()` para que se vea igual en 320px y en desktop.
- **Accesibilidad**: contenedor con `aria-live="polite"` y `aria-atomic="true"` para lectores de pantalla; texto alternativo `sr-only` "Puntaje: 7".

---

## 5. Sub-pantalla: Game Over — `components/GameOverOverlay.tsx`

- **Objetivo**: mostrar resultado, récord y permitir reiniciar.
- **Visibilidad**: solo cuando `status === 'GAME_OVER'`.
- **Layout**: tarjeta centrada (clase `.card` con fondo translúcido oscuro) sobre el canvas. `role="dialog"` `aria-modal="true"`.
- **Contenido (copy en español)**:
  - **Título**: "¡Juego terminado!" (o "Se acabó" — tono cercano).
  - **KPI principal** (`.kpi`):
    - **Etiqueta**: "Tu puntaje"
    - **Valor**: número grande (ej. `12`)
  - **KPI secundario** (`.kpi` muted):
    - **Etiqueta**: "Mejor marca"
    - **Valor**: número histórico
  - **Indicador de récord**: si `score > highScoreAnterior`, mostrar badge `.badge-ok`: "🏆 ¡Nuevo récord!" (acompañado de texto, no solo color).
  - **Medalla opcional** (badge `.badge-info`/`.badge-warn`/`.badge-ok` según rango): texto "Medalla de bronce/plata/oro" (no solo ícono).
- **Botones**:
  - **Primario** (`.btn .btn-primary .btn-block`): "Volver a jugar" — foco automático al aparecer.
  - **Secundario ghost** (`.btn .btn-ghost`): "Cómo jugar" → `/about` (opcional).
- **Interacción**: botón responde a click/touch/Enter/Space. El tap en el canvas fuera del botón **no** reinicia (evita reinicios accidentales).
- **Animación**: entrada suave (fade + scale) ~200ms para no distraer.
- **Accesibilidad**: foco atrapado dentro del dialog; `Escape` no cierra (el juego siempre pide acción explícita); mensajes con `aria-live="assertive"` para "Nuevo récord".

---

## 6. Wrapper del canvas — `components/GameCanvas.tsx`

- **Objetivo**: encapsular el `<canvas>` con resize, listeners y estilos táctiles.
- **Estilos**: `touch-action: none`, `user-select: none`, `-webkit-tap-highlight-color: transparent`, `outline: none` (el foco visible lo gestiona el overlay).
- **Listeners**: `keydown` (Space/ArrowUp/Enter) con `preventDefault`; `pointerdown` (mouse y touch unificados); `resize`/`orientationchange` para ajustar escala manteniendo aspect ratio.
- **Render**: el canvas interno usa `width/height` lógicos (400×600) y CSS escala el wrapper; `ctx.setTransform` para aplicar la escala.
- **Accesibilidad**: `tabIndex={0}` para que el canvas pueda recibir foco; descripción `aria-label` clara.

---

## 7. Componente orquestador — `components/FlappyGame.tsx`

- **Objetivo**: unir engine, canvas y overlays; gestionar transiciones de estado.
- **Estados React** (mínimos): `status` (READY/PLAYING/GAME_OVER), `score`, `highScore`, `isNewRecord`, `medal`.
- **Carga inicial**:
  - Hidratación cliente: leer `localStorage.flappy_highscore` → `highScore`.
  - Intentar `GET /api/highscore` (opcional) para mostrar "Mejor marca global" si es mayor; no bloquear la UI si falla (catch silencioso → `.alert-info` pequeño y dismissable).
  - Mostrar skeleton/texto "Cargando…" solo si la API tarda > 300ms; si no, flash invisible.
- **Al terminar partida**:
  - Si `score > highScore`:
    - `setLocalHighScore(score)`.
    - `POST /api/highscore` (best-effort, no modal de error; si falla, mostrar toast/alert discreto "No pudimos guardar tu récord en línea, pero lo guardamos en este dispositivo").
  - Marcar `isNewRecord` para el overlay.
- **Loop**: `requestAnimationFrame` con `dt` clamped (evitar saltos cuando la pestaña vuelve de background).
- **Errores**: si el canvas no se puede inicializar (muy raro), mostrar `.alert-error` con "No pudimos iniciar el juego. Recargá la página." y botón "Reintentar".

---

## 8. Pantalla informativa — `app/about/page.tsx` (ruta `/about`)

- **Objetivo**: explicar controles, accesibilidad de teclas y créditos.
- **Layout**: `container` estándar; `h1` "Cómo jugar"; secciones en `.card` con `.stack`.
- **Contenido (copy en español)**:
  - **Sección 1 — Objetivo**: "El objetivo es volar lo más lejos posible sin chocar con las tuberías, el suelo ni el techo."
  - **Sección 2 — Controles** (lista con verbos del dominio):
    - "**Espacio** o **flecha arriba**: aletear / saltar."
    - "**Clic** o **tap** en cualquier parte del juego: aletear / saltar."
    - "**Enter** o **Espacio** en la pantalla final: volver a jugar."
  - **Sección 3 — Puntaje**: "Sumás 1 punto cada vez que tu pájaro pasa entre un par de tuberías. Tu mejor marca se guarda en este dispositivo."
  - **Sección 4 — Accesibilidad**: "El juego funciona con teclado y pantalla táctil. Si necesitás más tiempo, pausá la pestaña."
  - **Sección 5 — Créditos**: "Juego estilo Flappy Bird, desarrollado como proyecto web. Hecho con Next.js y Canvas."
- **Navegación**: navbar simple (`.navbar`) con marca "Flappy Bird" (enlace a `/`) y enlaces "Jugar" (`/`), "Cómo jugar" (`/about`, activo).
- **Estados**: página estática, sin carga de datos → no requiere empty/loading/error.
- **Responsive**: contenido a 1 columna; `.card` con padding cómodo en móvil.
- **Accesibilidad**: jerarquía de headings correcta (`h1` único, `h2` por sección); enlaces con foco visible.

---

## 9. Endpoint `/api/highscore` (referencia, sin UI directa)

- **Por qué se menciona aquí**: su único cliente es `FlappyGame.tsx`.
- **Contrato UX implícito**:
  - `GET` → `{ score: number }`. Si falla, la UI usa `localStorage` como fuente de verdad y muestra `.alert-info` no bloqueante.
  - `POST` → `{ score: number, isNew: boolean }`. Si falla (red/offline), `.alert-info` "Tu récord se guardó en este dispositivo. No pudimos sincronizarlo." Botón "Reintentar" (`.btn .btn-sm .btn-ghost`).
- **Copy de error en español, accionable**, nunca mostrar el error crudo.

---

## 10. Mensajes de estado (catálogo reutilizable)

| Situación | Texto visible | Componente |
|---|---|---|
| Cargando API highscore | "Cargando tu mejor marca…" | pequeño texto muted en StartOverlay |
| API offline (GET) | "Sin conexión: usaremos tu récord guardado en este dispositivo." | `.alert-info` dismissable |
| API offline (POST) | "Guardamos tu récord en este dispositivo. No pudimos sincronizarlo." + botón "Reintentar" | `.alert-info` en GameOver |
| Nuevo récord | "🏆 ¡Nuevo récord!" | `.badge-ok` en GameOverOverlay |
| Medalla bronce/plata/oro | "Medalla de bronce" / "plata" / "oro" | `.badge-info` / `.badge-warn` / `.badge-ok` |
| Sin high score previo | (no mostrar el KPI, solo el puntaje actual) | — |
| Error fatal canvas | "No pudimos iniciar el juego. Recargá la página." + "Reintentar" | `.alert-error` + `.btn .btn-primary` |

---

## 11. Checklist de consistencia entre pantallas

- Mismo `.btn .btn-primary` para acción principal ("Volver a jugar") en Game Over y ("Reintentar") en error.
- Mismo `.badge` (con texto, no solo color) para todos los indicadores de estado.
- Mismo `.alert-error` / `.alert-info` para mensajes, con copy humano y accionable.
- Mismas escalas tipográficas (`--fs-3xl` para h1, `--fs-2xl` para títulos de sección, `--fs-lg` para subtítulos).
- Mismo idioma (es-AR/es-ES neutro), sin anglicismos ni jerga técnica.
- Mismo foco visible (`outline` del design system) en todos los interactivos.