/**
 * Layout tuning for the hero SVG line field. Wider spacing + fewer deformation
 * segments on narrow viewports keeps frame cost predictable on low-end GPUs.
 *
 * `cssWidth` / `cssHeight` are layout pixels from `getBoundingClientRect()`
 * (already DPR-independent CSS pixel units).
 */

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
  return Math.max(6, Math.ceil(cssWidth / spacing));
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
