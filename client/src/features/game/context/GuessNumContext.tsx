import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useTransition,
} from "react";
import { analytics } from "@/features/analytics/tracking";
import useGameTimer from "../hooks/useGameTimer";
import { generateId } from "../services/idGenerator";
import useGameSet, { type ScoreRecord } from "../store/GameSetStore";
import { createGuessNumActions } from "./game.actions";
import { initialGameState } from "./game.initial-state";
import { calculateGameScore } from "./game.scoring";
import type {
  GuessNumActionsContextType,
  GuessNumProgressContextType,
  GuessNumStatusContextType,
  GuessNumTimerContextType,
} from "./game.types";
import { gameReducer } from "./gameReducer";

const GuessNumStatusContext = createContext<GuessNumStatusContextType | undefined>(undefined);
const GuessNumProgressContext = createContext<GuessNumProgressContextType | undefined>(undefined);
const GuessNumTimerContext = createContext<GuessNumTimerContextType | undefined>(undefined);
const GuessNumActionsContext = createContext<GuessNumActionsContextType | undefined>(undefined);

type Props = { children: ReactNode };

function rememberSessionOnce(key: string) {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(key) === "1") return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

export const GuessNumProvider: React.FC<Props> = ({ children }) => {
  const maxNumber = useGameSet((state) => state.maxNumber);
  const guessLimit = useGameSet((state) => state.guessLimit);
  const initialTimeLimit = useGameSet((state) => state.timeLimit);
  const difficultLevel = useGameSet((state) => state.difficultLevel);
  const addScoreRecord = useGameSet((state) => state.addScoreRecord);
  const clearScoreHistory = useGameSet((state) => state.clearScoreHistory);

  const [state, dispatch] = useReducer(gameReducer, initialGameState(guessLimit));
  const { randomNumber, guessResults, showNumber, guessTurn, started, playerName, didWin } = state;
  const completionTrackedRef = useRef(false);
  const abandonTrackedRef = useRef(false);

  const [_, startTransition] = useTransition();

  const randomNumberRef = useRef<number | null>(randomNumber);
  const showNumberRef = useRef(showNumber);

  useEffect(() => {
    randomNumberRef.current = randomNumber;
    showNumberRef.current = showNumber;
  }, [randomNumber, showNumber]);

  const { timeLeft, reset: resetTimer } = useGameTimer({
    initialTime: initialTimeLimit,
    isActive: started && !showNumber,
    onExpire: () => dispatch({ type: "REVEAL_NUMBER" }),
  });

  const actionsValue = useMemo(
    () =>
      createGuessNumActions({
        maxNumber,
        guessLimit,
        dispatch,
        resetTimer,
        clearScoreHistory,
        randomNumberRef,
        showNumberRef,
        onResetTracking: () => {
          completionTrackedRef.current = false;
          abandonTrackedRef.current = false;
        },
      }),
    [clearScoreHistory, guessLimit, maxNumber, resetTimer],
  );

  const gameSignature = useMemo(
    () => `${showNumber}-${guessResults.length}-${timeLeft}-${guessTurn}`,
    [showNumber, guessResults.length, timeLeft, guessTurn],
  );
  const lastSavedSignatureRef = useRef<string>("");

  useEffect(() => {
    if (!showNumber || guessResults.length === 0) return;
    if (lastSavedSignatureRef.current === gameSignature) return;

    const record: ScoreRecord = {
      id: generateId(8),
      name: playerName,
      score: calculateGameScore({
        guessResults,
        guessLimit,
        initialTimeLimit,
        timeLeft,
        difficultLevel,
      }),
      result: didWin ? "win" : "lose",
      attempts: guessResults.length,
      timeTaken: initialTimeLimit - timeLeft,
      date: new Date(),
      guessLimit,
      difficultLevel,
      guessResults,
    };

    startTransition(() => {
      addScoreRecord(record);
    });
    lastSavedSignatureRef.current = gameSignature;
  }, [
    addScoreRecord,
    difficultLevel,
    didWin,
    gameSignature,
    guessLimit,
    guessResults,
    initialTimeLimit,
    playerName,
    showNumber,
    timeLeft,
  ]);

  useEffect(() => {
    if (rememberSessionOnce("analytics-game-open")) {
      analytics.track("game_open", {});
    }

    actionsValue.startGame();
  }, [actionsValue.startGame]);

  useEffect(() => {
    if (!showNumber) return;

    const durationMs = Math.max(0, (initialTimeLimit - timeLeft) * 1000);
    const score = calculateGameScore({
      guessResults,
      guessLimit,
      initialTimeLimit,
      timeLeft,
      difficultLevel,
    });

    if (didWin && !completionTrackedRef.current) {
      completionTrackedRef.current = true;
      analytics.track("game_complete", {
        score,
        attempts: guessResults.length,
        durationMs,
      });
      return;
    }

    if (!didWin && !abandonTrackedRef.current) {
      abandonTrackedRef.current = true;
      analytics.track("game_abandon", {
        durationMs,
        level: difficultLevel,
      });
    }
  }, [difficultLevel, didWin, guessResults, guessLimit, initialTimeLimit, showNumber, timeLeft]);

  const statusValue = useMemo(
    () => ({ randomNumber, showNumber, started, playerName, didWin }),
    [didWin, playerName, randomNumber, showNumber, started],
  );

  const progressValue = useMemo(() => ({ guessTurn, guessResults }), [guessTurn, guessResults]);
  const timerValue = useMemo(() => ({ timeLeft }), [timeLeft]);

  return (
    <GuessNumActionsContext.Provider value={actionsValue}>
      <GuessNumTimerContext.Provider value={timerValue}>
        <GuessNumStatusContext.Provider value={statusValue}>
          <GuessNumProgressContext.Provider value={progressValue}>
            {children}
          </GuessNumProgressContext.Provider>
        </GuessNumStatusContext.Provider>
      </GuessNumTimerContext.Provider>
    </GuessNumActionsContext.Provider>
  );
};

export function useGuessNumStatus(): GuessNumStatusContextType {
  const ctx = useContext(GuessNumStatusContext);
  if (!ctx) throw new Error("useGuessNumStatus must be used within GuessNumProvider");
  return ctx;
}

export function useGuessNumProgress(): GuessNumProgressContextType {
  const ctx = useContext(GuessNumProgressContext);
  if (!ctx) throw new Error("useGuessNumProgress must be used within GuessNumProvider");
  return ctx;
}

export function useGuessNumTimer(): GuessNumTimerContextType {
  const ctx = useContext(GuessNumTimerContext);
  if (!ctx) throw new Error("useGuessNumTimer must be used within GuessNumProvider");
  return ctx;
}

export function useGuessNumActions(): GuessNumActionsContextType {
  const ctx = useContext(GuessNumActionsContext);
  if (!ctx) throw new Error("useGuessNumActions must be used within GuessNumProvider");
  return ctx;
}

export function useGuessNum() {
  return {
    ...useGuessNumStatus(),
    ...useGuessNumProgress(),
    ...useGuessNumTimer(),
    ...useGuessNumActions(),
  };
}

export type {
  GuessNumActionsContextType,
  GuessNumProgressContextType,
  GuessNumStatusContextType,
  GuessNumTimerContextType,
} from "./game.types";
