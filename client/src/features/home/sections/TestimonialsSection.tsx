import { useRef } from "react";
import { useSectionTracking } from "@/features/analytics/tracking/useSectionTracking";

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useSectionTracking("testimonials", sectionRef);

  return (
    <section ref={sectionRef}>
      <h2 className="text-3xl font-bold">Testimonials</h2>
      <p className="text-base-content/70 mt-4">
        Reliable, detail-oriented, and fast. A strong partner from planning through delivery.
      </p>
    </section>
  );
}
