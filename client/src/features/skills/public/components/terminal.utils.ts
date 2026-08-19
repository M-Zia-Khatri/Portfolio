import type { TerminalTypingProgress } from "@/features/skills/skillsProgress.storage";
import type { TerminalLine as TLine } from "../../types";

export interface TerminalOutputLine {
  id: string;
  line: TLine;
}

export interface TerminalBlock {
  id: string;
  command: TLine & { kind: "command" };
  outputs: TerminalOutputLine[];
}

export function buildBlocks(commands: TLine[]): TerminalBlock[] {
  const blocks: TerminalBlock[] = [];
  let i = 0;
  while (i < commands.length) {
    if (commands[i].kind === "command") {
      const cmd = commands[i] as TLine & { kind: "command" };
      const outputs: TerminalOutputLine[] = [];
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

export function normalizeTerminalCursor(
  skillName: string,
  blocks: TerminalBlock[],
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
