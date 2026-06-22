# Resultado.md — Flappy Bird Web Game

## Resumen

Se construyó un juego web **Flappy Bird** completamente jugable en el navegador usando **Next.js 14 (App Router) + TypeScript + Canvas HTML5 + Tailwind CSS**. El proyecto cubre las 7 épicas de la especificación: motor de juego, pájaro con física, tuberías procedurales, entorno visual con parallax, sistema de puntaje con persistencia local y servidor, pantallas de UI, y controles responsivos (teclado, mouse y touch).

---

## Stack técnico real (verificado en archivos)

| Pieza            | Tecnología                              |
|------------------|-----------------------------------------|
| Framework        | Next.js 14.2.35 (App Router)            |
| Lenguaje         | TypeScript 5.6.2 (strict)               |
| Renderizado      | Canvas HTML5 2D + `requestAnimationFrame`|
| UI / Overlays    | React 18.3.1 (cliente) + Tailwind 3.4   |
| Persistencia local | `localStorage`                        |
| Persistencia servidor | SQLite vía `better-sqlite3` 11.8.1   |
| Migraciones      | SQL plano ejecutado al iniciar          |

---

## Lista de archivos generados

### App Router (páginas y layout)
| Archivo | Descripción |
|---|---|
| `app/layout.tsx` | Layout raíz con metadatos SEO, `lang="es"`, skip-link accesible al juego. |
| `app/page.tsx` | Página principal que renderiza `<FlappyGame />`. |
| `app/about/page.tsx` | Página informativa "Cómo jugar" con instrucciones de controles, puntaje, accesibilidad y créditos. |
| `app/globals.css` | Design system completo: tokens, reset, botones, cards, badges, alerts, navbar, KPIs, clases de juego (`.game-shell`, `.game-stage`, overlays, score-display, animaciones). Soporte modo oscuro. |
| `next.config.mjs` | Configuración Next.js mínima. |
| `tailwind.config.ts` | Content paths para `app/` y `components/`. |
| `tsconfig.json` | TypeScript strict con path alias `@/*`. |

### API
| Archivo | Descripción |
|---|---|
| `app/api/highscore/route.ts` | `GET` devuelve el high score máximo de la DB. `POST` valida entero positivo, inserta solo si supera el récord actual, devuelve `{ score, isNew }`. |

### Lib (lógica de juego pura en TS)
| Archivo | Descripción |
|---|---|
| `lib/game/constants.ts` | Dimensiones canvas (400×600), física (gravedad 1200, flap -400), tuberías (width 60, gap 160, speed 160, spawn 1.5s), suelo, animación del pájaro, nubes, paleta `COLORS`, medallas, `STORAGE_KEY`. |
| `lib/game/entities.ts` | Interfaces `Bird`, `Pipe`, `GameState`, `Cloud`; tipo `GameStatus = "READY" \| "PLAYING" \| "GAME_OVER"`. |
| `lib/game/collision.ts` | Colisión circular-vs-rect (`circleRectCollision`), `checkBirdPipeCollision`, `checkGroundCollision`, `checkCeilingCollision`. |
| `lib/game/renderer.ts` | Funciones de dibujo: `drawBackground` (gradiente), `drawClouds` + `updateClouds` + `initClouds` (parallax), `drawPipes` + `drawPipeRect` (con bordes, highlights y boca), `drawGround` (patrón diagonal en movimiento), `drawBird` (cuerpo, ala animada por frameIndex, ojo, pico, rotación). |
| `lib/game/engine.ts` | Clase `FlappyEngine`: `createInitialState`, `reset`, `start`, `flap`, `spawnPipe`, `updateBird` (física + rotación + animación), `updatePipes` (movimiento, scoring, limpieza), `checkCollisions`, `update` (game loop con delta time, pájaro flotando en READY, nubes y suelo siempre animados), `render`, callbacks `onScoreChange` y `onGameOver`. |
| `lib/game/storage.ts` | `getLocalHighScore`, `setLocalHighScore` (localStorage), `getServerHighScore`, `submitServerHighScore` (fetch a `/api/highscore`). |

### DB
| Archivo | Descripción |
|---|---|
| `lib/db.ts` | Singleton `better-sqlite3` que abre/crea `data/flappy.db`, activa WAL, ejecuta migraciones pendientes desde `db/migrations/` con tabla tracking `schema_migrations`. |
| `db/migrations/001_highscore.sql` | Crea tabla `high_scores(id TEXT PK, score INTEGER, created_at TEXT)` + índice por score DESC. |

