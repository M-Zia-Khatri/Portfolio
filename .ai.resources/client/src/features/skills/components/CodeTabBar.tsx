import gsap from 'gsap';
import { memo, useLayoutEffect, useRef } from 'react';
import type { Skill } from '../types';

interface CodeTabBarProps {
  skill: Skill;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTabClose: (skill: Skill) => void;
}

const TAB_PADDING_PX = 12;

const CodeTabBar = memo(({ skill, openTabs, onTabClick, onTabClose }: CodeTabBarProps) => {
  const tabBarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-tab-item]',
        { autoAlpha: 0, x: -8 },
        { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out' },
      );
    }, bar);
    return () => ctx.revert();
  }, [openTabs.map((t) => t.name).join('|')]);

  useLayoutEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeTab = bar.querySelector<HTMLElement>("[data-active='true']");
    if (!activeTab) return;

    const barRect = bar.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const overflowLeft = tabRect.left - barRect.left;
    const overflowRight = tabRect.right - barRect.right;

    if (overflowLeft < 0)
      bar.scrollTo({ left: bar.scrollLeft + overflowLeft - TAB_PADDING_PX, behavior: 'smooth' });
    if (overflowRight > 0)
      bar.scrollTo({ left: bar.scrollLeft + overflowRight + TAB_PADDING_PX, behavior: 'smooth' });
  }, [skill.name, openTabs.length]);

  return (
    <div
      className="flex shrink-0 items-stretch min-h-8.5"
      style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex shrink-0 items-center gap-[6px] px-3">
        {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c, i) => (
          <span
            key={i}
            className="inline-block h-[11px] w-[11px] rounded-full"
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="my-2 w-px shrink-0 bg-white/10" />
      <div ref={tabBarRef} className="tab-scrollbar flex min-w-0 flex-1 items-stretch">
        {openTabs.map((tab) => {
          const isActive = tab.name === skill.name;
          const TabIcon = tab.iconComponent;
          return (
            <div
              key={tab.name}
              data-tab-item
              data-active={isActive}
              onClick={() => onTabClick(tab)}
              className="group/tab relative flex shrink-0 cursor-pointer items-center gap-[7px] overflow-hidden px-3 py-[9px] text-[11px] leading-none select-none"
              style={{
                background: isActive ? `${tab.color}16` : 'transparent',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                color: isActive ? tab.color : 'rgba(255,255,255,0.38)',
              }}
            >
              {isActive && (
                <span
                  className="absolute right-0 bottom-0 left-0 h-[2px]"
                  style={{ background: tab.color }}
                />
              )}
              <span className="shrink-0">
                <TabIcon size={12} />
              </span>
              <span className="font-medium tracking-tight whitespace-nowrap">{tab.fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab);
                }}
                className="ml-0.5 h-[14px] w-[14px] shrink-0 cursor-pointer text-[10px]"
                style={{ color: tab.color }}
                aria-label={`Close ${tab.fileName}`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center px-4 text-[10px] tracking-widest text-white uppercase opacity-25">
        {skill.lang}
      </div>
    </div>
  );
});

export default CodeTabBar;
