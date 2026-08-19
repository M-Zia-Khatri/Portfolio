import { memo } from "react";
import TerminalLine from "./TerminalLine";
import type { TerminalBlock, TerminalOutputLine } from "./terminal.utils";

const DoneBlock = memo(
  ({ block, bi, color }: { block: TerminalBlock; bi: number; color: string }) => (
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
  ),
);

interface TerminalDoneBlocksProps {
  blocks: TerminalBlock[];
  color: string;
}

export function TerminalDoneBlocks({ blocks, color }: TerminalDoneBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => (
        <DoneBlock key={block.id} block={block} bi={index} color={color} />
      ))}
    </>
  );
}

interface TerminalActiveOutputProps {
  block: TerminalBlock;
  activeCommand: string;
  activeOutputs: TerminalOutputLine[];
  cursor: boolean;
  color: string;
  blockIndex: number;
}

export function TerminalActiveOutput({
  block,
  activeCommand,
  activeOutputs,
  cursor,
  color,
  blockIndex,
}: TerminalActiveOutputProps) {
  return (
    <div>
      <TerminalLine
        line={block.command}
        partial={activeCommand}
        isActive={true}
        cursor={cursor}
        color={color}
        index={blockIndex}
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
  );
}
