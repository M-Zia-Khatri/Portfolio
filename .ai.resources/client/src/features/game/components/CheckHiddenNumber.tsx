import { Button } from '@radix-ui/themes';
import { memo, useMemo } from 'react';
import { useGuessNumActions, useGuessNumStatus, useGuessNumProgress } from '../context/GuessNumContext';
import useGameSet from '../store/GameSetStore';
import type { GuessResultType } from '../types/guessNumContextTypes';

type SpreadButtonProps = {
  number: number;
  disabled: boolean;
  result?: GuessResultType;
  onGuess: (guess: number) => void;
};

const SpreadButton = memo(function SpreadButton({ number, disabled, result, onGuess }: SpreadButtonProps) {
  const variant = (() => {
    if (!result) return { color: 'gray' as const, variant: 'soft' as const };
    if (result.message === 'you win') return { color: 'green' as const, variant: 'solid' as const };
    if (result.message === 'very close') return { color: 'amber' as const, variant: 'solid' as const };
    return { color: 'blue' as const, variant: 'soft' as const };
  })();

  return (
    <Button
      size="2"
      color={variant.color}
      variant={variant.variant}
      disabled={disabled}
      onClick={() => onGuess(number)}
      style={{
        width: 40,
        height: 40,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {number}
    </Button>
  );
});

export default function CheckHiddenNumber() {
  const { showNumber, started } = useGuessNumStatus();
  const { guessResults } = useGuessNumProgress();
  const { makeGuess } = useGuessNumActions();
  const maxNumber = useGameSet((state) => state.maxNumber);

  const numbers = useMemo(() => Array.from({ length: maxNumber }, (_, i) => i + 1), [maxNumber]);

  const resultMap = useMemo(() => {
    const map = new Map<number, GuessResultType>();
    for (const result of guessResults) {
      map.set(result.guess, result);
    }
    return map;
  }, [guessResults]);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {numbers.map((number) => {
        const result = resultMap.get(number);
        const disabled = Boolean(result) || showNumber || !started;

        return (
          <SpreadButton
            key={number}
            number={number}
            disabled={disabled}
            result={result}
            onGuess={makeGuess}
          />
        );
      })}
    </div>
  );
}
