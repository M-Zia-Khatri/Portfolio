import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TerminalTypingProgress } from "@/features/skills/skillsProgress.storage";
import { useGsapTypingEffect } from "@/shared/hooks/useGsapAnimations";
import type { TerminalLine as TLine } from "../../types";
import { TerminalActiveOutput, TerminalDoneBlocks } from "./TerminalOutput";
import { TerminalPrompt } from "./TerminalPrompt";
import {
  buildBlocks,
  normalizeTerminalCursor,
  type TerminalBlock,
  type TerminalOutputLine,
} from "./terminal.utils";

interface TerminalViewProps {
  skillName: string;
  commands: TLine[];
  color: string;
  isActive?: boolean;
  progress?: TerminalTypingProgress | null;
  onProgressChange?: (progress: TerminalTypingProgress) => void;
}

export default function TerminalView({
  skillName,
  commands,
  color,
  isActive = true,
  progress,
  onProgressChange,
}: TerminalViewProps) {
  const blocks = useMemo(() => buildBlocks(commands), [commands]);
  const [doneBlocks, setDoneBlocks] = useState<TerminalBlock[]>([]);
  const [activeCommand, setActiveCommand] = useState("");
  const [activeBlock, setActiveBlock] = useState<TerminalBlock | null>(null);
  const [activeOutputs, setActiveOutputs] = useState<TerminalOutputLine[]>([]);
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setCursor((c) => !c), 530);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const cursor = normalizeTerminalCursor(skillName, blocks, progress);

    if (cursor.completed) {
      setDoneBlocks(blocks);
      setActiveCommand("");
      setActiveBlock(null);
      setActiveOutputs([]);
      setDone(true);
      return;
    }

    const active = blocks[cursor.commandIndex] ?? null;
    setDoneBlocks(blocks.slice(0, cursor.commandIndex));
    setActiveBlock(active);
    setActiveCommand(active ? active.command.text.slice(0, cursor.charIndex) : "");
    setActiveOutputs(active ? active.outputs.slice(0, cursor.lineIndex) : []);
    setDone(false);
  }, [blocks, progress, skillName]);

  const setupTerminalTimeline = useCallback(
    (timeline: gsap.core.Timeline) => {
      const cursor = normalizeTerminalCursor(skillName, blocks, progress);

      if (cursor.completed) {
        timeline.call(() => {
          setDoneBlocks(blocks);
          setActiveCommand("");
          setActiveBlock(null);
          setActiveOutputs([]);
          setDone(true);
        });
        return;
      }

      blocks.slice(cursor.commandIndex).forEach((block, offset) => {
        const bi = cursor.commandIndex + offset;
        const isResumeBlock = bi === cursor.commandIndex;
        const startChar = isResumeBlock ? cursor.charIndex : 0;
        const startOutput = isResumeBlock ? cursor.lineIndex : 0;

        timeline.call(() => {
          setDoneBlocks((prev) => (prev.length >= bi ? prev.slice(0, bi) : blocks.slice(0, bi)));
          setActiveBlock(block);
          setActiveCommand(block.command.text.slice(0, startChar));
          setActiveOutputs(block.outputs.slice(0, startOutput));
          setDone(false);
          onProgressChange?.({
            skillName,
            commandIndex: bi,
            lineIndex: startOutput,
            charIndex: startChar,
            completed: false,
          });
        });

        for (let ci = startChar + 1; ci <= block.command.text.length; ci++) {
          timeline.to(
            {},
            {
              duration: 0.03,
              onComplete: () => {
                setActiveCommand(block.command.text.slice(0, ci));
                onProgressChange?.({
                  skillName,
                  commandIndex: bi,
                  lineIndex: 0,
                  charIndex: ci,
                  completed: false,
                });
              },
            },
          );
        }

        if (startOutput === 0) timeline.to({}, { duration: 0.16 });
        block.outputs.slice(startOutput).forEach((out, outputOffset) => {
          const oi = startOutput + outputOffset;
          timeline.call(() => {
            setActiveCommand(block.command.text);
            setActiveOutputs(block.outputs.slice(0, oi + 1));
            onProgressChange?.({
              skillName,
              commandIndex: bi,
              lineIndex: oi + 1,
              charIndex: block.command.text.length,
              completed: false,
            });
          });
          timeline.to({}, { duration: out.line.kind === "blank" ? 0.06 : 0.05 });
        });

        timeline.call(() => {
          setDoneBlocks((prev) =>
            prev.some((doneBlock) => doneBlock.id === block.id) ? prev : [...prev, block],
          );
          setActiveBlock(null);
          setActiveCommand("");
          setActiveOutputs([]);
          onProgressChange?.({
            skillName,
            commandIndex: bi + 1,
            lineIndex: 0,
            charIndex: 0,
            completed: bi + 1 >= blocks.length,
          });
        });

        if (bi < blocks.length - 1) timeline.to({}, { duration: 0.25 });
      });

      timeline.call(() => {
        setDone(true);
        onProgressChange?.({
          skillName,
          commandIndex: blocks.length,
          lineIndex: 0,
          charIndex: 0,
          completed: true,
        });
      });
    },
    [blocks, onProgressChange, progress, skillName],
  );

  useGsapTypingEffect(rootRef, [skillName, blocks], setupTerminalTimeline, !isActive);

  // TerminalHeader skipped — no separable header; window chrome lives in CodeTabBar

  return (
    <div ref={rootRef} className="px-4 py-2">
      <TerminalDoneBlocks blocks={doneBlocks} color={color} />
      {activeBlock && (
        <TerminalActiveOutput
          block={activeBlock}
          activeCommand={activeCommand}
          activeOutputs={activeOutputs}
          cursor={cursor}
          color={color}
          blockIndex={doneBlocks.length}
        />
      )}
      {done && <TerminalPrompt color={color} cursor={cursor} />}
    </div>
  );
}
