import type { Dispatch, MutableRefObject } from "react";
import { analytics } from "@/shared/analytics";
import type { GuessResultType } from "../types/guessNumContextTypes";
import type { GameAction } from "./gameReducer";
import type { GuessNumActionsContextType } from "./game.types";

interface CreateGuessNumActionsOptions {
  maxNumber: number;
  guessLimit: number;
  dispatch: Dispatch<GameAction>;
  resetTimer: () => void;
  clearScoreHistory: () => void;
  randomNumberRef: MutableRefObject<number | null>;
  showNumberRef: MutableRefObject<boolean>;
  onResetTracking: () => void;
}

export function createGuessNumActions({
  maxNumber,
  guessLimit,
  dispatch,
  resetTimer,
  clearScoreHistory,
  randomNumberRef,
  showNumberRef,
  onResetTracking,
}: CreateGuessNumActionsOptions): GuessNumActionsContextType {
  return {
    startGame: (name?: string) => {
      if (typeof name === "string") {
        dispatch({ type: "SET_PLAYER_NAME", payload: name.trim() });
      }
      onResetTracking();

      const num = Math.floor(Math.random() * maxNumber) + 1;
      dispatch({ type: "RESET_GAME", payload: { randomNumber: num, guessLimit } });
      resetTimer();

      if (typeof name === "string" && name.trim().length > 0) {
        analytics.track("game_start", {});
      }
    },
    makeGuess: (guess: number) => {
      const currentNumber = randomNumberRef.current;
      if (currentNumber == null || showNumberRef.current) return;
      const dist = Math.abs(guess - currentNumber);
      const threshold = maxNumber / 100;
      let message: GuessResultType["message"];
      if (guess === currentNumber) message = "you win";
      else if (dist <= threshold * 15) message = "very close";
      else if (guess < currentNumber) message = "too low";
      else message = "too high";

      dispatch({ type: "MAKE_GUESS", payload: { guess, message, ts: Date.now() } });
    },
    restartGame: () => {
      onResetTracking();
      const num = Math.floor(Math.random() * maxNumber) + 1;
      dispatch({ type: "RESET_GAME", payload: { randomNumber: num, guessLimit } });
      dispatch({ type: "SET_STARTED", payload: true });
      resetTimer();
      analytics.track("game_start", {});
    },
    setStarted: (val: boolean) => dispatch({ type: "SET_STARTED", payload: val }),
    clearHistory: clearScoreHistory,
    clearAndReloadHistory: () => {
      clearScoreHistory();
      const num = Math.floor(Math.random() * maxNumber) + 1;
      dispatch({ type: "RESET_GAME", payload: { randomNumber: num, guessLimit } });
      resetTimer();
    },
  };
}
