import type { Token } from '../types';

export const TOKEN_COLORS: Record<string, string> = {
  keyword: '#c792ea',
  tag: '#f07178',
  string: '#c3e88d',
  comment: '#546e7a',
  fn: '#82aaff',
  type: '#ffcb6b',
  default: '#cdd6f4',
};

const PATTERNS: Array<[RegExp, string]> = [
  [/\/\/.*$/, 'comment'],
  [/#.*$/, 'comment'],
  [/"[^"]*"|'[^']*'|`[^`]*`/, 'string'],
  [
    /\b(import|export|default|from|const|let|var|type|interface|class|function|return|extends|public|private|new|if|else|<?php)\b/,
    'keyword',
  ],
  [/\b(string|number|boolean|void|any|JsonResponse|array|int)\b/, 'type'],
  [/<\/?[a-zA-Z][\w-]*/, 'tag'],
  [/[a-zA-Z_][\w]*(?=\s*\()/, 'fn'],
];

export function tokenise(line: string): Token[] {
  const parts: Token[] = [];
  let rem = line;

  while (rem.length > 0) {
    let hit = false;
    for (const [re, kind] of PATTERNS) {
      const m = rem.match(re);
      if (m && m.index !== undefined) {
        if (m.index > 0)
          parts.push({
            text: rem.slice(0, m.index),
            color: TOKEN_COLORS.default,
          });
        parts.push({
          text: m[0],
          color: TOKEN_COLORS[kind] ?? TOKEN_COLORS.default,
        });
        rem = rem.slice(m.index + m[0].length);
        hit = true;
        break;
      }
    }
    if (!hit) {
      parts.push({ text: rem, color: TOKEN_COLORS.default });
      break;
    }
  }

  return parts;
}
