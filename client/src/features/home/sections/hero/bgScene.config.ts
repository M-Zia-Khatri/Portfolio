export type SceneBreakpoint = "mobile" | "tablet" | "desktop";

type SceneWaveConfig = {
  driftAmplitude: number;
  driftFrequency: number;
  primary: { amplitude: number; frequency: number; speed: number };
  secondary: { amplitude: number; frequency: number; speed: number };
  linePhasePrimaryMultiplier: number;
  linePhaseSecondaryMultiplier: number;
};

type SceneLayoutConfig = {
  baseXStep: number;
  horizontalOverscanLines: number;
  lineSpacingDivisor: number;
  segments: number;
};

type SceneInteractionConfig = {
  mouseRadius: number;
  carveStrength: number;
  lerpFactor: number;
};

type SceneStrokeConfig = {
  strokeWidth: string;
  opacity: string;
};

export type BgSceneConfig = {
  animation: {
    cycleRadians: number;
    durationSeconds: number;
    repeat: number;
  };
  svg: {
    namespace: string;
    gradient: {
      id: string;
      x1: string;
      y1: string;
      x2: string;
      y2: string;
      stops: Array<{
        offset: string;
        color: string;
        opacity: string;
      }>;
    };
    line: {
      fill: string;
    };
  };
  runtime: {
    resizeDebounceMs: number;
    initRetryDelayMs: number;
    maxInitRetries: number;
    inactiveMouse: { x: number; y: number };
  };
  breakpoints: {
    mobileMaxWidth: number;
    tabletMaxWidth: number;
  };
  responsive: Record<
    SceneBreakpoint,
    {
      layout: SceneLayoutConfig;
      wave: SceneWaveConfig;
      interaction: SceneInteractionConfig;
      stroke: SceneStrokeConfig;
    }
  >;
};

export type ResolvedSceneConfig = {
  breakpoint: SceneBreakpoint;
  layout: SceneLayoutConfig;
  wave: SceneWaveConfig;
  interaction: SceneInteractionConfig;
  stroke: SceneStrokeConfig;
};

export const BG_SCENE_CONFIG: BgSceneConfig = {
  animation: {
    cycleRadians: Math.PI * 2,
    durationSeconds: 6,
    repeat: -1,
  },
  svg: {
    namespace: "http://www.w3.org/2000/svg",
    gradient: {
      id: "bg-line-stroke-gradient",
      x1: "0%",
      y1: "0%",
      x2: "0%",
      y2: "100%",
      stops: [
        { offset: "0%", color: "#76c7eb", opacity: "1" },
        { offset: "85%", color: "#76c7eb", opacity: "1" },
        { offset: "100%", color: "#76c7eb", opacity: "0" },
      ],
    },
    line: {
      fill: "none",
    },
  },
  runtime: {
    resizeDebounceMs: 200,
    initRetryDelayMs: 80,
    maxInitRetries: 40,
    inactiveMouse: { x: -9999, y: -9999 },
  },
  breakpoints: {
    mobileMaxWidth: 767,
    tabletMaxWidth: 1023,
  },
  responsive: {
    mobile: {
      layout: {
        baseXStep: 10,
        horizontalOverscanLines: 4,
        lineSpacingDivisor: 10,
        segments: 88,
      },
      wave: {
        driftAmplitude: 12,
        driftFrequency: 0.18,
        primary: { amplitude: 7.5, frequency: 0.02, speed: 1.1 },
        secondary: { amplitude: 4, frequency: 0.034, speed: 0.82 },
        linePhasePrimaryMultiplier: 0.31,
        linePhaseSecondaryMultiplier: 0.17,
      },
      interaction: {
        mouseRadius: 34,
        carveStrength: 0.92,
        lerpFactor: 0.24,
      },
      stroke: {
        strokeWidth: "0.9",
        opacity: "0.42",
      },
    },
    tablet: {
      layout: {
        baseXStep: 10.25,
        horizontalOverscanLines: 4,
        lineSpacingDivisor: 10,
        segments: 120,
      },
      wave: {
        driftAmplitude: 15,
        driftFrequency: 0.19,
        primary: { amplitude: 9.5, frequency: 0.021, speed: 1.2 },
        secondary: { amplitude: 5.25, frequency: 0.036, speed: 0.88 },
        linePhasePrimaryMultiplier: 0.31,
        linePhaseSecondaryMultiplier: 0.17,
      },
      interaction: {
        mouseRadius: 37,
        carveStrength: 0.94,
        lerpFactor: 0.27,
      },
      stroke: {
        strokeWidth: "1",
        opacity: "0.47",
      },
    },
    desktop: {
      layout: {
        baseXStep: 10.5,
        horizontalOverscanLines: 4,
        lineSpacingDivisor: 10,
        segments: 160,
      },
      wave: {
        driftAmplitude: 18,
        driftFrequency: 0.2,
        primary: { amplitude: 11, frequency: 0.022, speed: 1.35 },
        secondary: { amplitude: 6, frequency: 0.038, speed: 0.95 },
        linePhasePrimaryMultiplier: 0.31,
        linePhaseSecondaryMultiplier: 0.17,
      },
      interaction: {
        mouseRadius: 40,
        carveStrength: 0.95,
        lerpFactor: 0.3,
      },
      stroke: {
        strokeWidth: "1",
        opacity: "0.5",
      },
    },
  },
};

export function resolveSceneBreakpoint(width: number): SceneBreakpoint {
  if (width <= BG_SCENE_CONFIG.breakpoints.mobileMaxWidth) return "mobile";
  if (width <= BG_SCENE_CONFIG.breakpoints.tabletMaxWidth) return "tablet";
  return "desktop";
}

export function getResponsiveSceneConfig(width: number): ResolvedSceneConfig {
  const breakpoint = resolveSceneBreakpoint(width);
  const config = BG_SCENE_CONFIG.responsive[breakpoint];

  return {
    breakpoint,
    layout: config.layout,
    wave: config.wave,
    interaction: config.interaction,
    stroke: config.stroke,
  };
}
