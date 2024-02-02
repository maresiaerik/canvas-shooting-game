import { ImageAssets } from "@/lib/hooks/useGameAssets";
import { UserKeyboardInputKeysDown } from "@/lib/hooks/useUserControls";
import Player, { STARTING_PLAYER_CANVAS_COORDINATES } from "../Elements/Player";
import ZombieHandler from "../Elements/Zombie/ZombieHandler";

type GameStatus = "playing" | "game-over" | "start";

export default class Game {
  private readonly context: CanvasRenderingContext2D;

  private readonly player: Player;

  private readonly zombieHandler: ZombieHandler;

  private readonly imageAssets: ImageAssets;

  private readonly userKeybordInputKeysDown: UserKeyboardInputKeysDown;

  private gameStatus: GameStatus = "start";

  constructor(
    context: CanvasRenderingContext2D,
    imageAssets: ImageAssets,
    userKeyboardInputKeysDown: UserKeyboardInputKeysDown,
  ) {
    this.context = context;
    this.imageAssets = imageAssets;
    this.userKeybordInputKeysDown = userKeyboardInputKeysDown;

    this.player = new Player(context, imageAssets!.player, STARTING_PLAYER_CANVAS_COORDINATES);
    this.zombieHandler = new ZombieHandler(context, imageAssets!.zombie, this.player);
  }

  private resetGameElements(): void {
    this.player.reset();
    this.zombieHandler.reset();
  }

  public resetGame(): void {
    this.resetGameElements();

    this.startGame();
  }

  public startGame(): void {
    this.gameStatus = "start";
    this.gameLoop();
  }

  private clearCanvas(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  }

  private drawBackground(): void {
    this.context.drawImage(
      this.imageAssets!.background,
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height,
    );
  }

  private drawPanel(): void {
    this.context.drawImage(this.imageAssets!.panel, 0, 0, 250, 100);

    this.context.fillStyle = "white";
    this.context.font = "18px Courier New";
    this.context.textBaseline = "top";
    this.context.textAlign = "left";
    this.context.fillText(`Zombies Killed ${this.getNoOfZombiesKilled()}`, 30, 35);
    this.context.fillText(`Health ${this.getPlayerHealth()}`, 30, 60);
  }

  private addTextToCanvasCenter(textString: string): void {
    this.context.fillStyle = "white";
    this.context.font = "30px Courier New";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    this.context.fillText(
      textString,
      this.context.canvas.width / 2,
      this.context.canvas.height / 2,
    );
  }

  private gameLoop = (): void => {
    this.clearCanvas();

    this.drawBackground();
    this.drawPanel();

    if (this.gameStatus === "start") {
      this.addTextToCanvasCenter("Press Enter to start");

      if (this.userKeybordInputKeysDown.Enter) {
        this.gameStatus = "playing";
      }
    } else {
      if (this.gameStatus === "game-over") {
        this.addTextToCanvasCenter("Game over. Press Enter to restart");

        if (this.userKeybordInputKeysDown.Enter) {
          this.resetGame();
        }
      } else if (!this.player.isDead()) {
        if (this.userKeybordInputKeysDown.ArrowLeft) {
          this.player.left();
        } else if (this.userKeybordInputKeysDown.ArrowRight) {
          this.player.right();
        }

        if (this.userKeybordInputKeysDown[" "]) {
          this.player.shoot();
        } else if (
          this.userKeybordInputKeysDown.ArrowLeft ||
          this.userKeybordInputKeysDown.ArrowRight
        ) {
          if (this.userKeybordInputKeysDown.Shift) {
            this.player.run();
          } else {
            this.player.walk();
          }
        } else {
          this.player.idle();
        }
      }

      if (this.player.isDead()) {
        this.gameStatus = "game-over";
      }

      this.player.update();

      this.zombieHandler.updateZombies();
    }

    requestAnimationFrame(this.gameLoop);
  };

  public getNoOfZombiesKilled(): number {
    return this.zombieHandler.currentNoOfZombiesKilled;
  }

  public getPlayerHealth(): number {
    return this.player.getHealth();
  }
}
