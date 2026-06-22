# Spec.md — Flappy Bird Web Game

## 1. Objetivo y Alcance

### Objetivo
Construir un juego web de Flappy Bird completamente jugable en el navegador usando Next.js (App Router) + TypeScript + Canvas HTML5. El jugador controla un pájaro que cae por gravedad y sube al hacer click/tap o presionar la barra espaciadora. Debe esquivar tuberías verdes que se desplazan desde la derecha, acumular puntos al pasar entre ellas, y ver una pantalla de game over con opción de reiniciar. El mejor puntaje (high score) se persiste en `localStorage` y opcionalmente en el servidor.

### Dentro de alcance
- Juego completo con bucle de animación a 60 FPS usando `requestAnimationFrame`.
- Pájaro con física de gravedad y salto.
- Tuberías generadas proceduralmente con huecos a alturas aleatorias.
- Detección de colisiones (tuberías, suelo, techo).
- Sistema de puntaje y high score persistente.
- Pantalla de inicio, juego, y game over.
- Controles responsivos: teclado (Space, click), touch (tap en móvil).
- Estilo retro colorido con paleta de colores definida.
- Persistencia de high score en `localStorage` + API endpoint para guardar/cargar en servidor (SQLite).

### Fuera de alcance
- Autenticación de usuarios / cuentas.
- Multijugador.
- Tabla de clasificación global en tiempo real.
- Niveles o dificultad seleccionable (se puede añadir dificultad progresiva opcional pero no es requerido).
- Sonidos (opcional, no bloqueante).
- Instalación PWA / modo offline más allá del caching de Next.js.

---

## 2. Épicas y Funcionalidades

### Épica 1: Motor del juego (Game Loop)
- **1.1** Bucle de renderizado a 60 FPS con `requestAnimationFrame` y cálculo de delta time.
- **1.2** Gestión de estados de juego: `READY`, `PLAYING`, `GAME_OVER`.
- **1.3** Redimensionado responsivo del canvas manteniendo relación de aspecto fija (p. ej. 400×600).
- **1.4** Limpieza y redibujado del canvas en cada frame.

### Épica 2: Pájaro (Bird)
- **2.1** Entidad Bird con posición (x fija, y variable), velocidad vertical, aceleración de gravedad.
- **2.2** Acción de salto (flap): aplica impulso vertical negativo instantáneo.
- **2.3** Rotación visual del pájaro según velocidad (hacia arriba al saltar, hacia abajo al caer).
- **2.4** Animación de aleteo del sprite (cuadros de animación cíclicos).
- **2.5** Colisión AABB o circular del pájaro con tuberías, suelo y techo.

### Épica 3: Tuberías (Pipes)
- **3.1** Generación de pares de tuberías (superior e inferior) con un hueco vertical entre ellas.
- **3.2** Altura del hueco aleatoria dentro de un rango válido.
- **3.3** Desplazamiento de las tuberías hacia la izquierda a velocidad constante.
- **3.4** Spawn periódico de nuevos pares de tuberías a una distancia fija.
- **3.5** Eliminación de tuberías que salen del viewport por la izquierda.
- **3.6** Detección de paso del pájaro por el centro de un par de tuberías → incrementar puntaje.

### Épica 4: Entorno visual (Ground, Background, Ceiling)
- **4.1** Fondo de cielo con gradiente o color sólido estilo retro.
- **4.2** Suelo (ground) en la parte inferior con textura/patrón en movimiento continuo.
- **4.3** Techo invisible o visible en la parte superior — colisión si el pájaro sale por arriba.
- **4.4** Nubes o decoraciones de fondo desplazándose en parallax (opcional, deseable).

### Épica 5: Puntaje y High Score
- **5.1** Marcador de puntos visible durante el juego (esquina superior central).
- **5.2** Incremento de +1 al pasar cada par de tuberías.
- **5.3** Guardado del high score en `localStorage` al terminar la partida.
- **5.4** Carga del high score desde `localStorage` al iniciar la app.
- **5.5** Guardado/carga del high score en servidor via API (opcional, con SQLite).

### Épica 6: Pantallas y UI
- **6.1** Pantalla de inicio (READY): título "Flappy Bird", instrucciones ("Presiona Space o toca para empezar"), pájaro flotando.
- **6.2** HUD durante el juego: puntaje actual grande en la parte superior.
- **6.3** Pantalla de Game Over: muestra puntaje obtenido, mejor puntaje, botón "Reiniciar".
- **6.4** Botón de inicio/reinicio accesible por click/touch y por teclado (Space/Enter).
- **6.5** Medalla visual según puntaje (bronce/plata/oro/platino) — opcional pero deseable.

