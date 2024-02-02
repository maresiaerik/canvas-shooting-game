export type CanvasCoordinates = {
  x: number;
  y: number;
};

export type MovementDirection = "right" | "left";

type DimensionsInPx = {
  width: number;
  height: number;
};

export type ElementMovementStatus<T> = T extends string ? T : never;

type MovementFrameSizes<T> = Record<ElementMovementStatus<T>, number>;

export default abstract class MovingCanvasElement<DerivedElementMovementStatus> {
  protected abstract readonly elementDimensionsOnCanvas: DimensionsInPx;

  protected abstract readonly elementDimensionsOnSprite: DimensionsInPx;

  protected abstract readonly animationFramesBeforeUpdate: number;

  protected abstract elementMovementStatus: ElementMovementStatus<DerivedElementMovementStatus>;

  protected abstract readonly movementFrameSizes: MovementFrameSizes<
    ElementMovementStatus<DerivedElementMovementStatus>
  >;

  protected abstract readonly spriteRowIdxForMovement: Record<
    ElementMovementStatus<DerivedElementMovementStatus>,
    number
  >;

  protected abstract movementDirection: MovementDirection;

  protected abstract health: number;

  protected currentAnimationFrameIdx = 0;

  protected animationFrame: number = 0;

  protected canvasCoordinates: CanvasCoordinates;

  protected readonly context: CanvasRenderingContext2D;

  private readonly sprite: HTMLImageElement;

  constructor(
    context: CanvasRenderingContext2D,
    sprite: HTMLImageElement,
    canvasCoordinates: CanvasCoordinates,
  ) {
    this.context = context;
    this.sprite = sprite;
    this.canvasCoordinates = canvasCoordinates;
  }

  protected abstract updateFrames(): void;

  protected draw(): void {
    if (this.movementDirection === "right") {
      this.drawElement();
    } else {
      this.context.save();
      this.context.setTransform(
        -1,
        0,
        0,
        1,
        this.canvasCoordinates.x * 2 + this.elementDimensionsOnSprite.width,
        0,
      );
      this.drawElement();

      this.context.restore();
    }
  }

  protected setSpriteAnimationFrameCoordinatesForMovement(): void {
    this.currentAnimationFrameIdx =
      this.currentAnimationFrameIdx >= this.movementFrameSizes[this.elementMovementStatus] - 1
        ? 0
        : this.currentAnimationFrameIdx + 1;
  }

  protected changeElementStatusTo(
    status: ElementMovementStatus<DerivedElementMovementStatus>,
  ): void {
    if (this.elementMovementStatus !== status) {
      this.currentAnimationFrameIdx = 0;
    }

    this.elementMovementStatus = status;
  }

  private getCurrentFrameCoordinatesInSprite(): { frameX: number; frameY: number } {
    const frameX = this.elementDimensionsOnSprite.width * this.currentAnimationFrameIdx;
    const frameY =
      this.elementDimensionsOnSprite.height *
      this.spriteRowIdxForMovement[this.elementMovementStatus];

    return { frameX, frameY };
  }

  private drawElement(): void {
    const { frameX, frameY } = this.getCurrentFrameCoordinatesInSprite();

    this.context.drawImage(
      this.sprite,
      frameX,
      frameY,
      this.elementDimensionsOnSprite.width,
      this.elementDimensionsOnSprite.height,
      this.canvasCoordinates.x,
      this.canvasCoordinates.y,
      this.elementDimensionsOnCanvas.width,
      this.elementDimensionsOnCanvas.height,
    );
  }

  public update(): void {
    this.animationFrame += 1;

    if (this.animationFrame >= this.animationFramesBeforeUpdate) {
      this.animationFrame = 0;

      this.updateFrames();
    }

    this.draw();
  }

  public get currentCanvasCoordinates(): CanvasCoordinates {
    return this.canvasCoordinates;
  }

  public set currentCanvasCoordinates(coordinates: CanvasCoordinates) {
    this.canvasCoordinates = coordinates;
  }

  public get currentHealth(): number {
    return this.health;
  }

  public set currentHealth(health: number) {
    this.health = health;
  }

  public get currentMovementDirection(): MovementDirection {
    return this.movementDirection;
  }

  public set currentMovementDirection(direction: MovementDirection) {
    this.movementDirection = direction;
  }
}
