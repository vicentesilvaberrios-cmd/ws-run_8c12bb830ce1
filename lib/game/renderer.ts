// Funciones de dibujo en canvas
import type { Bird, Pipe, Cloud } from "./entities";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_HEIGHT,
  BIRD_FRAME_COUNT,
  BIRD_FRAME_DURATION,
  BIRD_MAX_ROTATION,
  COLORS,
  CLOUD_COUNT,
} from "./constants";

/**
 * Dibuja el fondo del cielo con gradiente vertical.
 */
export function drawBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
  gradient.addColorStop(0, COLORS.sky);
  gradient.addColorStop(1, COLORS.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);
}

/**
 * Dibuja nubes con parallax opcional.
 */
export function drawClouds(ctx: CanvasRenderingContext2D, clouds: Cloud[]): void {
  ctx.fillStyle = COLORS.cloud;
  ctx.globalAlpha = 0.7;
  for (const cloud of clouds) {
    const s = cloud.scale;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 18 * s, 0, Math.PI * 2);
    ctx.arc(cloud.x + 20 * s, cloud.y - 5 * s, 14 * s, 0, Math.PI * 2);
    ctx.arc(cloud.x + 35 * s, cloud.y, 16 * s, 0, Math.PI * 2);
    ctx.arc(cloud.x + 15 * s, cloud.y + 8 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Actualiza la posición de las nubes (parallax lento) y las recicla.
 */
export function updateClouds(clouds: Cloud[], dt: number, speed: number): void {
  for (const cloud of clouds) {
    cloud.x -= speed * dt;
    if (cloud.x < -60) {
      cloud.x = CANVAS_WIDTH + 40;
      cloud.y = 40 + Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - 120);
      cloud.scale = 0.6 + Math.random() * 0.6;
    }
  }
}

/**
 * Inicializa las nubes en posiciones aleatorias.
 */
export function initClouds(): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < CLOUD_COUNT; i++) {
    clouds.push({
      x: Math.random() * CANVAS_WIDTH,
      y: 40 + Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - 120),
      scale: 0.6 + Math.random() * 0.6,
    });
  }
  return clouds;
}

/**
 * Dibuja un par de tuberías (superior e inferior).
 */
export function drawPipes(ctx: CanvasRenderingContext2D, pipes: Pipe[]): void {
  for (const pipe of pipes) {
    const halfGap = pipe.gapHeight / 2;
    const topHeight = pipe.gapY - halfGap;
    const bottomY = pipe.gapY + halfGap;
    const bottomHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomY;

    // Tubería superior
    drawPipeRect(ctx, pipe.x, 0, pipe.width, topHeight, true);
    // Tubería inferior
    drawPipeRect(ctx, pipe.x, bottomY, pipe.width, bottomHeight, false);
  }
}

function drawPipeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isTop: boolean
): void {
  if (h <= 0) return;

  // Cuerpo de la tubería
  ctx.fillStyle = COLORS.pipe;
  ctx.fillRect(x, y, w, h);

  // Borde oscuro
  ctx.fillStyle = COLORS.pipeBorder;
  ctx.fillRect(x, y, 3, h);
  ctx.fillRect(x + w - 3, y, 3, h);

  // Highlight claro
  ctx.fillStyle = COLORS.pipeLight;
  ctx.fillRect(x + 6, y, 6, h);

  // "Boca" de la tubería (la parte ancha)
  const lipHeight = 24;
  const lipOverhang = 4;
  const lipY = isTop ? y + h - lipHeight : y;
  ctx.fillStyle = COLORS.pipe;
  ctx.fillRect(x - lipOverhang, lipY, w + lipOverhang * 2, lipHeight);

  // Borde oscuro de la boca
  ctx.fillStyle = COLORS.pipeBorder;
  ctx.fillRect(x - lipOverhang, lipY, 3, lipHeight);
  ctx.fillRect(x + w + lipOverhang - 3, lipY, 3, lipHeight);
  ctx.fillRect(x - lipOverhang, isTop ? lipY + lipHeight - 3 : lipY, w + lipOverhang * 2, 3);

  // Highlight de la boca
  ctx.fillStyle = COLORS.pipeLight;
  ctx.fillRect(x - lipOverhang + 6, lipY + 4, 6, lipHeight - 8);
}

/**
 * Dibuja el suelo con patrón en movimiento.
 */
export function drawGround(ctx: CanvasRenderingContext2D, offset: number): void {
  const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;

  // Base del suelo
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);

  // Banda superior oscura
  ctx.fillStyle = COLORS.groundDark;
  ctx.fillRect(0, groundY, CANVAS_WIDTH, 12);

  // Patrón de líneas diagonales en movimiento
  ctx.fillStyle = COLORS.groundDark;
  const stripeWidth = 24;
  const totalOffset = offset % (stripeWidth * 2);
  for (let i = -2; i < CANVAS_WIDTH / stripeWidth + 2; i++) {
    const x = i * stripeWidth - totalOffset;
    ctx.beginPath();
    ctx.moveTo(x, groundY + 12);
    ctx.lineTo(x + stripeWidth / 2, groundY + 12);
    ctx.lineTo(x + stripeWidth / 2 - 8, groundY + GROUND_HEIGHT);
    ctx.lineTo(x - 8, groundY + GROUND_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  // Línea de separación superior
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, groundY, CANVAS_WIDTH, 2);
}

/**
 * Dibuja el pájaro con rotación y animación de aleteo.
 */
export function drawBird(ctx: CanvasRenderingContext2D, bird: Bird): void {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  const r = bird.radius;

  // Cuerpo
  ctx.fillStyle = COLORS.bird;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Borde del cuerpo
  ctx.strokeStyle = COLORS.birdAccent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ala (animada según frameIndex)
  const wingOffset = bird.frameIndex === 0 ? -2 : bird.frameIndex === 1 ? 0 : 2;
  ctx.fillStyle = COLORS.birdWing;
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, wingOffset, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.birdAccent;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ojo
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(r * 0.4, -r * 0.3, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.birdEye;
  ctx.beginPath();
  ctx.arc(r * 0.5, -r * 0.3, r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Pico
  ctx.fillStyle = COLORS.birdAccent;
  ctx.beginPath();
  ctx.moveTo(r * 0.7, 0);
  ctx.lineTo(r * 1.3, -r * 0.15);
  ctx.lineTo(r * 1.3, r * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Re-export de constantes usadas por el renderer
export { BIRD_FRAME_COUNT, BIRD_FRAME_DURATION, BIRD_MAX_ROTATION };
