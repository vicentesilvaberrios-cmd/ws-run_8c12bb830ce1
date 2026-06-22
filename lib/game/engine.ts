// Lógica del game loop, física y render (puro TS, sin React)
import type { Bird, Pipe, GameState, GameStatus, Cloud } from "./entities";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BIRD_X,
  BIRD_RADIUS,
  GRAVITY,
  FLAP_FORCE,
  PIPE_WIDTH,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_SPAWN_INTERVAL,
  GROUND_HEIGHT,
  GROUND_SPEED,
  BIRD_FRAME_COUNT,
  BIRD_FRAME_DURATION,
  BIRD_ROTATION_UP,
  BIRD_MAX_ROTATION,
  PIPE_GAP_MIN_Y,
  PIPE_GAP_MAX_Y,
  CLOUD_SPEED,
  COLORS,
} from "./constants";
import {
  checkBirdPipeCollision,
  checkGroundCollision,
  checkCeilingCollision,
} from "./collision";
import {
  drawBackground,
  drawClouds,
  drawPipes,
  drawGround,
  drawBird,
  initClouds,
  updateClouds,
} from "./renderer";

export class FlappyEngine {
  state: GameState;
  private clouds: Cloud[];
  private onScoreChange: ((score: number) => void) | null = null;
  private onGameOver: ((score: number) => void) | null = null;

  constructor(highScore: number = 0) {
    this.clouds = initClouds();
    this.state = this.createInitialState(highScore);
  }

  private createInitialState(highScore: number): GameState {
    return {
      status: "READY",
      bird: this.createBird(),
      pipes: [],
      score: 0,
      highScore,
      groundOffset: 0,
      spawnTimer: 0,
    };
  }

  private createBird(): Bird {
    return {
      x: BIRD_X,
      y: CANVAS_HEIGHT / 2,
      velocity: 0,
      gravity: GRAVITY,
      flapForce: FLAP_FORCE,
      radius: BIRD_RADIUS,
      rotation: 0,
      frameIndex: 0,
      frameTimer: 0,
    };
  }

  /**
   * Reinicia el juego al estado READY manteniendo el highScore.
   */
  reset(): void {
    const highScore = this.state.highScore;
    this.clouds = initClouds();
    this.state = this.createInitialState(highScore);
  }

  /**
   * Inicia el juego: pasa de READY a PLAYING y aplica el primer flap.
   */
  start(): void {
    if (this.state.status !== "READY") return;
    this.state.status = "PLAYING";
    this.flap();
  }

  /**
   * Aplica el impulso de salto al pájaro.
   */
  flap(): void {
    if (this.state.status === "GAME_OVER") return;
    if (this.state.status === "READY") {
      this.start();
      return;
    }
    this.state.bird.velocity = this.state.bird.flapForce;
    this.state.bird.rotation = BIRD_ROTATION_UP;
  }

  /**
   * Genera un nuevo par de tuberías con hueco a altura aleatoria.
   */
  spawnPipe(): void {
    const minY = PIPE_GAP_MIN_Y;
    const maxY = PIPE_GAP_MAX_Y;
    const gapY = minY + Math.random() * (maxY - minY);
    const pipe: Pipe = {
      x: CANVAS_WIDTH,
      gapY,
      gapHeight: PIPE_GAP,
      width: PIPE_WIDTH,
      scored: false,
    };
    this.state.pipes.push(pipe);
  }

  /**
   * Actualiza la física del pájaro.
   */
  updateBird(dt: number): void {
    const bird = this.state.bird;
    bird.velocity += bird.gravity * dt;
    bird.y += bird.velocity * dt;

    // Rotación: hacia arriba al saltar, hacia abajo al caer
    if (bird.velocity < 0) {
      bird.rotation = Math.max(bird.rotation - 8 * dt, BIRD_ROTATION_UP);
    } else {
      bird.rotation = Math.min(bird.rotation + 6 * dt, BIRD_MAX_ROTATION);
    }

    // Animación de aleteo
    bird.frameTimer += dt;
    if (bird.frameTimer >= BIRD_FRAME_DURATION) {
      bird.frameTimer = 0;
      bird.frameIndex = (bird.frameIndex + 1) % BIRD_FRAME_COUNT;
    }
  }

