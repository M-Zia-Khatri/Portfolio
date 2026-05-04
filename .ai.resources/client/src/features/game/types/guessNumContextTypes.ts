/** Possible feedback for a guess */
export type GuessFeedback = 'too low' | 'too high' | 'very close' | 'you win';

/** A single guess + feedback */
export interface GuessResultType {
  message: GuessFeedback;
  guess: number;
}
