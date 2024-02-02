"use client";

import useGame from "@/lib/hooks/useGame";
import { ReactElement, useRef } from "react";

export default function GameCanvas(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGame(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      width={"1000px"}
      height={"500px"}
    >{`The HTML <canvas> element does not work on your browser`}</canvas>
  );
}
