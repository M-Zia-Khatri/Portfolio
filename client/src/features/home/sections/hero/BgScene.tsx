import { SceneObjects } from "./components/SceneObjects";
import { useBgScene } from "./hooks/useBgScene";

export default function BgScene() {
  const svgRef = useBgScene();

  return (
    <div className="absolute inset-0 z-0 h-full min-h-full w-full">
      <SceneObjects svgRef={svgRef} />
    </div>
  );
}
