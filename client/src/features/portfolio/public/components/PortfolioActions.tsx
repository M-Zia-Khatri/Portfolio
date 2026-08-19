import type { RefObject } from "react";

interface PortfolioActionsProps {
  gridBaseRef: RefObject<HTMLDivElement | null>;
  gridShineTrailRef: RefObject<HTMLDivElement | null>;
  gridShineLeadRef: RefObject<HTMLDivElement | null>;
}

export function PortfolioActions({
  gridBaseRef,
  gridShineTrailRef,
  gridShineLeadRef,
}: PortfolioActionsProps) {
  return (
    <>
      <div
        ref={gridBaseRef}
        className="absolute inset-0"
        style={{
          opacity: 0.08,
          backgroundImage:
            "linear-gradient(rgba(99,179,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        ref={gridShineTrailRef}
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 44%, rgba(96,165,250,0.25) 50%, transparent 56%)",
          backgroundSize: "350% 350%",
          backgroundPosition: "-180% -180%",
          maskImage:
            "linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)",
          WebkitMaskImage:
            "linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)",
          maskSize: "24px 24px",
          WebkitMaskSize: "24px 24px",
          willChange: "background-position, opacity",
        }}
      />
      <div
        ref={gridShineLeadRef}
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 48%, rgba(186,230,255,0.95) 50%, transparent 52%)",
          backgroundSize: "300% 300%",
          backgroundPosition: "-150% -150%",
          maskImage:
            "linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)",
          WebkitMaskImage:
            "linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)",
          maskSize: "24px 24px",
          WebkitMaskSize: "24px 24px",
          willChange: "background-position, opacity",
        }}
      />
    </>
  );
}
