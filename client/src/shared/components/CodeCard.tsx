import type { RefObject } from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CodeEmptyState from "@/features/skills/components/CodeEmptyState";
import CodeLine from "@/features/skills/components/CodeLine";
import CodeTabBar from "@/features/skills/components/CodeTabBar";
import TerminalView from "@/features/skills/components/TerminalView";
import type { Skill } from "@/features/skills/types";
import TabScrollbarStyle from "@/shared/components/TabScrollbarStyle";
import { useGsapTypingEffect as useGsapTimeline } from "@/shared/hooks/useGsapAnimations";

const ContentScrollbarStyle = memo(function ContentScrollbarStyle({ color }: { color: string }) {
  return (
    <style>{`.content-scrollbar::-webkit-scrollbar { width: 3px; } .content-scrollbar::-webkit-scrollbar-thumb { background: ${color}44; border-radius: 99px; } .content-scrollbar { scrollbar-width: thin; scrollbar-color: ${color}44 transparent; }`}</style>
  );
});

const CARD_STYLE = { transformStyle: "preserve-3d" } as const;

type CompletedCodeLine = { id: string; text: string };

export interface CodeCardHandle {
  pause: () => void;
  resume: () => void;
}

export interface CodeCardProps {
  skill: Skill;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTabClose: (skill: Skill) => void;
  onTypingComplete?: () => void;
  started?: boolean;
  isActive?: boolean;
  codeContainerRef?: RefObject<HTMLDivElement | null>;
}

const CodeCardBase = forwardRef<CodeCardHandle, CodeCardProps>(function CodeCard(
  {
    skill,
    openTabs,
    onTabClick,
    onTabClose,
    onTypingComplete,
    started = true,
    isActive = true,
    codeContainerRef,
  },
  ref,
) {
  const [completedLines, setCompletedLines] = useState<CompletedCodeLine[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    setCompletedLines([]);
    setCurrentLine("");
    setIsTyping(started && skill.mode === "code" && !reduceMotion);

    if (reduceMotion && skill.mode === "code") {
      setCompletedLines(skill.code.map((text, index) => ({ id: `${skill.name}-${index}`, text })));
      setIsTyping(false);
    }
  }, [reduceMotion, skill, started]);

  const setupTypingTimeline = useCallback(
    (timeline: gsap.core.Timeline) => {
      if (skill.mode !== "code" || !started || reduceMotion) return;

      skill.code.forEach((line, lineIdx) => {
        for (let ci = 1; ci <= line.length; ci++) {
          timeline.to(
            {},
            {
              duration: line[ci - 1] === " " ? 0.01 : 0.02,
              onStart: () => {
                if (ci === 1) setIsTyping(true);
              },
              onComplete: () => setCurrentLine(line.slice(0, ci)),
            },
          );
        }

        timeline.call(() => {
          setCompletedLines((prev) =>
            prev.length > lineIdx
              ? prev
              : [...prev, { id: `${skill.name}-${lineIdx}`, text: line }],
          );
          setCurrentLine("");
        });

        timeline.to({}, { duration: 0.05 });
      });

      timeline.call(() => {
        setIsTyping(false);
        onTypingComplete?.();
      });
    },
    [onTypingComplete, reduceMotion, skill, started],
  );

  const tlRef = useGsapTimeline(
    cardRef,
    [skill.name, started, reduceMotion],
    setupTypingTimeline,
    !isActive,
  );

  useImperativeHandle(
    ref,
    () => ({
      pause: () => tlRef.current?.pause(),
      resume: () => tlRef.current?.resume(),
    }),
    [tlRef],
  );

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  const isTerminal = skill.mode === "terminal";

  return (
    <>
      <TabScrollbarStyle color={skill.color} />
      <ContentScrollbarStyle color={skill.color} />
      <div ref={cardRef} className="relative" style={CARD_STYLE}>
        <div
          className="relative z-10 flex w-full flex-col overflow-hidden rounded-xl"
          style={{
            background: isTerminal ? "rgba(5, 10, 5, 0.97)" : "rgba(10, 14, 20, 0.95)",
            border: `1px solid ${skill.color}30`,
            minHeight: 300,
          }}
        >
          <CodeTabBar
            skill={skill}
            openTabs={openTabs}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
          />

          <div
            ref={contentRef}
            className="content-scrollbar flex-1 py-3"
            data-lenis-prevent
            style={{ height: 300, overflowY: "auto", overflowX: "auto" }}
          >
            {openTabs.length === 0 ? (
              <CodeEmptyState />
            ) : isTerminal ? (
              <TerminalView
                key={skill.name}
                skillName={skill.name}
                commands={skill.commands}
                color={skill.color}
                isActive={isActive}
              />
            ) : (
              <div ref={codeContainerRef} className="min-w-max pr-4">
                {completedLines.map((line, index) => (
                  <CodeLine
                    key={line.id}
                    line={line.text}
                    index={index}
                    isActiveLine={false}
                    color={skill.color}
                  />
                ))}

                {isTyping && (
                  <CodeLine
                    key={`${skill.name}-active`}
                    line={currentLine}
                    index={completedLines.length}
                    isActiveLine={true}
                    color={skill.color}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

CodeCardBase.displayName = "CodeCard";

export default memo(CodeCardBase);
