import { TEXT } from '@/shared/constants/style.constants';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { Badge, Callout, Card, Separator, Strong, Text } from '@radix-ui/themes';
import { memo } from 'react';
import { useGuessNumStatus, useGuessNumProgress } from '../context/GuessNumContext';

const feedbackColor = (message: string) => {
  if (message === 'you win') return 'green';
  if (message === 'very close') return 'amber';
  if (message === 'too low') return 'blue';
  return 'red';
};

// ─────────────────────────────────────────────────────────
// Guesses Left - Split into static + dynamic parts
// ─────────────────────────────────────────────────────────

const GuessesLeftLabel = memo(function GuessesLeftLabel() {
  return (
    <Text size={TEXT.lg.size} style={{ color: 'var(--gray-11)' }}>
      Guesses left:{' '}
    </Text>
  );
});

const GuessesLeftValue = memo(function GuessesLeftValue() {
  const { guessTurn } = useGuessNumProgress();
  return (
    <Text
      size={TEXT.lg.size}
      className="font-black"
      style={{
        color: guessTurn <= 2 ? 'var(--red-11)' : 'var(--blue-11)',
      }}
    >
      {guessTurn}
    </Text>
  );
});

function GuessesLeft() {
  return (
    <Card
      // variant="go"
      className="px-4 py-3 text-center"
      // style={{ background: "var(--gray-3)" }}
    >
      <GuessesLeftLabel />
      <GuessesLeftValue />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// Guess History - Extract item to prevent full list re-renders
// ─────────────────────────────────────────────────────────

interface GuessHistoryItemProps {
  index: number;
  guess: number;
  message: string;
}

const GuessHistoryItem = memo(function GuessHistoryItem({
  index,
  guess,
  message,
}: GuessHistoryItemProps) {
  const color = feedbackColor(message) as any;
  return (
    <Card
      size={'1'}
      className="flex items-center justify-between"
      // style={{ background: "var(--gray-3)", border: "1px solid var(--gray-5)" }}
    >
      <Text size={TEXT.base.size} weight="medium">
        #{index + 1} <span className="text-(--blue-11)"> — </span> <Strong>{guess}</Strong>
      </Text>
      <Badge className="px-2.5" color={color} variant="soft" radius="full">
        {message}
      </Badge>
    </Card>
  );
});

function GuessHistoryList() {
  const { guessResults } = useGuessNumProgress();

  if (guessResults.length === 0) {
    return (
      <Text size={TEXT.base.size} className="mt-4 text-center font-medium italic">
        No guesses yet.
      </Text>
    );
  }

  return (
    <>
      {guessResults.map((result, i) => (
        <GuessHistoryItem
          key={`${result.guess}-${i}`}
          index={i}
          guess={result.guess}
          message={result.message}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export default function GuessResult() {
  const { showNumber, randomNumber, didWin } = useGuessNumStatus();

  return (
    <div className="flex h-full flex-col gap-4">
      <GuessesLeft />

      <Separator size="4" className="h-0.375" />

      {/* Guess history */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        <GuessHistoryList />
      </div>

      {/* Final outcome */}
      {showNumber && randomNumber != null && (
        <Callout.Root color={didWin ? 'green' : 'red'} variant="surface">
          <Callout.Icon>{didWin ? <CheckCircledIcon /> : <CrossCircledIcon />}</Callout.Icon>
          <Callout.Text>
            {didWin ? '🎉 You Win!' : '😢 You Lose!'} The number was <strong>{randomNumber}</strong>
          </Callout.Text>
        </Callout.Root>
      )}
    </div>
  );
}
