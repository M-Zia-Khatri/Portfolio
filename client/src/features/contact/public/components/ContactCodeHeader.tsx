import { memo } from "react";

export type ContactCodeStatus = "idle" | "typing" | "paused" | "advancing" | "done";

function StatusBadge({
  status,
  color,
  secondsLeft,
  nextName,
}: {
  status: ContactCodeStatus;
  color: string;
  secondsLeft: number;
  nextName: string;
}) {
  if (status === "typing")
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>
        typing…
      </span>
    );
  if (status === "paused")
    return (
      <span className="text-[10px] tracking-widest text-amber-300">resuming in {secondsLeft}s</span>
    );
  if (status === "advancing")
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}bb` }}>
        next → {nextName}
      </span>
    );
  if (status === "done")
    return (
      <span className="text-[10px] tracking-widest" style={{ color: `${color}99` }}>
        ✓ all done
      </span>
    );
  return null;
}

const MemoizedStatusBadge = memo(StatusBadge);

export function ContactCodeHeader(props: Parameters<typeof StatusBadge>[0]) {
  return (
    <div className="flex h-5 justify-end pr-1">
      <MemoizedStatusBadge {...props} />
    </div>
  );
}
