import { useEffect, useRef } from "react";
import { analytics } from "@/features/analytics/tracking";

// Sections that should never fire analytics (e.g. "home" maps to hero which is always visible)
const TRACKED_SECTIONS = new Set([
  "home",
  "about",
  "experience",
  "skills",
  "portfolio",
  "testimonials",
  "game",
  "contact",
]);

// In-memory set of sections already tracked in this session.
// These reset on hard nav (page reload), which correctly creates a new session.
const viewedSections = new Set<string>();

/**
 * Attaches an IntersectionObserver at 50% threshold to the provided ref element.
 * Fires `section_view` at most once per page load for each section.
 */
export function useSectionTracking(
  sectionId: string,
  elementRef: React.RefObject<HTMLElement | null>,
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!TRACKED_SECTIONS.has(sectionId)) return;
    if (viewedSections.has(sectionId)) return; // already tracked this session

    const node = elementRef.current;
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        if (!viewedSections.has(sectionId)) {
          viewedSections.add(sectionId);
          analytics.track("section_view", { section: sectionId });
        }

        observerRef.current?.disconnect();
        observerRef.current = null;
      },
      { threshold: 0.5 }, // 50% visibility per spec §12
    );

    observerRef.current.observe(node);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [sectionId, elementRef]);
}