### Épica 7: Controles responsivos
- **7.1** Teclado: barra espaciadora y flecha arriba para saltar; Enter/Space para iniciar/reiniciar.
- **7.2** Mouse: click izquierdo en cualquier parte del canvas para saltar / iniciar / reiniciar.
- **7.3** Touch: tap en cualquier parte del canvas para saltar / iniciar / reiniciar (móvil).
- **7.4** Prevención de scroll del navegador al presionar Space en móvil/desktop.
- **7.5** Canvas escalable con CSS para ocupar el viewport disponible sin perder proporción.

---

## 3. Modelo de Datos

### Entidad: Bird
| Campo       | Tipo     | Descripción                                      |
|-------------|----------|--------------------------------------------------|
| x           | number   | Posición horizontal fija (p. ej. 80)             |
| y           | number   | Posición vertical actual                         |
| velocity    | number   | Velocidad vertical actual (px/seg)               |
| gravity     | number   | Aceleración de gravedad constante (px/seg²)      |
| flapForce   | number   | Impulso vertical aplicado al saltar (negativo)   |
| radius      | number   | Radio para colisión circular                     |
| rotation    | number   | Ángulo de rotación en radianes                   |
| frameIndex  | number   | Índice del frame de animación actual             |
| frameTimer  | number   | Acumulador de tiempo para cambiar de frame       |

### Entidad: Pipe
| Campo       | Tipo     | Descripción                                              |
|-------------|----------|----------------------------------------------------------|
| x           | number   | Posición horizontal (se decrementa cada frame)           |
| gapY        | number   | Posición vertical del centro del hueco                   |
| gapHeight   | number   | Altura del hueco por donde pasa el pájaro                |
| width       | number   | Ancho de la tubería (p. ej. 60)                          |
| scored      | boolean  | `true` si el pájaro ya pasó esta tubería (para puntaje)  |

### Entidad: GameState
| Campo         | Tipo                          | Descripción                              |
|---------------|-------------------------------|------------------------------------------|
| status        | `"READY" \| "PLAYING" \| "GAME_OVER"` | Estado actual del juego         |
| bird          | Bird                          | Instancia del pájaro                     |
| pipes         | Pipe[]                        | Array de tuberías activas                |
| score         | number                        | Puntaje de la partida actual             |
| highScore     | number                        | Mejor puntaje histórico                  |
| groundOffset  | number                        | Offset de scroll del suelo               |
| spawnTimer    | number                        | Contador para spawn de próxima tubería   |

### Entidad: HighScoreRecord (servidor, opcional)
| Campo       | Tipo     | Descripción                                      |
|-------------|----------|--------------------------------------------------|
| id          | string   | Identificador único (UUID)                       |
| score       | number   | Puntaje                                          |
| createdAt   | string   | ISO timestamp de creación                        |

### Relaciones
- **GameState** contiene exactamente **1 Bird** y **0..N Pipes**.
- **HighScoreRecord** es independiente (no hay usuarios); representa el mejor puntaje global almacenado en servidor.

---

## 4. Rutas / Páginas (App Router)

| Ruta                    | Archivo                        | Descripción                                                                 |
|-------------------------|--------------------------------|-----------------------------------------------------------------------------|
| `/`                     | `app/page.tsx`                 | Página principal. Renderiza el componente `<FlappyGame />` a pantalla completa. Incluye metadatos SEO y layout centrado. |
| `/about` (opcional)     | `app/about/page.tsx`           | Página informativa sobre controles y créditos. Opcional.                    |

### Estructura de componentes
- `components/FlappyGame.tsx` — Componente cliente principal. Gestiona el canvas, el game loop, los estados, los controles y la renderización de overlays (UI) sobre el canvas.
- `components/GameCanvas.tsx` — Wrapper del `<canvas>` con manejo de resize y eventos.
- `components/GameOverOverlay.tsx` — Overlay HTML/React para la pantalla de game over.
- `components/StartOverlay.tsx` — Overlay HTML/React para la pantalla de inicio.
- `components/ScoreHUD.tsx` — Overlay HTML/React para mostrar el puntaje durante el juego.
- `lib/game/engine.ts` — Lógica del game loop, física y render (puro TS, sin React).
- `lib/game/entities.ts` — Definiciones de tipos e interfaces de Bird, Pipe, GameState.
- `lib/game/constants.ts` — Constantes de configuración (gravedad, velocidades, dimensiones, colores).
- `lib/game/storage.ts` — Funciones para guardar/cargar high score en localStorage.
- `lib/game/collision.ts` — Funciones de detección de colisiones.
- `lib/game/renderer.ts` — Funciones de dibujo en canvas (pájaro, tuberías, suelo, fondo).

---

## 5. Endpoints API

