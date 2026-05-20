import gsap from "gsap";
import { useEffect, useRef } from "react";
import { BG_SCENE_CONFIG, getResponsiveSceneConfig } from "./bgScene.config";

type SVGWithCleanup = SVGSVGElement & {
  _cleanup?: () => void;
};

export default function BgScene() {
  const svgRef = useRef<SVGWithCleanup | null>(null);
  const linesRef = useRef<SVGPathElement[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ ...BG_SCENE_CONFIG.runtime.inactiveMouse });
  const smoothMouseRef = useRef({ ...BG_SCENE_CONFIG.runtime.inactiveMouse });
  const rectCacheRef = useRef<DOMRect | null>(null);
  const prevTRef = useRef(0);
  const loopCountRef = useRef(0);

  useEffect(() => {
    let animation: gsap.core.Tween | null = null;
    let resizeTimer: ReturnType<typeof setTimeout>;
    let retryCount = 0;

    const init = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!w || !h) {
        if (retryCount < BG_SCENE_CONFIG.runtime.maxInitRetries) {
          retryCount += 1;
          setTimeout(() => requestAnimationFrame(init), BG_SCENE_CONFIG.runtime.initRetryDelayMs);
        }
        return;
      }

      retryCount = 0;

      sizeRef.current = { w, h };
      rectCacheRef.current = rect;

      while (svg.firstChild) svg.removeChild(svg.firstChild);
      linesRef.current = [];

      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      const scene = getResponsiveSceneConfig(w);
      const count =
        Math.ceil(w / scene.layout.lineSpacingDivisor) + scene.layout.horizontalOverscanLines;
      const SEGMENTS = scene.layout.segments;

      const defs = document.createElementNS(BG_SCENE_CONFIG.svg.namespace, "defs");
      const gradient = document.createElementNS(BG_SCENE_CONFIG.svg.namespace, "linearGradient");
      gradient.setAttribute("id", BG_SCENE_CONFIG.svg.gradient.id);
      gradient.setAttribute("x1", BG_SCENE_CONFIG.svg.gradient.x1);
      gradient.setAttribute("y1", BG_SCENE_CONFIG.svg.gradient.y1);
      gradient.setAttribute("x2", BG_SCENE_CONFIG.svg.gradient.x2);
      gradient.setAttribute("y2", BG_SCENE_CONFIG.svg.gradient.y2);

      BG_SCENE_CONFIG.svg.gradient.stops.forEach((stopConfig) => {
        const stop = document.createElementNS(BG_SCENE_CONFIG.svg.namespace, "stop");
        stop.setAttribute("offset", stopConfig.offset);
        stop.setAttribute("stop-color", stopConfig.color);
        stop.setAttribute("stop-opacity", stopConfig.opacity);
        gradient.appendChild(stop);
      });
      defs.appendChild(gradient);
      svg.appendChild(defs);

      const parts: string[] = new Array(SEGMENTS + 1);

      const yValues = new Float32Array(SEGMENTS + 1);
      for (let s = 0; s <= SEGMENTS; s++) {
        yValues[s] = (s / SEGMENTS) * h;
      }

      for (let i = 0; i < count; i++) {
        const path = document.createElementNS(
          BG_SCENE_CONFIG.svg.namespace,
          "path",
        ) as SVGPathElement;

        path.setAttribute("stroke", `url(#${BG_SCENE_CONFIG.svg.gradient.id})`);
        path.setAttribute("stroke-width", scene.stroke.strokeWidth);
        path.setAttribute("opacity", scene.stroke.opacity);
        path.setAttribute("fill", BG_SCENE_CONFIG.svg.line.fill);

        svg.appendChild(path);
        linesRef.current[i] = path;
      }

      const baseXValues = new Float32Array(count);
      const linePhasePrimary = new Float32Array(count);
      const linePhaseSecondary = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const halfOverscan = scene.layout.horizontalOverscanLines / 2;
        baseXValues[i] = (i - halfOverscan) * scene.layout.baseXStep;
        linePhasePrimary[i] = i * scene.wave.linePhasePrimaryMultiplier;
        linePhaseSecondary[i] = i * scene.wave.linePhaseSecondaryMultiplier;
      }

      const driftAmplitude = scene.wave.driftAmplitude;
      const driftFrequency = scene.wave.driftFrequency;
      const waveAmpPrimary = scene.wave.primary.amplitude;
      const waveAmpSecondary = scene.wave.secondary.amplitude;
      const waveFreqPrimary = scene.wave.primary.frequency;
      const waveFreqSecondary = scene.wave.secondary.frequency;
      const waveSpeedPrimary = scene.wave.primary.speed;
      const waveSpeedSecondary = scene.wave.secondary.speed;
      const mouseRadius = scene.interaction.mouseRadius;
      const mouseRadiusSq = mouseRadius ** 2;
      const carveStrength = scene.interaction.carveStrength;
      const pushDist = mouseRadius * carveStrength;
      const lerpFactor = scene.interaction.lerpFactor;

      const state = { t: 0 };
      prevTRef.current = 0;
      loopCountRef.current = 0;

      animation = gsap.to(state, {
        t: BG_SCENE_CONFIG.animation.cycleRadians,
        duration: BG_SCENE_CONFIG.animation.durationSeconds,
        repeat: BG_SCENE_CONFIG.animation.repeat,
        ease: "none",
        onUpdate: () => {
          const lines = linesRef.current;
          const rawT = state.t;
          if (rawT < prevTRef.current) loopCountRef.current += 1;
          prevTRef.current = rawT;

          const t = rawT + loopCountRef.current * BG_SCENE_CONFIG.animation.cycleRadians;

          // Smooth mouse
          smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * lerpFactor;
          smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * lerpFactor;

          const mx = smoothMouseRef.current.x;
          const my = smoothMouseRef.current.y;
          const isActive = mouseRef.current.x !== BG_SCENE_CONFIG.runtime.inactiveMouse.x;

          for (let i = 0; i < lines.length; i++) {
            const baseX = baseXValues[i] + Math.sin(t + i * driftFrequency) * driftAmplitude;
            const phasePrimary = linePhasePrimary[i];
            const phaseSecondary = linePhaseSecondary[i];

            for (let s = 0; s <= SEGMENTS; s++) {
              const y = yValues[s];
              const flowPrimary = Math.sin(
                y * waveFreqPrimary + t * waveSpeedPrimary + phasePrimary,
              );
              const flowSecondary = Math.sin(
                y * waveFreqSecondary - t * waveSpeedSecondary + phaseSecondary,
              );
              let x = baseX + flowPrimary * waveAmpPrimary + flowSecondary * waveAmpSecondary;

              if (isActive) {
                const dx = x - mx;
                const dy = y - my;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouseRadiusSq) {
                  const dist = Math.sqrt(distSq);
                  const angle = Math.atan2(dy, dx);
                  const blend = 1 - dist / mouseRadius;
                  const smooth = blend * blend * (3 - 2 * blend);

                  x = mx + Math.cos(angle) * (dist + (pushDist - dist) * smooth);
                }
              }

              parts[s] = s === 0 ? `M${~~x} ${~~y}` : `L${~~x} ${~~y}`;
            }

            lines[i].setAttribute("d", parts.join(" "));
          }
        },
      });

      const handleMouseMove = (e: MouseEvent) => {
        const r = rectCacheRef.current;
        if (!r) return;

        mouseRef.current = {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
        };
      };

      const handleMouseLeave = () => {
        mouseRef.current = { ...BG_SCENE_CONFIG.runtime.inactiveMouse };
      };

      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          animation?.kill();
          init();
        }, BG_SCENE_CONFIG.runtime.resizeDebounceMs);
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (e.pointerType === "mouse") handleMouseMove(e as unknown as MouseEvent);
        else {
          const r = rectCacheRef.current;
          if (!r) return;
          mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        const r = rectCacheRef.current;
        if (!r || e.touches.length === 0) return;
        const touch = e.touches[0];
        mouseRef.current = { x: touch.clientX - r.left, y: touch.clientY - r.top };
      };

      const handleTouchEnd = () => {
        mouseRef.current = { ...BG_SCENE_CONFIG.runtime.inactiveMouse };
      };

      const handleOrientationChange = () => handleResize();

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleOrientationChange);
      window.visualViewport?.addEventListener("resize", handleResize);

      svg._cleanup = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleOrientationChange);
        window.visualViewport?.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimer);
        animation?.kill();
      };
    };

    requestAnimationFrame(init);

    return () => {
      svgRef.current?._cleanup?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-full min-h-full w-full">
      <svg ref={svgRef} className="h-full w-full" preserveAspectRatio="none" />
    </div>
  );
}
