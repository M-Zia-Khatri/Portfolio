import type { GuessResultType } from "../types/guessNumContextTypes";

export interface GuessNumStatusContextType {
  randomNumber: number | null;
  showNumber: boolean;
  started: boolean;
  playerName: string;
  didWin: boolean;
}

export interface GuessNumProgressContextType {
  guessTurn: number;
  guessResults: GuessResultType[];
}

export interface GuessNumTimerContextType {
  timeLeft: number;
}

export interface GuessNumActionsContextType {
  startGame: (playerName?: string) => void;
  makeGuess: (guess: number) => void;
  restartGame: () => void;
  setStarted: (val: boolean) => void;
  clearHistory: VoidFunction;
  clearAndReloadHistory: VoidFunction;
}