### `app/api/highscore/route.ts`
| Método | Descripción                                      | Request Body       | Response (200)                    |
|--------|--------------------------------------------------|--------------------|------------------------------------|
| GET    | Obtiene el high score global almacenado en servidor | —                  | `{ "score": number }`             |
| POST   | Guarda un nuevo high score si es mayor al actual  | `{ "score": number }` | `{ "score": number, "isNew": boolean }` |

#### GET `/api/highscore`
- Lee el high score desde la base de datos (SQLite via `better-sqlite3` o archivo JSON en `data/`).
- Si no existe, devuelve `{ "score": 0 }`.

#### POST `/api/highscore`
- Recibe `{ score: number }`.
- Valida que `score` sea un entero positivo.
- Compara con el high score actual. Si es mayor, lo actualiza y devuelve `{ "score": score, "isNew": true }`.
- Si no es mayor, devuelve `{ "score": currentHighScore, "isNew": false }`.

---

## 6. Criterios de Aceptación por Épica

### Épica 1: Motor del juego
- [ ] AC1.1: El canvas se renderiza a 60 FPS sin parpadeo (se mide con delta time y `requestAnimationFrame`).
- [ ] AC1.2: Los tres estados (`READY`, `PLAYING`, `GAME_OVER`) transicionan correctamente: al primer input en READY → PLAYING; al colisionar → GAME_OVER; al reiniciar → READY o PLAYING.
- [ ] AC1.3: El canvas mantiene su relación de aspecto al redimensionar la ventana del navegador.

### Épica 2: Pájaro
- [ ] AC2.1: El pájaro cae aceleradamente por gravedad cuando no hay input.
- [ ] AC2.2: Al presionar Space/click/tap, el pájaro salta hacia arriba instantáneamente.
- [ ] AC2.3: El pájaro rota visualmente hacia arriba al saltar y hacia abajo al caer.
- [ ] AC2.4: El pájaro se anima (aleteo) cíclicamente durante el juego.

### Épica 3: Tuberías
- [ ] AC3.1: Los pares de tuberías aparecen desde la derecha a intervalos regulares.
- [ ] AC3.2: La altura del hueco entre tubería superior e inferior varía aleatoriamente en cada spawn.
- [ ] AC3.3: Las tuberías se mueven hacia la izquierda a velocidad constante.
- [ ] AC3.4: Las tuberías que salen del viewport se eliminan del array (sin memory leak).
- [ ] AC3.5: El puntaje incrementa en +1 exactamente cuando el pájaro cruza el centro de un par de tuberías.

### Épica 4: Entorno visual
- [ ] AC4.1: El fondo del cielo se renderiza con un color/gradiente retro.
- [ ] AC4.2: El suelo se anima moviéndose hacia la izquierda continuamente.
- [ ] AC4.3: Si el pájaro toca el suelo o el techo, se detecta colisión → GAME_OVER.

### Épica 5: Puntaje y High Score
- [ ] AC5.1: El marcador muestra el puntaje actual en todo momento durante `PLAYING`.
- [ ] AC5.2: Al terminar la partida, si el puntaje supera el high score anterior, se actualiza y persiste en `localStorage`.
- [ ] AC5.3: Al recargar la página, el high score se carga correctamente desde `localStorage`.
- [ ] AC5.4: (Opcional) El high score se sincroniza con el servidor via API.

### Épica 6: Pantallas y UI
- [ ] AC6.1: La pantalla de inicio muestra el título y las instrucciones de control.
- [ ] AC6.2: La pantalla de Game Over muestra el puntaje obtenido y el high score.
- [ ] AC6.3: El botón "Reiniciar" funciona con click/touch y con teclado (Enter/Space).
- [ ] AC6.4: El estilo visual es retro y colorido (paleta de colores definida en constants).

### Épica 7: Controles responsivos
- [ ] AC7.1: La barra espaciadora hace saltar al pájaro e inicia el juego.
- [ ] AC7.2: Un click del mouse en el canvas hace saltar al pájaro e inicia el juego.
- [ ] AC7.3: Un tap táctil en el canvas hace saltar al pájaro e inicia el juego en móvil.
- [ ] AC7.4: Presionar Space no hace scroll de la página.
- [ ] AC7.5: El canvas es visible y jugable en pantallas de escritorio y móviles (mínimo 320px de ancho).

---

## 7. Flujos de Usuario Críticos

### Rol: Jugador (único rol)

#### Flujo #1 — Camino feliz: Jugar una partida completa y reiniciar (FLUJO CRÍTICO PRINCIPAL)

