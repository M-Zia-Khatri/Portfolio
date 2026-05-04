import { cn } from '@/shared/utils/cn';

export function Spinner() {
  return (
    <svg
      className={cn('animate-spin h-4 w-4 shrink-0')}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      {/* FIX: previous path "M4 12a8 8 0 018-8v4l3-3-3-3v4..." contained a
          zigzag (v4l3-3-3-3v4) that drew an arrow notch shape, not a clean
          quarter-arc. Replaced with the standard Tailwind spinner arc. */}
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
