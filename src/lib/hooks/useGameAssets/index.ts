import { useEffect, useState } from "react";

type ImageNames = "background" | "zombie" | "player" | "panel";
type ImageAssetPaths = Record<ImageNames, string>;
export type ImageAssets = Record<ImageNames, HTMLImageElement> | undefined;

export default function useGameAssets(
  context: CanvasRenderingContext2D | null,
): ImageAssets | undefined {
  const [imageAssets, setImageAssets] = useState<ImageAssets>();

  useEffect(() => {
    if (context !== null && imageAssets === undefined) {
      const imageAssetPaths: ImageAssetPaths = {
        background: "/backgrounds/background.png",
        zombie: "/sprites/zombie.png",
        player: "/sprites/player.png",
        panel: "/gui/generic/panel.png",
      };

      const imageAssetsForGame = {} as ImageAssets;

      for (let i = 0; i < Object.keys(imageAssetPaths).length; i += 1) {
        const imageAssetName = Object.keys(imageAssetPaths)[i] as ImageNames;
        const imageAssetPath = Object.values(imageAssetPaths)[i];

        const imageAsset = new Image();
        imageAsset.src = imageAssetPath;

        imageAssetsForGame![imageAssetName] = imageAsset;

        imageAsset.onload = (): void => {
          if (i === Object.keys(imageAssetPaths).length - 1) {
            setImageAssets(imageAssetsForGame);
          }
        };
      }
    }
  }, [context, imageAssets]);

  return imageAssets;
}
