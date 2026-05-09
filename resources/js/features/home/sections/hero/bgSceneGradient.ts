/** Matches `d="..."` setAttribute on paths — stable fragment id for stroke references. */
export const HERO_LINE_GRADIENT_ID = 'bgSceneLineGradient';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Single vertical gradient in user space (same coords as viewBox): luminous top,
 * imperceptible fade in the bottom 10%. Rebuilt only on resize — never per GSAP frame.
 *
 * `gradientUnits="userSpaceOnUse"` keeps the fade locked to the hero viewport (not each
 * path's animated bounding box), so deformation does not shear or swim the gradient.
 */

function lightenHex(hex: string, factor: number): string {
  const normalized = hex.replace('#', '');

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const mix = (channel: number) => Math.round(channel + (255 - channel) * factor);

  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function appendHeroLineGradientDefs(svg: SVGSVGElement, height: number): void {
  const defs = document.createElementNS(SVG_NS, 'defs');
  const grad = document.createElementNS(SVG_NS, 'linearGradient');

  grad.setAttribute('id', HERO_LINE_GRADIENT_ID);
  grad.setAttribute('gradientUnits', 'userSpaceOnUse');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', String(height));
  grad.setAttribute('color-interpolation', 'sRGB');
  grad.setAttribute('spreadMethod', 'pad');

  const top = '#76c7eb';
  const toe = lightenHex(top, 0.72);

  const stops: { offset: string; color: string; opacity: string }[] = [
    { offset: '0%', color: top, opacity: '0.5' },
    { offset: '78%', color: top, opacity: '0.5' },
    { offset: '85%', color: top, opacity: '0.5' },
    { offset: '89%', color: top, opacity: '0.5' },
    { offset: '90%', color: top, opacity: '0.5' },
    { offset: '91%', color: top, opacity: '0.48' },
    { offset: '92.5%', color: top, opacity: '0.42' },
    { offset: '94%', color: top, opacity: '0.32' },
    { offset: '95.5%', color: top, opacity: '0.22' },
    { offset: '97%', color: toe, opacity: '0.12' },
    { offset: '98.25%', color: toe, opacity: '0.06' },
    { offset: '99.25%', color: toe, opacity: '0.02' },
    { offset: '100%', color: toe, opacity: '0' },
  ];

  for (const s of stops) {
    const stop = document.createElementNS(SVG_NS, 'stop');
    stop.setAttribute('offset', s.offset);
    stop.setAttribute('stop-color', s.color);
    stop.setAttribute('stop-opacity', s.opacity);
    grad.appendChild(stop);
  }

  defs.appendChild(grad);
  svg.insertBefore(defs, svg.firstChild);
}

/**
 * Fallback stroke if a browser mishandles paint servers (rare). Keeps lines visible.
 */
export function applyHeroLineStrokeStyle(path: SVGPathElement): void {
  path.setAttribute('stroke', `url(#${HERO_LINE_GRADIENT_ID})`);
  path.setAttribute('stroke-width', '1');
  path.setAttribute('fill', 'none');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('shape-rendering', 'geometricPrecision');
}
