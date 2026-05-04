import { memo } from 'react';
import type { TerminalLine as TLine } from '../types';

interface TerminalLineProps {
  line: TLine;
  partial?: string;
  isActive: boolean;
  cursor: boolean;
  color: string;
  index: number;
}

const TerminalLine = memo(function TerminalLine({
  line,
  partial,
  isActive,
  cursor,
  color,
}: TerminalLineProps) {
  return (
    <div className="flex items-start" style={{ minHeight: '1.6rem', fontFamily: 'inherit' }}>
      {line.kind === 'blank' ? (
        <span className="leading-[1.6rem]">&nbsp;</span>
      ) : line.kind === 'comment' ? (
        <span
          className="text-[12.5px] leading-[1.6rem] tracking-tight whitespace-pre select-none"
          style={{ color: 'rgba(255,255,255,0.28)' }}
        >
          {line.text}
        </span>
      ) : line.kind === 'output' ? (
        <span
          className="pl-4 text-[12.5px] leading-[1.6rem] tracking-tight whitespace-pre"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {line.text}
        </span>
      ) : (
        <span className="flex items-center gap-0 text-[12.5px] leading-[1.6rem] tracking-tight whitespace-pre">
          <span style={{ color }} className="mr-1.5 font-bold select-none">
            $
          </span>
          <span style={{ color: '#e2e8f0' }}>{isActive ? (partial ?? '') : line.text}</span>
          {isActive && (
            <span
              className="ml-0.5 inline-block h-3.25 w-0.5 align-middle"
              style={{ background: color, opacity: cursor ? 1 : 0, transition: 'opacity 0.08s' }}
            />
          )}
        </span>
      )}
    </div>
  );
});

export default TerminalLine;
