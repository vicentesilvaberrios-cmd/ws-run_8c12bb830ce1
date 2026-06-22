"use client";

interface ScoreHUDProps {
  score: number;
}

/**
 * HUD de puntaje: número grande centrado arriba durante PLAYING.
 * Se actualiza via estado ligero de React sin re-render del canvas.
 */
export default function ScoreHUD({ score }: ScoreHUDProps) {
  const display = String(score).padStart(2, "0");
  return (
    <div
      className="game-overlay game-overlay--top"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="score-display" aria-label={`Puntaje: ${score}`}>
        {display}
      </div>
      <span className="sr-only">Puntaje: {score}</span>
    </div>
  );
}
