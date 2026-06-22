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
import type {
  CodeTypingProgress,
  TerminalTypingProgress,
} from "@/features/skills/skillsProgress.storage";
import type { Skill } from "@/features/skills/types";
import TabScrollbarStyle from "@/shared/components/TabScrollbarStyle";
import { useGsapTypingEffect as useGsapTimeline } from "@/shared/hooks/useGsapAnimations";

const ContentScrollbarStyle = memo(function ContentScrollbarStyle({ color }: { color: string }) {
  return (
    <style>{`.content-scrollbar::-webkit-scrollbar { width: 3px; } .content-scrollbar::-webkit-scrollbar-thumb { background: ${color}44; border-radius: 99px; } .content-scrollbar { scrollbar-width: thin; scrollbar-color: ${color}44 transparent; }`}</style>
  );
});

const CARD_STYLE = { transformStyle: "preserve-3d" } as const;
const CONTENT_PANEL_STYLE = {
  height: 300,
  maxHeight: 300,
  overflowY: "auto",
  overflowX: "auto",
} as const;

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
  codeProgress?: CodeTypingProgress | null;
  terminalProgress?: TerminalTypingProgress | null;
  onCodeProgressChange?: (progress: CodeTypingProgress) => void;
  onTerminalProgressChange?: (progress: TerminalTypingProgress) => void;
  started?: boolean;
  isActive?: boolean;
  codeContainerRef?: RefObject<HTMLDivElement | null>;
}

function normalizeCodeCursor(skill: Skill, progress?: CodeTypingProgress | null) {
  if (skill.mode !== "code" || progress?.skillName !== skill.name) {
    return { lineIndex: 0, charIndex: 0, completed: false };
  }

  if (progress.completed) {
    return { lineIndex: skill.code.length, charIndex: 0, completed: true };
  }

  let lineIndex = Math.min(Math.max(progress.lineIndex, 0), skill.code.length);
  let charIndex = Math.max(progress.charIndex, 0);

  if (lineIndex >= skill.code.length) {
    return { lineIndex: skill.code.length, charIndex: 0, completed: true };
  }

  const lineLength = skill.code[lineIndex]?.length ?? 0;
  charIndex = Math.min(charIndex, lineLength);

  if (charIndex === lineLength && lineLength > 0) {
    lineIndex += 1;
    charIndex = 0;
  }

  return {
    lineIndex,
    charIndex,
    completed: lineIndex >= skill.code.length,
  };
}

const CodeCardBase = forwardRef<CodeCardHandle, CodeCardProps>(function CodeCard(
  {
    skill,
    openTabs,
    onTabClick,
    onTabClose,
    onTypingComplete,
    codeProgress,
    terminalProgress,
    onCodeProgressChange,
    onTerminalProgressChange,
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
    const cursor = normalizeCodeCursor(skill, codeProgress);

    setCompletedLines([]);
    setCurrentLine("");
    setIsTyping(
      started &&
        skill.mode === "code" &&
        !reduceMotion &&
        !cursor.completed &&
        cursor.lineIndex < skill.code.length,
    );

    if (skill.mode === "code" && cursor.lineIndex > 0) {
      setCompletedLines(
        skill.code
          .slice(0, cursor.lineIndex)
          .map((text, index) => ({ id: `${skill.name}-${index}`, text })),
      );
    }

    if (skill.mode === "code" && !cursor.completed && cursor.charIndex > 0) {
      setCurrentLine(skill.code[cursor.lineIndex]?.slice(0, cursor.charIndex) ?? "");
    }

    if (reduceMotion && skill.mode === "code") {
      setCompletedLines(skill.code.map((text, index) => ({ id: `${skill.name}-${index}`, text })));
      setIsTyping(false);
      onCodeProgressChange?.({
        skillName: skill.name,
        fileIndex: 0,
        lineIndex: skill.code.length,
        charIndex: 0,
        completed: true,
      });
    }
  }, [codeProgress, onCodeProgressChange, reduceMotion, skill, started]);

  const setupTypingTimeline = useCallback(
    (timeline: gsap.core.Timeline) => {
      if (skill.mode !== "code" || !started || reduceMotion) return;
      const cursor = normalizeCodeCursor(skill, codeProgress);
      if (cursor.completed) {
        timeline.call(() => {
          setCompletedLines(
            skill.code.map((text, index) => ({ id: `${skill.name}-${index}`, text })),
          );
          setCurrentLine("");
          setIsTyping(false);
          onTypingComplete?.();
        });
        return;
      }

      skill.code.slice(cursor.lineIndex).forEach((line, offset) => {
        const lineIdx = cursor.lineIndex + offset;
        const startChar = lineIdx === cursor.lineIndex ? cursor.charIndex : 0;

        if (line.length === 0) {
          timeline.call(() => {
            setCompletedLines((prev) =>
              prev.length > lineIdx
                ? prev
                : [...prev, { id: `${skill.name}-${lineIdx}`, text: line }],
            );
            setCurrentLine("");
            onCodeProgressChange?.({
              skillName: skill.name,
              fileIndex: 0,
              lineIndex: lineIdx + 1,
              charIndex: 0,
              completed: lineIdx + 1 >= skill.code.length,
            });
          });
          timeline.to({}, { duration: 0.05 });
          return;
        }

        for (let ci = startChar + 1; ci <= line.length; ci++) {
          timeline.to(
            {},
            {
              duration: line[ci - 1] === " " ? 0.01 : 0.02,
              onStart: () => {
                if (ci === 1) setIsTyping(true);
              },
              onComplete: () => {
                setCurrentLine(line.slice(0, ci));
                onCodeProgressChange?.({
                  skillName: skill.name,
                  fileIndex: 0,
                  lineIndex: lineIdx,
                  charIndex: ci,
                  completed: false,
                });
              },
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
          onCodeProgressChange?.({
            skillName: skill.name,
            fileIndex: 0,
            lineIndex: lineIdx + 1,
            charIndex: 0,
            completed: lineIdx + 1 >= skill.code.length,
          });
        });

        timeline.to({}, { duration: 0.05 });
      });

      timeline.call(() => {
        setIsTyping(false);
        onTypingComplete?.();
      });
    },
    [codeProgress, onCodeProgressChange, onTypingComplete, reduceMotion, skill, started],
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
            className="content-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-auto py-3"
            data-lenis-prevent
            style={CONTENT_PANEL_STYLE}
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
                progress={terminalProgress}
                onProgressChange={onTerminalProgressChange}
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
