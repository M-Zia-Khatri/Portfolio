import type { CustomLevelPreset } from "../store/GameSetStore";
import type { CustomLevelFormState } from "../validation/customLevel.validation";

export function customLevelFormFromPreset(lvl: CustomLevelPreset): CustomLevelFormState {
  const m = Math.floor(lvl.totalSeconds / 60);
  const s = lvl.totalSeconds % 60;
  return {
    name: lvl.name,
    maxNumber: String(lvl.maxNumber),
    guessLimit: String(lvl.guessLimit),
    timeMinutes: String(m),
    timeSeconds: String(s),
  };
}

export function customLevelPayloadFromForm(
  form: CustomLevelFormState,
  editingId: string | null,
  generateId: (length: number) => string,
): CustomLevelPreset {
  return {
    id: editingId ?? generateId(8),
    name: form.name.trim(),
    maxNumber: Number(form.maxNumber),
    guessLimit: Number(form.guessLimit),
    totalSeconds: Number(form.timeMinutes) * 60 + Number(form.timeSeconds),
  };
}
