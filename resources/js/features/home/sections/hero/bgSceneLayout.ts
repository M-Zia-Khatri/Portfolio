/**
 * Layout tuning for the hero SVG line field. Wider spacing + fewer deformation
 * segments on narrow viewports keeps frame cost predictable on low-end GPUs.
 *
 * `cssWidth` / `cssHeight` are layout pixels from `getBoundingClientRect()`
 * (already DPR-independent CSS pixel units).
 */

/** Horizontal sine offset in BgScene — must stay in sync with wave `amplitude` there. */
export const HORIZONTAL_WAVE_AMPLITUDE_PX = 20;

/** Half stroke + anti-alias slop so extreme wave + mouse nudge still paints to the edge. */
const HORIZONTAL_EDGE_SLOP_PX = 4;

export function getLineSpacingPx(cssWidth: number): number {
  if (cssWidth < 480) {
    return 16;
  }
  if (cssWidth < 768) {
    return 14;
  }

  return 10.5;
}

export function getLineCount(cssWidth: number, spacing: number): number {
  /** Extra width so lines stay visually dense when the sine wave pulls columns past either edge. */
  const horizontalPad = HORIZONTAL_WAVE_AMPLITUDE_PX * 4 + HORIZONTAL_EDGE_SLOP_PX;

  return Math.max(8, Math.ceil((cssWidth + horizontalPad) / spacing));
}

export function getDeformationSegmentCount(cssWidth: number): number {
  if (cssWidth < 480) {
    return 48;
  }
  if (cssWidth < 768) {
    return 64;
  }
  if (cssWidth < 1024) {
    return 96;
  }

  return 160;
}
