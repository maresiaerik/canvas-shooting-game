import MovingCanvasElement, {
  CanvasCoordinates,
  ElementMovementStatus,
  MovementDirection,
} from "../../abstract/MovingCanvasElement";

type PlayerStatus = "die" | "idle" | "walk" | "run" | "shoot";

export const STARTING_PLAYER_CANVAS_COORDINATES: CanvasCoordinates = {
  x: 300,
  y: 200,
};

const PLAYER_MAX_HEALTH = 100;

const DEFAULT_ANIMATION_FRAMES_BEFORE_UPDATE = 4;

const PLAYER_MOVEMENT_RUN_IN_PX = 15;

const PLAYER_MOVEMENT_WALK_IN_PX = 5;

export default class Player extends MovingCanvasElement<PlayerStatus> {
  protected readonly elementDimensionsOnSprite = {
    width: 128,
    height: 128,
  };

  protected readonly elementDimensionsOnCanvas = {
    width: 150,
    height: 150,
  };

  protected readonly movementFrameSizes: Record<ElementMovementStatus<PlayerStatus>, number> = {
    idle: 8,
    die: 5,
    walk: 7,
    run: 8,
    shoot: 4,
  };

  protected readonly spriteRowIdxForMovement: Record<ElementMovementStatus<PlayerStatus>, number> =
    {
      idle: 0,
      walk: 1,
      run: 2,
      shoot: 4,
      die: 9,
    };

  protected readonly animationFramesBeforeUpdate = DEFAULT_ANIMATION_FRAMES_BEFORE_UPDATE;

  protected movementDirection: MovementDirection = "right";

  protected elementMovementStatus: PlayerStatus = "idle";

  protected health: number = PLAYER_MAX_HEALTH;

  protected updateFrames(): void {
    if (this.currentHealth <= 0) {
      this.die();
    }

    if (this.elementMovementStatus === "die") {
      if (this.currentAnimationFrameIdx < this.movementFrameSizes.die - 1) {
        this.currentAnimationFrameIdx += 1;
      }
    } else {
      this.setSpriteAnimationFrameCoordinatesForMovement();

      if (this.elementMovementStatus === "walk") {
        this.canvasCoordinates.x +=
          this.movementDirection === "left"
            ? -PLAYER_MOVEMENT_WALK_IN_PX
            : PLAYER_MOVEMENT_WALK_IN_PX;
      } else if (this.elementMovementStatus === "run") {
        this.canvasCoordinates.x +=
          this.movementDirection === "left"
            ? -PLAYER_MOVEMENT_RUN_IN_PX
            : PLAYER_MOVEMENT_RUN_IN_PX;
      }
    }
  }

  public left(): void {
    this.currentMovementDirection = "left";
  }

  public right(): void {
    this.currentMovementDirection = "right";
  }

  public walk(): void {
    this.changeElementStatusTo("walk");
  }

  public run(): void {
    this.changeElementStatusTo("run");
  }

  public shoot(): void {
    this.changeElementStatusTo("shoot");
  }

  public die(): void {
    this.changeElementStatusTo("die");
  }

  public idle(): void {
    this.changeElementStatusTo("idle");
  }

  public isShooting(): boolean {
    return this.elementMovementStatus === "shoot";
  }

  public isDead(): boolean {
    return this.elementMovementStatus === "die" && this.currentHealth <= 0;
  }

  public getHealth(): number {
    return this.health;
  }

  public reset(): void {
    this.currentHealth = PLAYER_MAX_HEALTH;
    this.currentCanvasCoordinates = STARTING_PLAYER_CANVAS_COORDINATES;

    this.changeElementStatusTo("idle");
  }
}