  /**
   * Actualiza las tuberías: las mueve, elimina las fuera de pantalla y detecta puntaje.
   */
  updatePipes(dt: number): void {
    const pipes = this.state.pipes;
    for (const pipe of pipes) {
      pipe.x -= PIPE_SPEED * dt;

      // Detectar paso del pájaro por el centro de la tubería
      if (!pipe.scored && pipe.x + pipe.width < this.state.bird.x) {
        pipe.scored = true;
        this.state.score++;
        this.onScoreChange?.(this.state.score);
      }
    }

    // Eliminar tuberías que salieron del viewport
    this.state.pipes = pipes.filter((p) => p.x + p.width > -10);

    // Spawn de nuevas tuberías
    this.state.spawnTimer += dt;
    if (this.state.spawnTimer >= PIPE_SPAWN_INTERVAL) {
      this.state.spawnTimer = 0;
      this.spawnPipe();
    }
  }

  /**
   * Verifica todas las colisiones posibles.
   */
  checkCollisions(): boolean {
    const bird = this.state.bird;

    if (checkGroundCollision(bird)) {
      bird.y = CANVAS_HEIGHT - GROUND_HEIGHT - bird.radius;
      return true;
    }
    if (checkCeilingCollision(bird)) {
      bird.y = bird.radius;
      bird.velocity = 0;
      return true;
    }
    for (const pipe of this.state.pipes) {
      if (checkBirdPipeCollision(bird, pipe)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Actualiza el estado del juego en un frame.
   */
  update(dt: number): void {
    // Actualizar nubes siempre (parallax de fondo)
    updateClouds(this.clouds, dt, CLOUD_SPEED);

    // Actualizar suelo siempre (animación continua)
    this.state.groundOffset += GROUND_SPEED * dt;

    if (this.state.status === "READY") {
      // Pájaro flotando suavemente en READY
      this.updateBirdFloating(dt);
      return;
    }

    if (this.state.status !== "PLAYING") return;

    this.updateBird(dt);
    this.updatePipes(dt);

    if (this.checkCollisions()) {
      this.state.status = "GAME_OVER";
      this.onGameOver?.(this.state.score);
    }
  }

  /**
   * Animación suave del pájaro flotando en estado READY.
   */
  private updateBirdFloating(dt: number): void {
    const bird = this.state.bird;
    bird.frameTimer += dt;
    if (bird.frameTimer >= BIRD_FRAME_DURATION) {
      bird.frameTimer = 0;
      bird.frameIndex = (bird.frameIndex + 1) % BIRD_FRAME_COUNT;
    }
    // Movimiento senoidal suave
    const time = performance.now() / 1000;
    bird.y = CANVAS_HEIGHT / 2 + Math.sin(time * 2) * 15;
    bird.rotation = Math.sin(time * 2) * 0.1;
  }

  /**
   * Renderiza el juego completo en el canvas.
   */
  render(ctx: CanvasRenderingContext2D): void {
    // Limpiar canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Fondo
    drawBackground(ctx);
    drawClouds(ctx, this.clouds);

    // Tuberías
    drawPipes(ctx, this.state.pipes);

    // Suelo
    drawGround(ctx, this.state.groundOffset);

    // Pájaro
    drawBird(ctx, this.state.bird);
  }

  /**
   * Callbacks para notificar a React de cambios de estado.
   */
  setOnScoreChange(cb: (score: number) => void): void {
    this.onScoreChange = cb;
  }

  setOnGameOver(cb: (score: number) => void): void {
    this.onGameOver = cb;
  }

  get status(): GameStatus {
    return this.state.status;
  }

  get score(): number {
    return this.state.score;
  }

  get highScore(): number {
    return this.state.highScore;
  }

  set highScore(value: number) {
    this.state.highScore = value;
  }
}
