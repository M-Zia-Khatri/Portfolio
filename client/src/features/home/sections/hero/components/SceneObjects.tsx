import type { RefObject } from "react";
import { SceneBackground } from "./SceneBackground";
import { SceneCamera } from "./SceneCamera";
import { SceneLights } from "./SceneLights";
import { SceneParticles } from "./SceneParticles";

type SVGWithCleanup = SVGSVGElement & { _cleanup?: () => void };

export function SceneObjects({ svgRef }: { svgRef: RefObject<SVGWithCleanup | null> }) {
  return (
    <>
      <SceneCamera />
      <SceneLights />
      <SceneParticles />
      <SceneBackground svgRef={svgRef} />
    </>
  );
}
