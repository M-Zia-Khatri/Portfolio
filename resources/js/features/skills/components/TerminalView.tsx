import { useGsapTypingEffect } from '@/shared/hooks/useGsapAnimations';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { TerminalLine as TLine } from '../types';
import TerminalLine from './TerminalLine';

interface TerminalViewProps {
  skillName: string;
  commands: TLine[];
  color: string;
  isActive?: boolean;
}

interface Block {
  command: TLine & { kind: 'command' };
  outputs: TLine[];
}

function buildBlocks(commands: TLine[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < commands.length) {
    if (commands[i].kind === 'command') {
      const cmd = commands[i] as TLine & { kind: 'command' };
      const outputs: TLine[] = [];
      i += 1;
      while (i < commands.length && commands[i].kind !== 'command') outputs.push(commands[i++]);
      blocks.push({ command: cmd, outputs });
    } else i += 1;
  }
  return blocks;
}

const DoneBlock = memo(({ block, bi, color }: { block: Block; bi: number; color: string }) => (
  <div>
    <TerminalLine line={block.command} isActive={false} cursor={false} color={color} index={bi} />
    {block.outputs.map((out, oi) => (
      <TerminalLine key={oi} line={out} isActive={false} cursor={false} color={color} index={oi} />
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
  const [activeCommand, setActiveCommand] = useState('');
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [activeOutputs, setActiveOutputs] = useState<TLine[]>([]);
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  useGsapTypingEffect(
    rootRef,
    [skillName, blocks],
    (timeline: any) => {
      setDoneBlocks([]);
      setActiveCommand('');
      setActiveBlock(null);
      setActiveOutputs([]);
      setDone(false);

      blocks.forEach((block, bi) => {
        timeline.call(() => {
          setActiveBlock(block);
          setActiveCommand('');
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
          timeline.to({}, { duration: out.kind === 'blank' ? 0.06 : 0.05 });
        });

        timeline.call(() => {
          setDoneBlocks((prev) => [...prev, block]);
          setActiveBlock(null);
          setActiveCommand('');
          setActiveOutputs([]);
        });

        if (bi < blocks.length - 1) timeline.to({}, { duration: 0.25 });
      });

      timeline.call(() => setDone(true));
    },
    !isActive,
  );

  return (
    <div ref={rootRef} className="px-4 py-2">
      {doneBlocks.map((block, bi) => (
        <DoneBlock key={`done-${bi}`} block={block} bi={bi} color={color} />
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
          {activeOutputs.map((out, oi) => (
            <TerminalLine
              key={oi}
              line={out}
              isActive={false}
              cursor={false}
              color={color}
              index={oi}
            />
          ))}
        </div>
      )}
      {done && (
        <div className="flex items-center" style={{ minHeight: '1.6rem' }}>
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
