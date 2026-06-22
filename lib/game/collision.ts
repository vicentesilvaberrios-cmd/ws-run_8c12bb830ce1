// Funciones de detección de colisiones
import type { Bird, Pipe } from "./entities";
import { CANVAS_HEIGHT, GROUND_HEIGHT, BIRD_RADIUS } from "./constants";

/**
 * Colisión circular (pájaro) vs rectángulo (tubería).
 * Comprueba la distancia del centro del pájaro al rectángulo más cercano.
 */
function circleRectCollision(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < radius * radius;
}

/**
 * Verifica si el pájaro colisiona con un par de tuberías (superior e inferior).
 */
export function checkBirdPipeCollision(bird: Bird, pipe: Pipe): boolean {
  const halfGap = pipe.gapHeight / 2;
  // Tubería superior: desde y=0 hasta gapY - halfGap
  const topRect = {
    x: pipe.x,
    y: 0,
    w: pipe.width,
    h: pipe.gapY - halfGap,
  };
  // Tubería inferior: desde gapY + halfGap hasta el suelo
  const bottomRect = {
    x: pipe.x,
    y: pipe.gapY + halfGap,
    w: pipe.width,
    h: CANVAS_HEIGHT - GROUND_HEIGHT - (pipe.gapY + halfGap),
  };

  if (circleRectCollision(bird.x, bird.y, bird.radius, topRect.x, topRect.y, topRect.w, topRect.h)) {
    return true;
  }
  if (circleRectCollision(bird.x, bird.y, bird.radius, bottomRect.x, bottomRect.y, bottomRect.w, bottomRect.h)) {
    return true;
  }
  return false;
}

/**
 * Verifica si el pájaro toca el suelo.
 */
export function checkGroundCollision(bird: Bird): boolean {
  return bird.y + bird.radius >= CANVAS_HEIGHT - GROUND_HEIGHT;
}

/**
 * Verifica si el pájaro toca el techo (sale por arriba).
 */
export function checkCeilingCollision(bird: Bird): boolean {
  return bird.y - bird.radius <= 0;
}

// Re-export para conveniencia
export { BIRD_RADIUS };
