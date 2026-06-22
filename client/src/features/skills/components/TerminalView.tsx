import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TerminalTypingProgress } from "@/features/skills/skillsProgress.storage";
import { useGsapTypingEffect } from "@/shared/hooks/useGsapAnimations";
import type { TerminalLine as TLine } from "../types";
import TerminalLine from "./TerminalLine";

interface TerminalViewProps {
  skillName: string;
  commands: TLine[];
  color: string;
  isActive?: boolean;
  progress?: TerminalTypingProgress | null;
  onProgressChange?: (progress: TerminalTypingProgress) => void;
}

interface TerminalOutput {
  id: string;
  line: TLine;
}

interface Block {
  id: string;
  command: TLine & { kind: "command" };
  outputs: TerminalOutput[];
}

function buildBlocks(commands: TLine[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < commands.length) {
    if (commands[i].kind === "command") {
      const cmd = commands[i] as TLine & { kind: "command" };
      const outputs: TerminalOutput[] = [];
      const blockIndex = blocks.length;
      i += 1;
      while (i < commands.length && commands[i].kind !== "command") {
        const line = commands[i++];
        const text = "text" in line ? line.text : "blank";
        outputs.push({ id: `${blockIndex}-${outputs.length}-${line.kind}-${text}`, line });
      }
      blocks.push({ id: `${blockIndex}-${cmd.text}`, command: cmd, outputs });
    } else i += 1;
  }
  return blocks;
}

function normalizeTerminalCursor(
  skillName: string,
  blocks: Block[],
  progress?: TerminalTypingProgress | null,
) {
  if (progress?.skillName !== skillName) {
    return { commandIndex: 0, lineIndex: 0, charIndex: 0, completed: false };
  }

  if (progress.completed) {
    return { commandIndex: blocks.length, lineIndex: 0, charIndex: 0, completed: true };
  }

  let commandIndex = Math.min(Math.max(progress.commandIndex, 0), blocks.length);
  if (commandIndex >= blocks.length) {
    return { commandIndex: blocks.length, lineIndex: 0, charIndex: 0, completed: true };
  }

  const block = blocks[commandIndex];
  let lineIndex = Math.min(Math.max(progress.lineIndex, 0), block.outputs.length);
  let charIndex = Math.min(Math.max(progress.charIndex, 0), block.command.text.length);

  if (lineIndex > 0) charIndex = block.command.text.length;

  if (lineIndex >= block.outputs.length && charIndex >= block.command.text.length) {
    commandIndex += 1;
    lineIndex = 0;
    charIndex = 0;
  }

  return {
    commandIndex,
    lineIndex,
    charIndex,
    completed: commandIndex >= blocks.length,
  };
}

const DoneBlock = memo(({ block, bi, color }: { block: Block; bi: number; color: string }) => (
  <div>
    <TerminalLine line={block.command} isActive={false} cursor={false} color={color} index={bi} />
    {block.outputs.map((out) => (
      <TerminalLine
        key={out.id}
        line={out.line}
        isActive={false}
        cursor={false}
        color={color}
        index={0}
      />
    ))}
  </div>
));

export default function TerminalView({
  skillName,
  commands,
  color,
  isActive = true,
  progress,
  onProgressChange,
}: TerminalViewProps) {
  const blocks = useMemo(() => buildBlocks(commands), [commands]);
  const [doneBlocks, setDoneBlocks] = useState<Block[]>([]);
  const [activeCommand, setActiveCommand] = useState("");
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [activeOutputs, setActiveOutputs] = useState<TerminalOutput[]>([]);
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

  return (
    <div ref={rootRef} className="px-4 py-2">
      {doneBlocks.map((block, index) => (
        <DoneBlock key={block.id} block={block} bi={index} color={color} />
      ))}
      {activeBlock && (
        <div>
          <TerminalLine
            line={activeBlock.command}
            partial={activeCommand}
            isActive={true}
            cursor={cursor}
            color={color}
            index={doneBlocks.length}
          />
          {activeOutputs.map((out) => (
            <TerminalLine
              key={out.id}
              line={out.line}
              isActive={false}
              cursor={false}
              color={color}
              index={0}
            />
          ))}
        </div>
      )}
      {done && (
        <div className="flex items-center" style={{ minHeight: "1.6rem" }}>
          <span style={{ color }} className="mr-1.5 text-[12.5px] font-bold select-none">
            $
          </span>
          <span
            className="inline-block h-[13px] w-[2px] align-middle"
            style={{ background: color, opacity: cursor ? 1 : 0 }}
          />
        </div>
      )}
    </div>
  );
}
