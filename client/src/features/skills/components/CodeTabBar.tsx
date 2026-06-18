import gsap from "gsap";
import { memo, useEffect, useLayoutEffect, useRef } from "react";
import type { Skill } from "../types";

interface CodeTabBarProps {
  skill: Skill;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTabClose: (skill: Skill) => void;
}

const TAB_PADDING_PX = 12;

const CodeTabBar = memo(({ skill, openTabs, onTabClick, onTabClose }: CodeTabBarProps) => {
  const tabBarRef = useRef<HTMLDivElement>(null);

  const tabSignature = openTabs.map((tab) => tab.name).join("|");

  useLayoutEffect(() => {
    void tabSignature;
    const bar = tabBarRef.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-tab-item]",
        { autoAlpha: 0, x: -8 },
        { autoAlpha: 1, x: 0, duration: 0.2, stagger: 0.03, ease: "power2.out" },
      );
    }, bar);
    return () => ctx.revert();
  }, [tabSignature]);

  useEffect(() => {
    void tabSignature;
    void skill.name;
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeTab = bar.querySelector<HTMLElement>("[data-active='true']");
    if (!activeTab) return;

    const barRect = bar.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const overflowLeft = tabRect.left - barRect.left;
    const overflowRight = tabRect.right - barRect.right;

    if (overflowLeft < 0) {
      bar.scrollTo({ left: bar.scrollLeft + overflowLeft - TAB_PADDING_PX, behavior: "smooth" });
    } else if (overflowRight > 0) {
      bar.scrollTo({ left: bar.scrollLeft + overflowRight + TAB_PADDING_PX, behavior: "smooth" });
    }
  }, [skill.name, tabSignature]);

  return (
    <div
      className="flex min-h-8.5 shrink-0 items-stretch"
      style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex shrink-0 items-center gap-[6px] px-3" aria-hidden="true">
        {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c) => (
          <span
            key={c}
            className="inline-block h-[11px] w-[11px] rounded-full"
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="my-2 w-px shrink-0 bg-white/10" />
      <div
        ref={tabBarRef}
        className="tab-scrollbar flex min-w-0 flex-1 items-stretch"
        role="tablist"
        aria-label="Open skill files"
        data-lenis-prevent
      >
        {openTabs.map((tab) => {
          const isActive = tab.name === skill.name;
          const TabIcon = tab.iconComponent;
          return (
            <div
              key={tab.name}
              data-tab-item
              data-active={isActive}
              className="group/tab relative flex shrink-0 items-center overflow-hidden"
              style={{
                // Mixes the tab color with transparent to create a 15% opacity background
                background: isActive
                  ? `color-mix(in srgb, ${tab.color} 15%, transparent)`
                  : "transparent",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                // Both active and inactive states now reference tab.color or fallback opacity
                color: isActive ? tab.color : "rgba(255,255,255,0.6)",
              }}
              role="presentation"
            >
              {isActive && (
                <span
                  className="absolute right-0 bottom-0 left-0 h-[2px]"
                  style={{ background: tab.color }}
                />
              )}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabClick(tab)}
                className="flex cursor-pointer appearance-none items-center gap-[7px] border-0 bg-transparent px-3 py-[9px] text-[11px] leading-none select-none outline-none"
                // Sets the text color directly via inline styles to ensure it uses tab.color
                style={{ color: tab.color }}
              >
                <span className="shrink-0" aria-hidden="true">
                  {/* TabIcon inherits the parent text color naturally */}
                  <TabIcon size={12} />
                </span>
                <span className="font-medium tracking-tight whitespace-nowrap">{tab.fileName}</span>
              </button>
              <button
                type="button"
                onClick={() => onTabClose(tab)}
                className="mr-2 h-5 w-5 shrink-0 appearance-none rounded border-0 bg-transparent text-[10px] outline-none"
                style={{ color: tab.color }}
                aria-label={`Close ${tab.fileName}`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <div className="hidden shrink-0 items-center px-4 text-[10px] tracking-widest text-white uppercase opacity-45 sm:flex">
        {skill.lang}
      </div>
    </div>
  );
});

export default CodeTabBar;
