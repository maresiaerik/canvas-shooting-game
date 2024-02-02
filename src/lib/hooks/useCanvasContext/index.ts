/* eslint-disable no-param-reassign */
import { RefObject, useEffect, useState } from "react";

export default function useCanvasContext(
  canvasElementRef: RefObject<HTMLCanvasElement> | null,
): CanvasRenderingContext2D | null {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasElementRef !== null && canvasElementRef.current !== null) {
      canvasElementRef.current.style.border = "1px solid black";
      canvasElementRef.current.style.width = "100%";
      canvasElementRef.current.style.height = "100%";

      const ctx = canvasElementRef.current.getContext("2d");

      if (ctx !== null) {
        setContext(ctx);
      }
    }
  }, [canvasElementRef]);

  return context;
}
