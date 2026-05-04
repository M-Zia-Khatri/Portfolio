import CodeEmptyState from '@/features/skills/components/CodeEmptyState';
import CodeLine from '@/features/skills/components/CodeLine';
import CodeTabBar from '@/features/skills/components/CodeTabBar';
import TerminalView from '@/features/skills/components/TerminalView';
import type { Skill } from '@/features/skills/types';
import TabScrollbarStyle from '@/shared/components/TabScrollbarStyle';
import { useGsapTypingEffect as useGsapTimeline } from '@/shared/hooks/useGsapAnimations';
import type { RefObject } from 'react';
import {
  forwardRef,
  memo,
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const ContentScrollbarStyle = memo(function ContentScrollbarStyle({ color }: { color: string }) {
  return (
    <style>{`.content-scrollbar::-webkit-scrollbar { width: 3px; } .content-scrollbar::-webkit-scrollbar-thumb { background: ${color}44; } .content-scrollbar { scrollbar-width: thin; scrollbar-color: ${color}44 transparent; }`}</style>
  );
});

const CARD_STYLE = { transformStyle: 'preserve-3d' } as const;

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
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Use useDeferredValue for the list of lines.
  // This tells React to prioritize the "currentLine" typing animation
  // and render the long list of background lines during idle time.
  const deferredCompletedLines = useDeferredValue(completedLines);

  // 2. Strict Reset: Prevents the "writing multiple times" bug
  useEffect(() => {
    setCompletedLines([]);
    setCurrentLine('');
    setIsTyping(started && skill.mode === 'code');
  }, [skill.name, skill.mode, started]);

  const tlRef = useGsapTimeline(
    cardRef,
    [skill.name, started],
    (timeline: any) => {
      if (skill.mode !== 'code' || !started) return;

      skill.code.forEach((line, lineIdx) => {
        // Typing Phase
        for (let ci = 1; ci <= line.length; ci++) {
          timeline.to(
            {},
            {
              duration: line[ci - 1] === ' ' ? 0.01 : 0.02,
              onStart: () => {
                if (ci === 1) setIsTyping(true);
              },
              onComplete: () => setCurrentLine(line.slice(0, ci)),
            },
          );
        }

        // Commit Phase: Push whole line to state
        timeline.call(() => {
          setCompletedLines((prev) => {
            // Safety check: Don't add the same line twice if GSAP restarts
            if (prev.length > lineIdx) return prev;
            return [...prev, line];
          });
          setCurrentLine('');
        });

        timeline.to({}, { duration: 0.05 });
      });

      timeline.call(() => {
        setIsTyping(false);
        onTypingComplete?.();
      });
    },
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

  // Auto-scroll logic
  useEffect(() => {
    const el = contentRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [deferredCompletedLines, currentLine]);

  const activeLineIndex = completedLines.length;

  const isTerminal = skill.mode === 'terminal';

  return (
    <>
      <TabScrollbarStyle color={skill.color} />
      <ContentScrollbarStyle color={skill.color} />
      <div ref={cardRef} className="relative" style={CARD_STYLE}>
        <div
          className="relative z-10 flex w-full flex-col overflow-hidden rounded-xl"
          style={{
            background: isTerminal ? 'rgba(5, 10, 5, 0.97)' : 'rgba(10, 14, 20, 0.95)',
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
            style={{ height: 300, overflowY: 'auto', overflowX: 'hidden' }}
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
              <div ref={codeContainerRef}>
                {/* Render the deferred "History" of lines */}
                {deferredCompletedLines.map((line, i) => (
                  <CodeLine
                    key={`${skill.name}-done-${i}`}
                    line={line}
                    index={i}
                    isActiveLine={false}
                    color={skill.color}
                  />
                ))}

                {/* Render the "Active" typing line immediately (High priority) */}
                {isTyping && (
                  <CodeLine
                    key={`${skill.name}-active`}
                    line={currentLine}
                    index={deferredCompletedLines.length}
                    isActiveLine={true}
                    color={skill.color}
                  />
                )}

                {/* If typing is finished and we aren't in terminal, 
                    ensure full code is shown if state hasn't caught up */}
                {!isTyping &&
                  deferredCompletedLines.length === 0 &&
                  skill.code.map((line, i) => (
                    <CodeLine
                      key={`${skill.name}-active-${activeLineIndex}`}
                      line={line}
                      index={i}
                      isActiveLine={false}
                      color={skill.color}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

CodeCardBase.displayName = 'CodeCard';

export default memo(CodeCardBase);
