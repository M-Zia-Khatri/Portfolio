import { memo } from "react";
import type { Skill } from "@/features/skills/types";

function ProgressRail({
  contactSkills,
  autoIndex,
  isDone,
}: {
  contactSkills: Skill[];
  autoIndex: number;
  isDone: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2.5">
      {contactSkills.map((s, i) => (
        <div
          key={s.name}
          title={s.name}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === autoIndex && !isDone ? 20 : 5,
            opacity: i <= autoIndex ? 1 : 0.2,
            background: isDone
              ? `${s.color}60`
              : i === autoIndex
                ? s.color
                : i < autoIndex
                  ? `${s.color}60`
                  : "rgba(255,255,255,0.18)",
          }}
        />
      ))}
    </div>
  );
}

export const ContactCodeFooter = memo(ProgressRail);
