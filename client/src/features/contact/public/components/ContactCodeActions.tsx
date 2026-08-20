import { ICON_MAP } from "@/features/skills/admin/iconMap";
import type { ApiSkill, Skill } from "@/features/skills/types";

export function toRuntimeSkill(apiSkill: ApiSkill): Skill {
  const iconComponent = ICON_MAP[apiSkill.icon] ?? ICON_MAP.default;
  return { ...apiSkill, iconComponent } as Skill;
}

export function markSessionOnce(key: string) {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(key) === "1") return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}
