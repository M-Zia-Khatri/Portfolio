import type { RefObject } from "react";

type SVGWithCleanup = SVGSVGElement & { _cleanup?: () => void };

export function SceneBackground({ svgRef }: { svgRef: RefObject<SVGWithCleanup | null> }) {
  return <svg ref={svgRef} className="h-full w-full" preserveAspectRatio="none" />;
}
