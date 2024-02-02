import { euclideanDistanceBetweenTwoCoordinates } from "@/lib/utils/canvas/maths";

import MovingCanvasElement, {
  CanvasCoordinates,
  MovementDirection,
} from "../abstract/MovingCanvasElement";
import Player from "../Player";

export type ZombieStatus = "die" | "attack" | "walk" | "hurt" | "run" | "bite" | "idle";

const DEFAULT_ANIMATION_FRAMES_BEFORE_UPDATE = 9;

const ZOMBIE_MAX_HEALTH = 10;

const MOVEMENT_RUN_IN_PX = 15;

const MOVEMENT_WALK_IN_PX = 5;

const PLAYER_HEALTH_DECREASE_ON_BITE = 10;

const ZOMBIE_HEALTH_DECREASE_ON_SHOT = 3;

export default class Zombie extends MovingCanvasElement<ZombieStatus> {
  protected elementDimensionsOnCanvas = {
    width: 120,
    height: 120,
  };

  protected elementDimensionsOnSprite = {
    width: 97,
    height: 97,
  };

  protected movementFrameSizes = {
    idle: 8,
    attack: 5,
    die: 5,
    walk: 8,
    run: 7,
    hurt: 3,
    bite: 11,
  };

  protected animationFramesBeforeUpdate = DEFAULT_ANIMATION_FRAMES_BEFORE_UPDATE;

  protected elementMovementStatus: ZombieStatus = "walk";

  protected initialElementMovementStatus: ZombieStatus = "walk";

  protected spriteRowIdxForMovement = {
    idle: 0,
    die: 9,
    walk: 1,
    run: 2,
    attack: 4,
    hurt: 8,
    bite: 3,
  };

  protected movementDirection: MovementDirection = "left";

  protected health = ZOMBIE_MAX_HEALTH;

  private readonly id: number = Math.floor(Math.random() * 1000 + Date.now());

  private player: Player;

  private isBeingShot = false;

  constructor(
    context: CanvasRenderingContext2D,
    sprite: HTMLImageElement,
    canvasCoordinates: CanvasCoordinates,
    player: Player,
    movementStatus: ZombieStatus = "walk",
  ) {
    super(context, sprite, canvasCoordinates);

    this.elementMovementStatus = movementStatus;
    this.initialElementMovementStatus = movementStatus;

    this.player = player;
  }

  get isBeingShotAt(): boolean {
    return this.isBeingShot;
  }

  set isBeingShotAt(isBeingShot: boolean) {
    this.isBeingShot = isBeingShot;
  }

  protected updateFrames(): void {
    if (this.player.isDead()) {
      this.changeElementStatusTo("idle");
    }

    if (this.elementMovementStatus === "die") {
      if (this.currentAnimationFrameIdx < this.movementFrameSizes.die - 1) {
        this.currentAnimationFrameIdx += 1;
      }
    } else {
      this.setSpriteAnimationFrameCoordinatesForMovement();

      if (this.elementMovementStatus === "idle") {
        return;
      }

      this.currentMovementDirection =
        this.canvasCoordinates.x > this.player.currentCanvasCoordinates.x ? "left" : "right";

      if (this.isBeingShotAt) {
        this.currentHealth -= ZOMBIE_HEALTH_DECREASE_ON_SHOT;

        if (this.currentHealth <= 0) {
          this.changeElementStatusTo("die");
        } else {
          this.changeElementStatusTo("hurt");
        }
      } else {
        if (this.elementMovementStatus === "walk") {
          this.canvasCoordinates.x +=
            this.currentMovementDirection === "left" ? -MOVEMENT_WALK_IN_PX : MOVEMENT_WALK_IN_PX;
        } else if (this.elementMovementStatus === "run") {
          this.canvasCoordinates.x +=
            this.currentMovementDirection === "left" ? -MOVEMENT_RUN_IN_PX : MOVEMENT_RUN_IN_PX;
        }

        if (this.isPlayerInBitingRange()) {
          this.changeElementStatusTo("bite");

          if (this.currentAnimationFrameIdx === this.movementFrameSizes.bite - 1) {
            this.player.currentHealth -= PLAYER_HEALTH_DECREASE_ON_BITE;
          }
        } else {
          this.changeElementStatusTo(this.initialElementMovementStatus);
        }
      }
    }
  }

  private isPlayerInBitingRange(): boolean {
    const distanceFromPlayer = euclideanDistanceBetweenTwoCoordinates(
      this.canvasCoordinates.x,
      this.player.currentCanvasCoordinates.x,
    );

    return (
      (this.currentMovementDirection === "left" &&
        this.player.currentMovementDirection === "right" &&
        distanceFromPlayer <= 65) ||
      (this.currentMovementDirection === "right" &&
        this.player.currentMovementDirection === "left" &&
        distanceFromPlayer <= 35) ||
      (this.currentMovementDirection === "left" &&
        this.player.currentMovementDirection === "left" &&
        distanceFromPlayer <= 50) ||
      (this.currentMovementDirection === "right" &&
        this.player.currentMovementDirection === "right" &&
        distanceFromPlayer <= 20)
    );
  }

  public isDead(): boolean {
    return this.elementMovementStatus === "die" && this.currentHealth <= 0;
  }

  public get zombieId(): number {
    return this.id;
  }
}