### Componentes (React cliente)
| Archivo | Descripción |
|---|---|
| `components/FlappyGame.tsx` | Componente principal: instancia `FlappyEngine`, game loop con `requestAnimationFrame`, delta time clampado a 0.05s, sincroniza estado con overlays React, carga/guarda high score (local + servidor best-effort), maneja input de flap/inicio/reinicio, listener global de teclado con `preventDefault` en Space/ArrowUp/Enter, pantalla de error fatal. |
| `components/GameCanvas.tsx` | `<canvas>` 400×600 con `forwardRef`, `onPointerDown` (unifica click+touch), `touch-action: none`, `tabIndex=0`, `role="application"`, `aria-label`. |
| `components/StartOverlay.tsx` | Overlay READY: título "Flappy Bird", instrucciones, mejor marca si > 0. |
| `components/ScoreHUD.tsx` | Overlay PLAYING: puntaje con padding a 2 dígitos, `sr-only` para accesibilidad. |
| `components/GameOverOverlay.tsx` | Overlay GAME_OVER: puntaje, mejor marca, indicador de nuevo récord, medalla (bronce/plata/oro/platino según umbrales), botón "Volver a jugar" con autofocus, enlace a "Cómo jugar". |

---

## Lo construido por épica/módulo

### Épica 1: Motor del juego ✅
- Game loop con `requestAnimationFrame` y delta time clampado.
- Estados `READY` → `PLAYING` → `GAME_OVER` → `READY` con transiciones correctas.
- Canvas 400×600 con aspect ratio mantenido vía CSS (`aspect-ratio: 400/600`).
- `clearRect` + redibujado completo cada frame.

### Épica 2: Pájaro ✅
- Física: gravedad (1200 px/s²), velocidad vertical, impulso de flap (-400 px/s).
- Rotación dinámica según velocidad (arriba al saltar, abajo al caer).
- Animación de aleteo con 3 frames cíclicos (frameIndex/frameTimer, 0.1s por frame).
- Colisión circular con tuberías, suelo y techo.

### Épica 3: Tuberías ✅
- Spawn de pares (superior + inferior) con hueco de 160px a altura aleatoria.
- Desplazamiento a 160 px/s, spawn cada 1.5s.
- Eliminación de tuberías fuera del viewport (`x + width < -10`).
- Scoring: +1 cuando `pipe.x + pipe.width < bird.x`, marca `scored = true`.

### Épica 4: Entorno visual ✅
- Fondo de cielo con gradiente vertical (`#70c5ce` → `#9fd8e0`).
- Suelo animado con patrón diagonal en movimiento continuo (`groundOffset`).
- Techo: colisión si `bird.y - radius <= 0`.
- Nubes con parallax lento (30 px/s), 4 nubes recicladas.

### Épica 5: Puntaje y High Score ✅
- HUD de puntaje visible durante PLAYING.
- High score persistido en `localStorage` (key `flappy_highscore`).
- Carga al iniciar desde localStorage + sincronización con servidor (`getServerHighScore`).
- Guardado en servidor al superar récord (`submitServerHighScore` → POST `/api/highscore`).
- Manejo de error de sincronización con mensaje al usuario.

### Épica 6: Pantallas y UI ✅
- Pantalla de inicio: título, instrucciones, mejor marca.
- HUD de puntaje durante el juego.
- Pantalla de Game Over: puntaje, high score, indicador de nuevo récord, medalla, botón reiniciar.
- Estilo retro colorido con paleta definida en `COLORS`.
- Botón "Volver a jugar" con autofocus y accesible por teclado.

### Épica 7: Controles responsivos ✅
- Teclado: Space y ArrowUp para flap/inicio; Enter para reiniciar; Space también reinicia desde GAME_OVER.
- Mouse: `onPointerDown` en canvas para flap/inicio.
- Touch: mismo `onPointerDown` (Pointer Events unifica mouse+touch).
- `preventDefault` en Space/ArrowUp/Enter para evitar scroll.
- `touch-action: none` en canvas y stage.
- Canvas escalable con CSS, visible desde 320px de ancho.

---

## Cómo correrlo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev
# → http://localhost:3000

# Producción
npm run build
npm start

