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
}

export type GameAction =
  | {
      type: 'RESET_GAME';
      payload: { randomNumber: number; guessLimit: number };
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
    };

export const initialGameState = (guessLimit: number): GameState => ({
  randomNumber: null,
  guessResults: [],
  showNumber: false,
  guessTurn: guessLimit,
  started: false,
  playerName: '',
  didWin: false,
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

    default:
      return state;
  }
}
