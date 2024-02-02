import Game from "@/lib/Canvas/Game";
import { RefObject, useEffect } from "react";
import useCanvasContext from "../useCanvasContext";
import useGameAssets from "../useGameAssets";
import useUserControls from "../useUserControls";

export default function useGame(canvasElementRef: RefObject<HTMLCanvasElement> | null): void {
  const context = useCanvasContext(canvasElementRef);

  const imageAssets = useGameAssets(context);

  const userKeyboardInputKeysDown = useUserControls();

  useEffect(() => {
    if (context && imageAssets !== undefined) {
      const game = new Game(context, imageAssets, userKeyboardInputKeysDown);

      game.startGame();
    }
  }, [context, imageAssets, userKeyboardInputKeysDown]);
}
