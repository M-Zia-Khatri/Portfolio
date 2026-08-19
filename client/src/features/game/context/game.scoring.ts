import type { GuessResultType } from "../types/guessNumContextTypes";

export function calculateGameScore({
  guessResults,
  guessLimit,
  initialTimeLimit,
  timeLeft,
  difficultLevel,
}: {
  guessResults: GuessResultType[];
  guessLimit: number;
  initialTimeLimit: number;
  timeLeft: number;
  difficultLevel: string;
}): number {
  const attemptScore = guessResults.length ? (guessLimit / guessResults.length) * 100 : 0;
  const timeScore = initialTimeLimit ? (timeLeft / initialTimeLimit) * 100 : 0;
  const closeBonus = guessResults.reduce((sum, { message }) => {
    return message === "very close" ? sum + 10 : sum;
  }, 0);
  const levelBonus =
    {
      easy: 100,
      normal: 200,
      hard: 400,
      "very-hard": 800,
      custom: 300,
    }[difficultLevel] ?? 0;

  return attemptScore + timeScore + closeBonus + levelBonus;
}
