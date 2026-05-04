// @/stores/GameSetStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GuessResultType } from '../types/guessNumContextTypes';

export type ScoreRecord = {
  id: string;
  name: string;
  score: number;
  result: 'win' | 'lose';
  attempts: number;
  guessLimit: number;
  timeTaken: number;
  difficultLevel: string;
  date: Date;
  guessResults: GuessResultType[];
};

export type CustomLevelPreset = {
  id: string;
  name: string;
  maxNumber: number;
  guessLimit: number;
  totalSeconds: number;
};

interface PersistedState {
  scoreHistory: ScoreRecord[];
  customLevels: CustomLevelPreset[];
}

interface AppState {
  maxNumber: number;
  setMaxNumber: (value: number) => void;

  guessLimit: number;
  setGuessLimit: (value: number) => void;

  timeLimit: number;
  setTimeLimit: (value: number) => void;

  difficultLevel: string;
  setDifficultLevel: (value: string) => void;

  customLevels: CustomLevelPreset[];
  addCustomLevel: (level: CustomLevelPreset) => void;
  updateCustomLevel: (id: string, level: CustomLevelPreset) => void;
  removeCustomLevel: (id: string) => void;

  scoreHistory: ScoreRecord[];
  addScoreRecord: (record: ScoreRecord) => void;
  setScoreRecords: (records: ScoreRecord[]) => void;
  clearScoreHistory: () => void;
}

const useGameSet = create<AppState>()(
  persist(
    (set) => ({
      // Default settings
      maxNumber: 20,
      guessLimit: 7,
      timeLimit: 180,
      difficultLevel: 'normal',

      customLevels: [],
      scoreHistory: [],

      // Updaters
      setMaxNumber: (maxNumber) => set({ maxNumber }),
      setGuessLimit: (guessLimit) => set({ guessLimit }),
      setTimeLimit: (timeLimit) => set({ timeLimit }),
      setDifficultLevel: (difficultLevel) => set({ difficultLevel }),

      addCustomLevel: (level) => set((state) => ({ customLevels: [...state.customLevels, level] })),
      updateCustomLevel: (id, level) =>
        set((state) => ({
          customLevels: state.customLevels.map((item) => (item.id === id ? level : item)),
        })),
      removeCustomLevel: (id) =>
        set((state) => ({
          customLevels: state.customLevels.filter((l) => l.id !== id),
        })),

      addScoreRecord: (record) =>
        set((state) => ({
          scoreHistory: [...state.scoreHistory, record],
        })),
      setScoreRecords: (records) => set({ scoreHistory: records }),
      clearScoreHistory: () => set({ scoreHistory: [] }),
    }),
    {
      name: 'guess-number-history',
      partialize: (state) => ({
        scoreHistory: state.scoreHistory,
        customLevels: state.customLevels,
      }),
      merge: (persisted: unknown, current: AppState) => {
        const p = persisted as Partial<PersistedState>;
        const hydratedHistory = (p.scoreHistory ?? []).map((r: ScoreRecord) => ({
          ...r,
          date: new Date(r.date),
        }));
        return {
          ...current,
          scoreHistory: hydratedHistory,
          customLevels: p.customLevels ?? [],
        };
      },
    },
  ),
);

export default useGameSet;
