import { Button, Text } from "@radix-ui/themes";
import { useRef } from "react";
import { TEXT } from "@/shared/constants/style.constants";

export const MagneticShinyButton = () => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const element = ref.current;
    if (!element) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * 0.2;
      const deltaY = (e.clientY - centerY) * 0.3;

      const glow = Math.max(
        0.2,
        Math.min(0.4, 0.4 - Math.abs(deltaY) * 0.01),
      );

      element.style.setProperty("--magnetic-x", `${deltaX}px`);
      element.style.setProperty("--magnetic-y", `${deltaY}px`);
      element.style.setProperty("--glow-opacity", String(glow));
    });
  };

  const handlePointerLeave = () => {
    const element = ref.current;
    if (!element) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    element.style.setProperty("--magnetic-x", "0px");
    element.style.setProperty("--magnetic-y", "0px");
    element.style.setProperty("--glow-opacity", "0.4");
  };

  return (
    <Button asChild radius="full" color="gray" className="shrink-0">
      <a
        ref={ref}
        href="mailto:muhammadziakhatri@gmail.com"
        className="
          magnetic-shiny-button
          relative hidden
          items-center justify-center
          overflow-hidden
          px-5 py-2
          text-center
          md:inline-flex
        "
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Glow */}
        <span
          aria-hidden="true"
          className="
            magnetic-shiny-button__glow
            absolute inset-0 z-0
            rounded-full
            bg-[var(--blue-4)]
            blur-md
          "
        />

        {/* Shine */}
        <span
          aria-hidden="true"
          className="
            magnetic-shiny-button__shine
            pointer-events-none
            absolute left-0 top-0 z-20
            h-full w-[20%]
            bg-linear-to-r
            from-transparent
            via-(--blue-10)
            to-transparent
            opacity-60
            blur-sm
          "
        />

        {/* Text */}
        <span className="relative z-30 flex h-full w-full items-center justify-center text-center">
          <Text
            size={TEXT.lg.size}
            weight="bold"
            className="leading-none text-white"
          >
            Let&apos;s Talk
          </Text>
        </span>
      </a>
    </Button>
  );
};