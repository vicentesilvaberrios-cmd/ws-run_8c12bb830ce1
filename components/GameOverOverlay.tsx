"use client";

import { useEffect, useRef } from "react";
import { MEDALS } from "@/lib/game/constants";

interface GameOverOverlayProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

function getMedal(score: number): { label: string; className: string } | null {
  if (score >= MEDALS.PLATINUM.min)
    return { label: "Medalla de platino", className: "badge badge-info" };
  if (score >= MEDALS.GOLD.min)
    return { label: "Medalla de oro", className: "badge badge-ok" };
  if (score >= MEDALS.SILVER.min)
    return { label: "Medalla de plata", className: "badge badge-warn" };
  if (score >= MEDALS.BRONZE.min)
    return { label: "Medalla de bronce", className: "badge badge-danger" };
  return null;
}

/**
 * Overlay de Game Over: muestra puntaje, mejor marca, récord, medalla y botón de reinicio.
 * Visible solo cuando status === 'GAME_OVER'.
 */
export default function GameOverOverlay({
  score,
  highScore,
  isNewRecord,
  onRestart,
}: GameOverOverlayProps) {
  const restartBtnRef = useRef<HTMLButtonElement>(null);
  const medal = getMedal(score);

  // Foco automático al botón "Volver a jugar"
  useEffect(() => {
    restartBtnRef.current?.focus();
  }, []);

  return (
    <div
      className="game-overlay game-overlay--center"
      role="dialog"
      aria-modal="true"
      aria-label="Juego terminado"
    >
      <div className="gameover-card">
        <h2>¡Juego terminado!</h2>

        {medal && (
          <div className="gameover-medal">
            <span className={medal.className} aria-live="polite">
              {medal.label}
            </span>
          </div>
        )}

        {isNewRecord && (
          <div style={{ marginBottom: "0.75rem" }} aria-live="assertive">
            <span className="badge badge-ok">🏆 ¡Nuevo récord!</span>
          </div>
        )}

        <div className="gameover-kpis">
          <div className="kpi">
            <span className="label">Tu puntaje</span>
            <span className="value">{score}</span>
          </div>
          <div className="kpi">
            <span className="label">Mejor marca</span>
            <span className="value">{highScore}</span>
          </div>
        </div>

        <div className="gameover-actions">
          <button
            ref={restartBtnRef}
            className="btn btn-primary btn-block"
            onClick={onRestart}
            aria-label="Volver a jugar"
          >
            Volver a jugar
          </button>
          <a href="/about" className="btn btn-ghost btn-block">
            Cómo jugar
          </a>
        </div>
      </div>
    </div>
  );
}
