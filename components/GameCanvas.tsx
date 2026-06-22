"use client";

import { forwardRef, useCallback } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/game/constants";

interface GameCanvasProps {
  onInput: () => void;
  onKeyInput: (key: "flap" | "restart") => void;
}

/**
 * Wrapper del canvas 400×600 con manejo de resize responsivo,
 * listeners de click/touch/keydown y touch-action: none.
 */
const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ onInput, onKeyInput }, ref) => {
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        onInput();
      },
      [onInput]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLCanvasElement>) => {
        if (e.code === "Space" || e.code === "ArrowUp") {
          e.preventDefault();
          onKeyInput("flap");
        } else if (e.code === "Enter") {
          e.preventDefault();
          onKeyInput("restart");
        }
      },
      [onKeyInput]
    );

    return (
      <canvas
        ref={ref}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
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
