"use client";

import { forwardRef, useCallback } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/game/constants";

interface GameCanvasProps {
  onInput: () => void;
  onKeyInput?: (key: "flap" | "restart") => void;
}

/**
 * Wrapper del canvas 400×600 con manejo de resize responsivo,
 * listeners de click/touch y touch-action: none.
 * El teclado se maneja globalmente en FlappyGame (window listener).
 */
const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ onInput }, ref) => {
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        onInput();
      },
      [onInput]
    );

    return (
      <canvas
        ref={ref}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        tabIndex={0}
        role="application"
        aria-label="Juego Flappy Bird"
        id="juego"
        style={{
          touchAction: "none",
          outline: "none",
          cursor: "pointer",
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    );
  }
);

GameCanvas.displayName = "GameCanvas";
export default GameCanvas;
