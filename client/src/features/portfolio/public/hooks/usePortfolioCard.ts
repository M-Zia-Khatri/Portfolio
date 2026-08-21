import gsap from "gsap";
import { animate, useMotionValue, useTransform } from "motion/react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "@/features/analytics/tracking";
import type { PortfolioItem } from "../../types";
import { getPortfolioProjectId } from "../portfolio.utils";

export function usePortfolioCard(item: PortfolioItem) {
  const projectId = getPortfolioProjectId(item);
  const rotateY = useMotionValue(0);
  const isFlipped = useRef(false);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const gridBaseRef = useRef<HTMLDivElement>(null);
  const gridShineLeadRef = useRef<HTMLDivElement>(null);
  const gridShineTrailRef = useRef<HTMLDivElement>(null);
  const shineTlRef = useRef<gsap.core.Timeline | null>(null);
  const baseTweenRef = useRef<gsap.core.Tween | null>(null);
  const frontOpacity = useTransform(rotateY, [0, 89, 90, 91, 180], [1, 1, 0, 0, 0]);
  const backOpacity = useTransform(rotateY, [0, 89, 90, 91, 180], [0, 0, 0, 1, 1]);
  const frontTransform = useTransform(rotateY, (v) => `rotateY(${v}deg)`);
  const backTransform = useTransform(rotateY, (v) => `rotateY(${v + 180}deg)`);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const tiltY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  const imgX = useTransform(mouseX, [-0.5, 0.5], [10, -10]);
  const imgY = useTransform(mouseY, [-0.5, 0.5], [10, -10]);

  useEffect(() => {
    const base = gridBaseRef.current;
    const lead = gridShineLeadRef.current;
    const trail = gridShineTrailRef.current;
    if (!base || !lead || !trail) return;

    baseTweenRef.current = gsap.to(base, {
      opacity: 0.18,
      duration: 2.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    shineTlRef.current = gsap
      .timeline({ repeat: -1, repeatDelay: 3, paused: true })
      .fromTo(
        trail,
        { backgroundPosition: "-180% -180%", opacity: 0 },
        { backgroundPosition: "280% 280%", opacity: 1, duration: 3.6, ease: "none" },
        0,
      )
      .fromTo(
        lead,
        { backgroundPosition: "-150% -150%", opacity: 0 },
        { backgroundPosition: "250% 250%", opacity: 1, duration: 3, ease: "none" },
        0.25,
      )
      .to([lead, trail], { opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.5");

    return () => {
      shineTlRef.current?.kill();
      baseTweenRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (flipped) shineTlRef.current?.play(0);
    else shineTlRef.current?.pause();
  }, [flipped]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    animate(mouseX, 0, { type: "spring", stiffness: 180, damping: 22 });
    animate(mouseY, 0, { type: "spring", stiffness: 180, damping: 22 });
  }, [mouseX, mouseY]);

  const flip = useCallback(() => {
    const next = !isFlipped.current;
    isFlipped.current = next;
    setFlipped(next);
    animate(rotateY, next ? 180 : 0, { type: "spring", stiffness: 70, damping: 15 });
  }, [rotateY]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const key = `analytics-project-view:${projectId}`;
    const hasViewed = () => {
      if (typeof window === "undefined") return true;
      try {
        return window.sessionStorage.getItem(key) === "1";
      } catch {
        return true;
      }
    };

    if (hasViewed()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const observedEntry = entries.find((entry) => entry.isIntersecting);
        if (!observedEntry) return;

        try {
          window.sessionStorage.setItem(key, "1");
        } catch {
          // ignore storage failures, analytics should fail silently
        }

        analytics.track("project_view", { projectId });
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [projectId]);

  return {
    projectId,
    flipped,
    cardRef,
    gridBaseRef,
    gridShineLeadRef,
    gridShineTrailRef,
    frontOpacity,
    backOpacity,
    frontTransform,
    backTransform,
    tiltX,
    tiltY,
    imgX,
    imgY,
    handleMouseMove,
    handleMouseLeave,
    flip,
    onDemoClick: () => analytics.track("project_demo_click", { projectId }),
    onGithubClick: () => analytics.track("project_github_click", { projectId }),
  };
}
