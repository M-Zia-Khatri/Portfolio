import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGsapTypingEffect } from "@/shared/hooks/useGsapAnimations";
import type { TerminalLine as TLine } from "../types";
import TerminalLine from "./TerminalLine";

interface TerminalViewProps {
  skillName: string;
  commands: TLine[];
  color: string;
  isActive?: boolean;
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

  const setupTerminalTimeline = useCallback(
    (timeline: gsap.core.Timeline) => {
      timeline.call(() => {
        setDoneBlocks([]);
        setActiveCommand("");
        setActiveBlock(null);
        setActiveOutputs([]);
        setDone(false);
      });

      blocks.forEach((block, bi) => {
        timeline.call(() => {
          setActiveBlock(block);
          setActiveCommand("");
          setActiveOutputs([]);
        });

        for (let ci = 1; ci <= block.command.text.length; ci++) {
          timeline.to(
            {},
            { duration: 0.03, onComplete: () => setActiveCommand(block.command.text.slice(0, ci)) },
          );
        }

        timeline.to({}, { duration: 0.16 });
        block.outputs.forEach((out, oi) => {
          timeline.call(() => setActiveOutputs(block.outputs.slice(0, oi + 1)));
          timeline.to({}, { duration: out.line.kind === "blank" ? 0.06 : 0.05 });
        });

        timeline.call(() => {
          setDoneBlocks((prev) =>
            prev.some((doneBlock) => doneBlock.id === block.id) ? prev : [...prev, block],
          );
          setActiveBlock(null);
          setActiveCommand("");
          setActiveOutputs([]);
        });

        if (bi < blocks.length - 1) timeline.to({}, { duration: 0.25 });
      });

      timeline.call(() => setDone(true));
    },
    [blocks],
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
