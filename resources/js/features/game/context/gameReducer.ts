// @/context/gameReducer.ts
import type { GuessResultType } from '../types/guessNumContextTypes';

export interface GameState {
  randomNumber: number | null;
  guessResults: GuessResultType[];
  showNumber: boolean;
  guessTurn: number;
  started: boolean;
  playerName: string;
  didWin: boolean;
  // Prevent duplicate persistence when unrelated settings change after game completion.
  scoreSaved: boolean;
  // Snapshot the game settings at the time the game started so score records remain accurate
  // even if the difficulty changes after the game is over.
  gameSettings: {
    guessLimit: number;
    initialTimeLimit: number;
    difficultLevel: string;
    maxNumber: number;
  };
}

export type GameAction =
  | {
      type: 'RESET_GAME';
      payload: { randomNumber: number; guessLimit: number; initialTimeLimit: number; difficultLevel: string; maxNumber: number };
    }
  | {
      type: 'MAKE_GUESS';
      payload: GuessResultType;
    }
  | {
      type: 'REVEAL_NUMBER';
    }
  | {
      type: 'SET_STARTED';
      payload: boolean;
    }
  | {
      type: 'SET_PLAYER_NAME';
      payload: string;
    }
  | {
      type: 'MARK_SCORE_SAVED';
    };

export const initialGameState = (guessLimit: number, initialTimeLimit: number, difficultLevel: string, maxNumber: number): GameState => ({
  randomNumber: null,
  guessResults: [],
  showNumber: false,
  guessTurn: guessLimit,
  started: false,
  playerName: '',
  didWin: false,
  scoreSaved: false,
  gameSettings: {
    guessLimit,
    initialTimeLimit,
    difficultLevel,
    maxNumber,
  },
});

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESET_GAME':
      return {
        ...state,
        randomNumber: action.payload.randomNumber,
        guessResults: [],
        showNumber: false,
        guessTurn: action.payload.guessLimit,
        started: false,
        didWin: false,
        scoreSaved: false,
        gameSettings: {
          guessLimit: action.payload.guessLimit,
          initialTimeLimit: action.payload.initialTimeLimit,
          difficultLevel: action.payload.difficultLevel,
          maxNumber: action.payload.maxNumber,
        },
      };

    case 'MAKE_GUESS': {
      const nextTurns = Math.max(state.guessTurn - 1, 0);
      const didWin = action.payload.message === 'you win';
      const willShow = didWin || nextTurns === 0;
      return {
        ...state,
        guessResults: [...state.guessResults, action.payload],
        guessTurn: nextTurns,
        showNumber: willShow,
        didWin,
      };
    }

    case 'REVEAL_NUMBER':
      return { ...state, showNumber: true, didWin: false };

    case 'SET_STARTED':
      return { ...state, started: action.payload };

    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload };

    case 'MARK_SCORE_SAVED':
      return { ...state, scoreSaved: true };

    default:
      return state;
  }
}
