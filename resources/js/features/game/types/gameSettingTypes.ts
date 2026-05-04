// @/components/GameSetting/types.ts

/** Values held in the settings form */
export type SettingsFormValues = {
  maxNumber: number;
  guessLimit: number;
  timeMinutes: number;
  timeSeconds: number;
};

/** What we persist for “custom” difficulty */
export interface CustomValues {
  maxNumber: number;
  guessLimit: number;
  totalSeconds: number;
}

export type Rules = {
  required?: string;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
};
