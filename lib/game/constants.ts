// Constantes de configuración del juego Flappy Bird

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const BIRD_X = 80;
export const BIRD_RADIUS = 14;

export const GRAVITY = 1200; // px/s²
export const FLAP_FORCE = -400; // px/s (impulso instantáneo)

export const PIPE_WIDTH = 60;
export const PIPE_GAP = 160; // altura del hueco
export const PIPE_SPEED = 160; // px/s hacia la izquierda
export const PIPE_SPAWN_INTERVAL = 1.5; // segundos entre spawns

export const GROUND_HEIGHT = 80;
export const GROUND_SPEED = 160; // px/s

// Rango para la posición vertical del centro del hueco
export const PIPE_GAP_MIN_Y = 120;
export const PIPE_GAP_MAX_Y = CANVAS_HEIGHT - GROUND_HEIGHT - 120;

// Animación del pájaro
export const BIRD_FRAME_COUNT = 3;
export const BIRD_FRAME_DURATION = 0.1; // segundos por frame
export const BIRD_MAX_ROTATION = 0.5; // radianes (~28°)
export const BIRD_ROTATION_UP = -0.4; // radianes al saltar
export const BIRD_ROTATION_SPEED = 4; // rad/s para interpolar rotación

export const CLOUD_COUNT = 4;
export const CLOUD_SPEED = 30; // px/s (parallax lento)

export const COLORS = {
  sky: "#70c5ce",
  skyBottom: "#9fd8e0",
  ground: "#ded895",
  groundDark: "#c5bf7e",
  pipe: "#5fbf3f",
  pipeDark: "#3a8a2a",
  pipeLight: "#7dd95d",
  pipeBorder: "#2d6b1f",
  bird: "#f7d51d",
  birdAccent: "#f39c12",
  birdWing: "#ffffff",
  birdEye: "#000000",
  white: "#ffffff",
  black: "#000000",
  cloud: "#ffffff",
} as const;

export const MEDALS = {
  BRONZE: { min: 10, label: "Medalla de bronce" },
  SILVER: { min: 20, label: "Medalla de plata" },
  GOLD: { min: 30, label: "Medalla de oro" },
  PLATINUM: { min: 40, label: "Medalla de platino" },
} as const;

export const STORAGE_KEY = "flappy_highscore";