# Lint
npm run lint
```

La base de datos SQLite (`data/flappy.db`) se crea automáticamente al primer acceso de la API, ejecutando migraciones pendientes.

---

## Criterios de aceptación

### CUBIERTOS ✅

| AC | Estado | Evidencia |
|---|---|---|
| AC1.1 — 60 FPS con rAF + delta time | ✅ | `FlappyGame.tsx` loop con `requestAnimationFrame`, dt clampado a 0.05s |
| AC1.2 — Transiciones READY/PLAYING/GAME_OVER | ✅ | `engine.ts` `start()`, `flap()`, `checkCollisions()` |
| AC1.3 — Aspect ratio al redimensionar | ✅ | CSS `aspect-ratio: 400/600` en `.game-stage` |
| AC2.1 — Caída por gravedad | ✅ | `updateBird()`: `velocity += gravity * dt` |
| AC2.2 — Salto con Space/click/tap | ✅ | `flap()` aplica `flapForce` instantáneo |
| AC2.3 — Rotación visual | ✅ | Rotación interpolada según signo de velocity |
| AC2.4 — Animación de aleteo | ✅ | 3 frames cíclicos, 0.1s cada uno |
| AC3.1 — Tuberías a intervalos regulares | ✅ | `spawnTimer` con `PIPE_SPAWN_INTERVAL = 1.5s` |
| AC3.2 — Hueco aleatorio | ✅ | `gapY = random(PIPE_GAP_MIN_Y, PIPE_GAP_MAX_Y)` |
| AC3.3 — Desplazamiento constante | ✅ | `pipe.x -= PIPE_SPEED * dt` |
| AC3.4 — Eliminación fuera de viewport | ✅ | `filter(p => p.x + p.width > -10)` |
| AC3.5 — +1 al cruzar centro | ✅ | `pipe.x + pipe.width < bird.x` → `scored = true` |
| AC4.1 — Fondo retro | ✅ | Gradiente `drawBackground()` |
| AC4.2 — Suelo animado | ✅ | `drawGround()` con patrón diagonal + `groundOffset` |
| AC4.3 — Colisión suelo/techo | ✅ | `checkGroundCollision`, `checkCeilingCollision` |
| AC5.1 — Marcador durante PLAYING | ✅ | `ScoreHUD` visible en estado PLAYING |
| AC5.2 — High score en localStorage | ✅ | `setLocalHighScore()` al superar récord |
| AC5.3 — Carga desde localStorage | ✅ | `getLocalHighScore()` al iniciar |
| AC5.4 — Sync con servidor (opcional) | ✅ | `submitServerHighScore()` → POST `/api/highscore` |
| AC6.1 — Pantalla de inicio | ✅ | `StartOverlay` con título e instrucciones |
| AC6.2 — Game Over con puntaje y high score | ✅ | `GameOverOverlay` con KPIs y récord |
| AC6.3 — Botón reiniciar click/touch/teclado | ✅ | Botón con `onClick`, Enter/Space en listener global |
| AC6.4 — Estilo retro colorido | ✅ | Paleta `COLORS` aplicada en renderer y CSS |
| AC7.1 — Space inicia y salta | ✅ | Listener global `keydown` Space |
| AC7.2 — Click en canvas | ✅ | `onPointerDown` en `GameCanvas` |
| AC7.3 — Tap en móvil | ✅ | Pointer Events unifican touch |
| AC7.4 — Space no hace scroll | ✅ | `e.preventDefault()` en keydown |
| AC7.5 — Visible desde 320px | ✅ | CSS responsivo con `clamp()`, `max-width: 100vw` |
| **AC-CRÍTICO** — Flujo completo jugable | ✅ | Inicio → jugar → puntaje → choque → game over → reiniciar |

### PENDIENTES / Limitaciones

| Ítem | Estado | Nota |
|---|---|---|
| Sonidos | ❌ No implementado | Marcado como opcional/no bloqueante en la spec. No hay archivos de audio ni código de sonido. |
| Dificultad progresiva | ❌ No implementado | Marcado como opcional en la spec. La velocidad de tuberías es constante. |
| PWA / modo offline | ❌ No implementado | Fuera de alcance según spec. Se beneficia del caching de Next.js pero no hay manifest ni service worker. |
| Tabla de clasificación global | ❌ No implementado | Fuera de alcance según spec. La API solo guarda/consulta el high score máximo. |
| Medalla visual con sprite | ⚠️ Parcial | Se muestra texto/badge de medalla (bronce/plata/oro/platino) pero no un sprite gráfico dibujado en canvas. |
| Sincronización de high score con servidor | ⚠️ Best-effort | Funciona pero es tolerante a fallos: si el servidor no responde, se guarda solo en localStorage con mensaje informativo. |
| Tests automatizados | ❌ No implementado | No hay archivos de test ni configuración de testing en el workspace. |

---

## Conclusión

El flujo crítico principal está **completo y funcional**: un usuario puede abrir la página, iniciar el juego con un solo input (Space/click/tap), jugar saltando entre tuberías, ver su puntaje incrementar, chocar, ver la pantalla de game over con puntaje y high score, y reiniciar para jugar de nuevo. Todos los criterios de aceptación bloqueantes están cubiertos. Las únicas omisiones son features explícitamente marcadas como opcionales o fuera de alcance en la especificación.
