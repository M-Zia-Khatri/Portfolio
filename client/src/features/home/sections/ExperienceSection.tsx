import { useRef } from "react";
import { useSectionTracking } from "@/features/analytics/tracking/useSectionTracking";

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useSectionTracking("experience", sectionRef);

  return (
    <section ref={sectionRef}>
      <h2 className="text-3xl font-bold">Experience</h2>
      <p className="text-base-content/70 mt-4">
        5+ years delivering full-stack web projects, from initial concepts to production launches.
      </p>
    </section>
  );
}
