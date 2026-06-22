"use client";

interface StartOverlayProps {
  highScore: number;
}

/**
 * Overlay de inicio (READY): título, instrucciones y mejor marca.
 * Visible solo cuando status === 'READY'.
 */
export default function StartOverlay({ highScore }: StartOverlayProps) {
  return (
    <div
      className="game-overlay game-overlay--center"
      role="dialog"
      aria-label="Pantalla de inicio"
    >
      <div className="start-card">
        <h1>Flappy Bird</h1>
        <p>Atraviesa las tuberías sin chocar.</p>
        <p style={{ fontWeight: 700 }}>
          Pulsa <span style={{ color: "#f7d51d" }}>Espacio</span> o tocá la pantalla para volar
        </p>
        <p style={{ fontSize: "0.85em", opacity: 0.75 }}>
          En móvil: tocá. En PC: Espacio, clic o flecha arriba.
        </p>
        {highScore > 0 && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.9em" }}>
            Mejor marca:{" "}
            <strong style={{ color: "#f7d51d" }}>{highScore}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
