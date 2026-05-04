import { cn } from '@/shared/utils/cn';
import { memo, useMemo } from 'react';
import { tokenise } from './tokeniser';

interface CodeLineProps {
  line: string;
  index: number;
  isActiveLine: boolean;
  color: string;
}

const CodeLine = memo(function CodeLine({ line, index, isActiveLine, color }: CodeLineProps) {
  // 1. Only run tokeniser if the text of the line actually changes
  const tokens = useMemo(() => tokenise(line), [line]);

  return (
    <div
      className={cn('code-line flex items-center group', isActiveLine && 'is-active')}
      style={{ '--line-color': color } as React.CSSProperties}
    >
      {/* Line Number */}
      <span className="line-num relative w-10 shrink-0 pr-4 text-right text-[11px] select-none">
        {index + 1}
      </span>

      {/* Code Content */}
      <span className="relative text-[12.5px] leading-[1.6rem] tracking-tight whitespace-pre">
        {tokens.map((tok, j) => (
          <span key={j} style={{ color: tok.color }}>
            {tok.text}
          </span>
        ))}

        {/* 2. CSS-only cursor: zero React renders to blink */}
        {isActiveLine && <span className="code-cursor" />}
      </span>
    </div>
  );
});

export default CodeLine;
