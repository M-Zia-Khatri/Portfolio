interface TerminalPromptProps {
  color: string;
  cursor: boolean;
}

export function TerminalPrompt({ color, cursor }: TerminalPromptProps) {
  return (
    <div className="flex items-center" style={{ minHeight: "1.6rem" }}>
      <span style={{ color }} className="mr-1.5 text-[12.5px] font-bold select-none">
        $
      </span>
      <span
        className="inline-block h-[13px] w-[2px] align-middle"
        style={{ background: color, opacity: cursor ? 1 : 0 }}
      />
    </div>
  );
}
