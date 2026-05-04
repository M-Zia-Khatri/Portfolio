import gsap from 'gsap';
import { useEffect, useRef } from 'react';

type SVGWithCleanup = SVGSVGElement & {
  _cleanup?: () => void;
};

export default function BgScene() {
  const svgRef = useRef<SVGWithCleanup | null>(null);
  const linesRef = useRef<SVGPathElement[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const smoothMouseRef = useRef({ x: -9999, y: -9999 });
  const rectCacheRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | null = null;

    const init = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!w || !h) {
        requestAnimationFrame(init);
        return;
      }

      sizeRef.current = { w, h };
      rectCacheRef.current = rect;

      while (svg.firstChild) svg.removeChild(svg.firstChild);
      linesRef.current = [];

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const count = Math.ceil(w / 10);
      const SEGMENTS = 160;

      const parts: string[] = new Array(SEGMENTS + 1);

      const yValues = new Float32Array(SEGMENTS + 1);
      for (let s = 0; s <= SEGMENTS; s++) {
        yValues[s] = (s / SEGMENTS) * h;
      }

      for (let i = 0; i < count; i++) {
        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path',
        ) as SVGPathElement;

        path.setAttribute('stroke', '#76c7eb');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('opacity', '0.5');
        path.setAttribute('fill', 'none');

        svg.appendChild(path);
        linesRef.current[i] = path;
      }

      const baseXValues = new Float32Array(count);
      for (let i = 0; i < count; i++) baseXValues[i] = i * 10.5;

      const amplitude = 20;
      const frequency = 0.2;
      const mouseRadius = 40;
      const mouseRadiusSq = mouseRadius ** 2;
      const carveStrength = 0.95;
      const pushDist = mouseRadius * carveStrength;
      const lerpFactor = 0.3;

      const state = { t: 0 };

      animation = gsap.to(state, {
        t: Math.PI * 2,
        duration: 6,
        repeat: -1,
        ease: 'none',
        onUpdate: () => {
          const lines = linesRef.current;
          const height = sizeRef.current.h;
          const t = state.t;

          // Smooth mouse
          smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * lerpFactor;
          smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * lerpFactor;

          const mx = smoothMouseRef.current.x;
          const my = smoothMouseRef.current.y;
          const isActive = mouseRef.current.x !== -9999;

          for (let i = 0; i < lines.length; i++) {
            const baseX = baseXValues[i] + Math.sin(t + i * frequency) * amplitude;

            const dx0 = baseX - mx;
            const lineNearMouse = isActive && Math.abs(dx0) < mouseRadius;

            if (!lineNearMouse) {
              parts[0] = `M${~~baseX} 0`;
              parts[1] = `L${~~baseX} ${~~height}`;
              lines[i].setAttribute('d', parts[0] + ' ' + parts[1]);
              continue;
            }

            for (let s = 0; s <= SEGMENTS; s++) {
              const y = yValues[s];
              let x = baseX;

              const dx = baseX - mx;
              const dy = y - my;
              const distSq = dx * dx + dy * dy;

              if (distSq < mouseRadiusSq) {
                const dist = Math.sqrt(distSq);
                const angle = Math.atan2(dy, dx);
                const blend = 1 - dist / mouseRadius;
                const smooth = blend * blend * (3 - 2 * blend);

                x = mx + Math.cos(angle) * (dist + (pushDist - dist) * smooth);
              }

              parts[s] = s === 0 ? `M${~~x} ${~~y}` : `L${~~x} ${~~y}`;
            }

            lines[i].setAttribute('d', parts.join(' '));
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
        mouseRef.current = { x: -9999, y: -9999 };
      };

      let resizeTimer: ReturnType<typeof setTimeout>;

      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          animation?.kill();
          init();
        }, 200);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('resize', handleResize);

      svg._cleanup = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleResize);
        animation?.kill();
      };
    };

    requestAnimationFrame(init);

    return () => {
      svgRef.current?._cleanup?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-dvh w-full">
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  );
}
