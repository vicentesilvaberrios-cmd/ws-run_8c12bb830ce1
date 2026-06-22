// Definiciones de tipos e interfaces del juego

export type GameStatus = "READY" | "PLAYING" | "GAME_OVER";

export interface Bird {
  x: number;
  y: number;
  velocity: number;
  gravity: number;
  flapForce: number;
  radius: number;
  rotation: number;
  frameIndex: number;
  frameTimer: number;
}

export interface Pipe {
  x: number;
  gapY: number; // centro vertical del hueco
  gapHeight: number;
  width: number;
  scored: boolean;
}

export interface GameState {
  status: GameStatus;
  bird: Bird;
  pipes: Pipe[];
  score: number;
  highScore: number;
  groundOffset: number;
  spawnTimer: number;
}

export interface Cloud {
  x: number;
  y: number;
  scale: number;
}
