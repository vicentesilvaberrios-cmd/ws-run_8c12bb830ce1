"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FlappyEngine } from "@/lib/game/engine";
import {
  getLocalHighScore,
  setLocalHighScore,
  getServerHighScore,
  submitServerHighScore,
} from "@/lib/game/storage";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/game/constants";
import type { GameStatus } from "@/lib/game/entities";
import GameCanvas from "./GameCanvas";
import StartOverlay from "./StartOverlay";
import ScoreHUD from "./ScoreHUD";
import GameOverOverlay from "./GameOverOverlay";

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FlappyEngine | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Estado de React (mínimo, solo para overlays)
  const [status, setStatus] = useState<GameStatus>("READY");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [fatalError, setFatalError] = useState(false);

  // Inicializar engine y cargar high score
  useEffect(() => {
    const localScore = getLocalHighScore();
    const engine = new FlappyEngine(localScore);
    engineRef.current = engine;

    engine.setOnScoreChange((s) => {
      setScore(s);
    });

    engine.setOnGameOver((finalScore) => {
      const prevHigh = engine.highScore;
      let newRecord = false;

      if (finalScore > prevHigh) {
        newRecord = true;
        setLocalHighScore(finalScore);
        engine.highScore = finalScore;
        setHighScore(finalScore);

        // Sincronizar con el servidor (best-effort)
        submitServerHighScore(finalScore).then((result) => {
          if (!result.ok) {
            setSyncError(true);
          }
        });
      } else {
        setHighScore(prevHigh);
      }

      setIsNewRecord(newRecord);
      setStatus("GAME_OVER");
    });

    setHighScore(localScore);

    // Cargar high score del servidor (best-effort)
    getServerHighScore().then((result) => {
      if (result.ok && result.score > localScore) {
        setLocalHighScore(result.score);
        engine.highScore = result.score;
        setHighScore(result.score);
      }
    });

    // Game loop
    const loop = (timestamp: number) => {
      const canvas = canvasRef.current;
      const eng = engineRef.current;
      if (!canvas || !eng) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setFatalError(true);
        return;
      }

      // Calcular delta time (clampado para evitar saltos)
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      // Actualizar y renderizar
      eng.update(dt);
      eng.render(ctx);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Manejar input de flap/inicio
  const handleInput = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.status === "READY") {
      engine.flap();
      setStatus("PLAYING");
      setScore(0);
    } else if (engine.status === "PLAYING") {
      engine.flap();
    }
    // En GAME_OVER, el tap en canvas NO reinicia (evita reinicios accidentales)
  }, []);

  // Manejar input de teclado
  const handleKeyInput = useCallback(
    (key: "flap" | "restart") => {
      const engine = engineRef.current;
      if (!engine) return;

      if (key === "flap") {
        if (engine.status === "READY") {
          engine.flap();
          setStatus("PLAYING");
          setScore(0);
        } else if (engine.status === "PLAYING") {
          engine.flap();
        } else if (engine.status === "GAME_OVER") {
          handleRestart();
        }
      } else if (key === "restart") {
        if (engine.status === "GAME_OVER") {
          handleRestart();
        }
      }
    },
    []
  );

  // Reiniciar el juego
  const handleRestart = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset();
    setScore(0);
    setIsNewRecord(false);
    setSyncError(false);
    setStatus("READY");
  }, []);

  // Listener global de teclado para Space/Enter (fuera del canvas)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        // Prevenir scroll
        e.preventDefault();
        handleKeyInput("flap");
      } else if (e.code === "Enter") {
        e.preventDefault();
        handleKeyInput("restart");
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [handleKeyInput]);

  if (fatalError) {
    return (
      <div className="game-shell">
        <div className="card" style={{ maxWidth: 400 }}>
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            No pudimos iniciar el juego. Recargá la página.
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-shell">
      <div className="game-stage" style={{ background: "#70c5ce" }}>
        <GameCanvas ref={canvasRef} onInput={handleInput} onKeyInput={handleKeyInput} />

        {status === "READY" && <StartOverlay highScore={highScore} />}
        {status === "PLAYING" && <ScoreHUD score={score} />}
        {status === "GAME_OVER" && (
          <>
            <GameOverOverlay
              score={score}
              highScore={highScore}
              isNewRecord={isNewRecord}
              onRestart={handleRestart}
            />
            {syncError && (
              <div
                className="alert alert-info"
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                  right: "8px",
                  pointerEvents: "auto",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  background: "rgba(14,165,233,0.2)",
                  color: "#fff",
                  borderColor: "rgba(14,165,233,0.5)",
                }}
              >
                <span>
                  Guardamos tu récord en este dispositivo. No pudimos sincronizarlo.
                </span>
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
                  onClick={() => setSyncError(false)}
                >
                  Cerrar
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <a
        href="/about"
        className="muted text-sm"
        style={{ textDecoration: "underline" }}
      >
        Cómo jugar
      </a>
      {/* Dimensión lógica del canvas (accesibilidad) */}
      <span aria-hidden="true" style={{ display: "none" }}>
        {CANVAS_WIDTH}x{CANVAS_HEIGHT}
      </span>
    </div>
  );
}