1. El jugador abre la app en el navegador (`/`).
2. Ve la **pantalla de inicio (READY)**: título "Flappy Bird", pájaro flotando, texto "Presiona Space o toca para empezar".
3. El jugador **presiona Space** (o hace click / tap).
4. El estado cambia a `PLAYING`. El pájaro da un primer flap. Las tuberías comienzan a generarse y desplazarse.
5. El jugador presiona Space repetidamente para mantener al pájaro en el aire y **pasar entre las tuberías**.
6. Cada vez que el pájaro cruza el centro de un par de tuberías, el **puntaje aumenta +1** y se muestra en el HUD.
7. El jugador continúa hasta que el pájaro **colisiona** con una tubería, el suelo o el techo.
8. El estado cambia a `GAME_OVER`. Aparece la **pantalla de Game Over** mostrando:
   - Puntaje obtenido.
   - High score (con indicación si es nuevo récord).
   - Botón "Reiniciar".
9. El jugador **presiona Space / Enter / click / tap** en el botón "Reiniciar".
10. El estado vuelve a `READY` (o directamente a `PLAYING` si se desea un reinicio rápido). El high score ya está guardado.
11. El jugador puede comenzar una nueva partida repitiendo desde el paso 3.

> **Criterio de aceptación explícito del flujo crítico:** Un usuario debe poder abrir la página, iniciar el juego con un solo input (Space/click/tap), jugar saltando entre tuberías, ver su puntaje incrementar, chocar, ver la pantalla de game over con su puntaje y high score, y reiniciar para jugar de nuevo — todo sin errores ni acciones bloqueadas. Si este flujo no se completa, la app se considera un **FRACASO**.

#### Flujo #2 — Camino feliz: Consultar high score persistente tras recargar

1. El jugador juega una partida y obtiene un puntaje (p. ej. 15).
2. Al morir, si 15 > high score anterior, se guarda 15 en `localStorage` y en el servidor (opcional).
3. El jugador **recarga la página** (F5).
4. La pantalla de inicio carga. El high score mostrado (si se muestra en inicio o en game over tras recargar) refleja correctamente 15.

#### Flujo #3 — Camino feliz: Jugar en dispositivo móvil (touch)

1. El jugador abre la app en un smartphone (Chrome/Safari).
2. Ve la pantalla de inicio escalada al ancho del dispositivo.
3. **Toca la pantalla** → el juego inicia.
4. **Toca repetidamente** para hacer saltar al pájaro y esquivar tuberías.
5. Al chocar, ve la pantalla de game over.
6. **Toca "Reiniciar"** → nueva partida.
7. No hay scroll accidental de la página al tocar.

---

## 8. Constantes de Configuración (referencia)

```typescript
// lib/game/constants.ts
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;
export const BIRD_X = 80;
export const BIRD_RADIUS = 14;
export const GRAVITY = 1200;        // px/s²
export const FLAP_FORCE = -400;     // px/s (impulso instantáneo)
export const PIPE_WIDTH = 60;
export const PIPE_GAP = 160;        // altura del hueco
export const PIPE_SPEED = 160;      // px/s hacia la izquierda
export const PIPE_SPAWN_INTERVAL = 1.5; // segundos entre spawns
export const GROUND_HEIGHT = 80;
export const GROUND_SPEED = 160;    // px/s
export const COLORS = {
  sky: "#70c5ce",
  ground: "#ded895",
  pipe: "#5fbf3f",
  pipeDark: "#3a8a2a",
  bird: "#f7d51d",
  birdAccent: "#f39c12",
  white: "#ffffff",
  black: "#000000",
};
```

---

## 9. Stack Técnico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript (strict)
- **Renderizado**: Canvas HTML5 2D
- **Estado de UI**: React (cliente) para overlays; estado del juego gestionado fuera del ciclo de React (clase/módulo puro TS).
- **Persistencia local**: `localStorage` (high score).
- **Persistencia servidor (opcional)**: SQLite via `better-sqlite3` o archivo JSON plano.
- **Estilos**: Tailwind CSS para layout y overlays; canvas dibujado manualmente.
- **Despliegue**: Compatible con Vercel (o cualquier host estático si se omite la API).

---

## 10. Consideraciones de Implementación

- El game loop **no** debe depender del ciclo de render de React. Se debe usar `requestAnimationFrame` directamente y mutar el canvas. React solo maneja los overlays de UI y el estado de alto nivel (`READY`/`PLAYING`/`GAME_OVER`).
- Evitar re-renders de React durante `PLAYING` — el HUD de puntaje puede actualizarse via `ref` o estado ligero.
- El canvas debe tener `touch-action: none` en CSS para evitar comportamientos táctiles no deseados en móvil.
- `preventDefault` en el evento `keydown` de Space para evitar scroll.
- Detección de colisión: circular para el pájaro (más justa y natural) vs. rectángulos para las tuberías. Usar la distancia del centro del pájaro a los bordes del rectángulo.
- El pájaro debe tener posición X fija; solo se mueve verticalmente. El mundo se desplaza hacia la izquierda.
