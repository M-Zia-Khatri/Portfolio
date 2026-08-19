export const EMPTY_CUSTOM_LEVEL_FORM = {
  name: "",
  maxNumber: "",
  guessLimit: "",
  timeMinutes: "",
  timeSeconds: "",
};

export type CustomLevelFormState = typeof EMPTY_CUSTOM_LEVEL_FORM;
export type CustomLevelFormErrors = Partial<Record<keyof CustomLevelFormState, string>>;

export function validateCustomLevelForm(f: CustomLevelFormState): CustomLevelFormErrors {
  const errors: CustomLevelFormErrors = {};
  if (!f.name.trim()) errors.name = "Name is required";
  const max = Number(f.maxNumber);
  if (!f.maxNumber) errors.maxNumber = "Required";
  else if (Number.isNaN(max) || max < 2 || max > 100) errors.maxNumber = "Must be 2–100";
  const limit = Number(f.guessLimit);
  if (!f.guessLimit) errors.guessLimit = "Required";
  else if (Number.isNaN(limit) || limit < 1 || limit > 50) errors.guessLimit = "Must be 1–50";
  const mins = Number(f.timeMinutes);
  if (f.timeMinutes === "") errors.timeMinutes = "Required";
  else if (Number.isNaN(mins) || mins < 0 || mins > 59) errors.timeMinutes = "0–59";
  const secs = Number(f.timeSeconds);
  if (f.timeSeconds === "") errors.timeSeconds = "Required";
  else if (Number.isNaN(secs) || secs < 0 || secs > 59) errors.timeSeconds = "0–59";
  if (!errors.timeMinutes && !errors.timeSeconds && mins === 0 && secs === 0)
    errors.timeMinutes = "Total time must be > 0";
  return errors;
}
