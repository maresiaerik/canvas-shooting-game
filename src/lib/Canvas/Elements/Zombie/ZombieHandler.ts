/* eslint-disable no-param-reassign */
import { euclideanDistanceBetweenTwoCoordinates } from "@/lib/utils/canvas/maths";

import Zombie, { ZombieStatus } from ".";
import { CanvasCoordinates } from "../../abstract/MovingCanvasElement";
import Player from "../Player";

const DEFAULT_ANIMATION_FRAMES_BEFORE_ADDING_ZOMBIE = 180;

const MIN_ANIMATION_FRAMES_BEFORE_ADDING_ZOMBIE = 60;

const CANVAS_COORDINATE_PADDING_FOR_ZOMBIE_TO_APPEAR = 100;

const SHOOTING_RANGE_IN_PX = 400;

export default class ZombieHandler {
  private readonly sprite: HTMLImageElement;

  private readonly context: CanvasRenderingContext2D;

  private animationsFramesBeforeAddingZombie: number =
    DEFAULT_ANIMATION_FRAMES_BEFORE_ADDING_ZOMBIE;

  private removedDeadZombieIds: { [zombieId: Zombie["zombieId"]]: Zombie["zombieId"] } = {};

  private readonly player: Player;

  private animationFrame: number = 0;

  private noOfZombiesKilled: number = 0;

  private zombies: Zombie[] = [];

  constructor(context: CanvasRenderingContext2D, sprite: HTMLImageElement, player: Player) {
    this.context = context;
    this.sprite = sprite;
    this.player = player;

    this.addZombie();
  }

  private addZombie(): void {
    const xCoordinatesOutsideCanvasForZombieToAppear = [
      this.context.canvas.getBoundingClientRect().right +
        CANVAS_COORDINATE_PADDING_FOR_ZOMBIE_TO_APPEAR,
      this.context.canvas.getBoundingClientRect().left -
        CANVAS_COORDINATE_PADDING_FOR_ZOMBIE_TO_APPEAR,
    ];

    const canvasCoordinates: CanvasCoordinates = {
      x: xCoordinatesOutsideCanvasForZombieToAppear[Math.floor(Math.random() * 2)],
      y: 230,
    };

    const movementStatusOptions: ZombieStatus[] = ["run", "walk"];

    let zombieMovementStatus: ZombieStatus = "walk";

    if (this.noOfZombiesKilled >= 10 && this.noOfZombiesKilled < 20) {
      zombieMovementStatus = movementStatusOptions[Math.floor(Math.random() * 2)];
    } else if (this.noOfZombiesKilled >= 20) {
      zombieMovementStatus = "run";
    }

    this.zombies.push(
      new Zombie(this.context, this.sprite, canvasCoordinates, this.player, zombieMovementStatus),
    );
  }

  private removeDeadZombies(): void {
    let wasZombiesKilled = false;

    this.zombies.forEach((zombie) => {
      if (zombie.isDead() && this.removedDeadZombieIds[zombie.zombieId] === undefined) {
        setTimeout((): void => {
          this.zombies = this.zombies.filter((z) => z.zombieId !== zombie.zombieId);

          delete this.removedDeadZombieIds[zombie.zombieId];
        }, 2000);

        wasZombiesKilled = true;

        this.removedDeadZombieIds[zombie.zombieId] = zombie.zombieId;
        this.noOfZombiesKilled += 1;
      }
    });

    if (wasZombiesKilled) {
      this.animationsFramesBeforeAddingZombie -= 5;

      if (this.animationsFramesBeforeAddingZombie < MIN_ANIMATION_FRAMES_BEFORE_ADDING_ZOMBIE) {
        this.animationsFramesBeforeAddingZombie = MIN_ANIMATION_FRAMES_BEFORE_ADDING_ZOMBIE;
      }
    }
  }

  public updateZombies(): void {
    this.animationFrame += 1;

    this.removeDeadZombies();

    if (this.animationFrame >= this.animationsFramesBeforeAddingZombie) {
      this.addZombie();

      this.animationFrame = 0;
    }

    const zombieIdxOfClosestZombieFacingPlayer = this.zombies.findIndex(
      (zombie): boolean =>
        !zombie.isDead() && this.isZombieFacingPlayer(zombie) && this.isZombieBeingShotAt(zombie),
    );

    this.zombies.forEach((zombie, zombieIdx): void => {
      zombie.isBeingShotAt = zombieIdx === zombieIdxOfClosestZombieFacingPlayer;

      zombie.update();
    });
  }

  private isZombieFacingPlayer(zombie: Zombie): boolean {
    return (
      (this.player.currentCanvasCoordinates.x > zombie.currentCanvasCoordinates.x &&
        this.player.currentMovementDirection === "left") ||
      (this.player.currentCanvasCoordinates.x < zombie.currentCanvasCoordinates.x &&
        this.player.currentMovementDirection === "right")
    );
  }

  private isZombieBeingShotAt(zombie: Zombie): boolean {
    const distanceFromPlayer = euclideanDistanceBetweenTwoCoordinates(
      zombie.currentCanvasCoordinates.x,
      this.player.currentCanvasCoordinates.x,
    );

    return (
      this.player.isShooting() &&
      distanceFromPlayer < SHOOTING_RANGE_IN_PX &&
      this.player.currentMovementDirection !== zombie.currentMovementDirection
    );
  }

  public get currentNoOfZombiesKilled(): number {
    return this.noOfZombiesKilled;
  }

  public reset(): void {
    this.zombies = [];
    this.noOfZombiesKilled = 0;
    this.removedDeadZombieIds = {};
    this.animationsFramesBeforeAddingZombie = DEFAULT_ANIMATION_FRAMES_BEFORE_ADDING_ZOMBIE;
  }
}
