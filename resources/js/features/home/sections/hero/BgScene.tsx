import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { bgSceneDebug } from './bgSceneDebug';
import { appendHeroLineGradientDefs, applyHeroLineStrokeStyle } from './bgSceneGradient';
import { getDeformationSegmentCount, getLineCount, getLineSpacingPx, HORIZONTAL_WAVE_AMPLITUDE_PX } from './bgSceneLayout';

const RESIZE_DEBOUNCE_MS = 150;
const ZERO_SIZE_RAF_MAX = 120;

export default function BgScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const linesRef = useRef<SVGPathElement[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const smoothMouseRef = useRef({ x: -9999, y: -9999 });
  const rectCacheRef = useRef<DOMRect | null>(null);
  const teardownRef = useRef<(() => void) | null>(null);
  const mountTimeRef = useRef(0);

  useLayoutEffect(() => {
    mountTimeRef.current = performance.now();
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) {
      return;
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let zeroRafAttempts = 0;
    let zeroRafId: number | null = null;
    let scrollRafId: number | null = null;

    const clearDebounce = (): void => {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    };

    const cancelZeroRaf = (): void => {
      if (zeroRafId !== null) {
        cancelAnimationFrame(zeroRafId);
        zeroRafId = null;
      }
    };

    const fullTeardown = (): void => {
      teardownRef.current?.();
      teardownRef.current = null;
      linesRef.current = [];
    };

    const refreshRectCache = (): void => {
      rectCacheRef.current = svg.getBoundingClientRect();
    };

    const scheduleRectRefresh = (): void => {
      if (scrollRafId !== null) {
        return;
      }
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        refreshRectCache();
      });
    };

    const runSetup = (): void => {
      const rect = svg.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      bgSceneDebug('measure', {
        w,
        h,
        cssWidth: rect.width,
        cssHeight: rect.height,
        containerW: container.getBoundingClientRect().width,
        containerH: container.getBoundingClientRect().height,
        sinceMountMs: Math.round(performance.now() - mountTimeRef.current),
        dpr: window.devicePixelRatio,
      });

      if (w < 2 || h < 2) {
        cancelZeroRaf();
        if (zeroRafAttempts >= ZERO_SIZE_RAF_MAX) {
          bgSceneDebug('zero-size-abort', { attempts: zeroRafAttempts });

          return;
        }
        zeroRafAttempts += 1;
        zeroRafId = requestAnimationFrame(() => {
          zeroRafId = null;
          runSetup();
        });

        return;
      }

      zeroRafAttempts = 0;
      cancelZeroRaf();

      fullTeardown();

      sizeRef.current = { w, h };
      refreshRectCache();

      const spacing = getLineSpacingPx(w);
      const count = getLineCount(w, spacing);
      const SEGMENTS = getDeformationSegmentCount(w);

      bgSceneDebug('init-lines', { spacing, count, segments: SEGMENTS, lineTotalApprox: count * SEGMENTS });

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('preserveAspectRatio', 'none');

      appendHeroLineGradientDefs(svg, h);

      const parts: string[] = new Array(SEGMENTS + 1);
      const yValues = new Float32Array(SEGMENTS + 1);
      for (let s = 0; s <= SEGMENTS; s++) {
        yValues[s] = (s / SEGMENTS) * h;
      }

      for (let i = 0; i < count; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement;
        applyHeroLineStrokeStyle(path);
        svg.appendChild(path);
        linesRef.current[i] = path;
      }

      const baseXValues = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        baseXValues[i] = i * spacing - HORIZONTAL_WAVE_AMPLITUDE_PX;
      }

      const amplitude = HORIZONTAL_WAVE_AMPLITUDE_PX;
      const frequency = 0.2;
      const mouseRadius = 40;
      const mouseRadiusSq = mouseRadius ** 2;
      const carveStrength = 0.95;
      const pushDist = mouseRadius * carveStrength;
      const lerpFactor = 0.3;
      const state = { t: 0 };

      const ctx = gsap.context(() => {
        gsap.to(state, {
          t: Math.PI * 2,
          duration: 6,
          repeat: -1,
          ease: 'none',
          onUpdate: () => {
            const lines = linesRef.current;
            const height = sizeRef.current.h;
            const t = state.t;

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
      }, svg);

      const handlePointerMove = (e: PointerEvent): void => {
        const r = rectCacheRef.current;
        if (!r) {
          return;
        }
        mouseRef.current = {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
        };
      };

      const resetPointer = (): void => {
        mouseRef.current = { x: -9999, y: -9999 };
      };

      const handlePointerUp = (e: PointerEvent): void => {
        if (e.pointerType === 'touch') {
          resetPointer();
        }
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp, { passive: true });
      window.addEventListener('mouseleave', resetPointer);
      window.addEventListener('scroll', scheduleRectRefresh, { passive: true, capture: true });
      window.visualViewport?.addEventListener('resize', scheduleRectRefresh, { passive: true });
      window.visualViewport?.addEventListener('scroll', scheduleRectRefresh, { passive: true });

      teardownRef.current = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('mouseleave', resetPointer);
        window.removeEventListener('scroll', scheduleRectRefresh, { capture: true });
        window.visualViewport?.removeEventListener('resize', scheduleRectRefresh);
        window.visualViewport?.removeEventListener('scroll', scheduleRectRefresh);
        ctx.revert();
      };
    };

    const scheduleSetup = (immediate: boolean): void => {
      clearDebounce();
      cancelZeroRaf();
      if (immediate) {
        runSetup();

        return;
      }
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null;
        runSetup();
      }, RESIZE_DEBOUNCE_MS);
    };

    const ro = new ResizeObserver(() => {
      scheduleSetup(false);
    });
    ro.observe(container);

    scheduleSetup(true);

    return () => {
      clearDebounce();
      cancelZeroRaf();
      if (scrollRafId !== null) {
        cancelAnimationFrame(scrollRafId);
      }
      ro.disconnect();
      fullTeardown();
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0 h-full max-h-none min-h-0 w-full min-w-0">
      <svg ref={svgRef} className="block h-full w-full select-none" aria-hidden="true" focusable="false" />
    </div>
  );
}
