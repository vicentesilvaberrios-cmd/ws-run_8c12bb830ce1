// Funciones para guardar/cargar high score en localStorage y servidor
import { STORAGE_KEY } from "./constants";

const HIGHSCORE_KEY = STORAGE_KEY;

/**
 * Obtiene el high score guardado en localStorage.
 * Retorna 0 si no hay registro previo.
 */
export function getLocalHighScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const value = window.localStorage.getItem(HIGHSCORE_KEY);
    if (value === null) return 0;
    const score = parseInt(value, 10);
    return Number.isNaN(score) ? 0 : score;
  } catch {
    return 0;
  }
}

/**
 * Guarda el high score en localStorage.
 */
export function setLocalHighScore(score: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HIGHSCORE_KEY, String(score));
  } catch {
    // Silencioso: localStorage puede estar bloqueado
  }
}

/**
 * Obtiene el high score del servidor via API.
 * Retorna 0 si no hay registro o si falla la petición.
 */
export async function getServerHighScore(): Promise<{ score: number; ok: boolean }> {
  try {
    const res = await fetch("/api/highscore");
    if (!res.ok) return { score: 0, ok: false };
    const data = await res.json();
    return { score: data.score ?? 0, ok: true };
  } catch {
    return { score: 0, ok: false };
  }
}

/**
 * Envía un nuevo high score al servidor.
 * Retorna { score, isNew, ok }.
 */
export async function submitServerHighScore(
  score: number
): Promise<{ score: number; isNew: boolean; ok: boolean }> {
  try {
    const res = await fetch("/api/highscore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
    if (!res.ok) return { score: 0, isNew: false, ok: false };
    const data = await res.json();
    return {
      score: data.score ?? 0,
      isNew: data.isNew ?? false,
      ok: true,
    };
  } catch {
    return { score: 0, isNew: false, ok: false };
  }
}
