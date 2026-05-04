import { TEXT } from '@/shared/constants/style.constants';
import { Button, Text, TextField } from '@radix-ui/themes';
import { Timer } from 'lucide-react';
import { memo, useRef } from 'react';
import {
  useGuessNumActions,
  useGuessNumStatus,
  useGuessNumTimer,
} from '../context/GuessNumContext';
import LevelSelector from './LevelSelector';

const timerTextClassName = 'flex items-center font-extrabold';
const centeredPanelClassName = 'flex flex-col items-center gap-3 text-center';

const TimerDisplay = memo(function TimerDisplay() {
  const { started, showNumber } = useGuessNumStatus();
  const { timeLeft } = useGuessNumTimer();

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const formattedTime = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const isUrgent = timeLeft <= 30 && started && !showNumber;

  return (
    <Text size={TEXT.lg.size} className={timerTextClassName} color={isUrgent ? 'red' : 'blue'}>
      <Timer size={16} />
      &nbsp; {formattedTime}
    </Text>
  );
});

const StartControls = memo(function StartControls() {
  const { started, showNumber, playerName } = useGuessNumStatus();
  const { startGame, setStarted } = useGuessNumActions();
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const nameDraftRef = useRef(playerName);

  if (started || showNumber) return null;

  const handleStart = () => {
    const name = nameDraftRef.current.trim();
    if (!name) return;
    startGame(name);
    setStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <TextField.Root
        placeholder="Enter your name"
        defaultValue={playerName}
        onChange={(e) => {
          const nextValue = e.target.value;
          nameDraftRef.current = nextValue;
          if (startButtonRef.current) {
            startButtonRef.current.disabled = nextValue.trim().length === 0;
          }
        }}
        size="3"
        style={{ maxWidth: 280, width: '100%' }}
      />
      <Button
        size="3"
        variant="solid"
        color="blue"
        onClick={handleStart}
        // disabled={!playerName.trim()}
        ref={startButtonRef}
        style={{ minWidth: 120 }}
      >
        Start
      </Button>
    </div>
  );
});

const HiddenBall = memo(function HiddenBall() {
  const { started, showNumber, randomNumber, didWin } = useGuessNumStatus();

  if (!started) return null;

  const hiddenBallStyle = showNumber
    ? {
        background: didWin ? 'var(--green-4)' : 'var(--red-4)',
        color: didWin ? 'var(--green-11)' : 'var(--red-11)',
        border: `3px solid ${didWin ? 'var(--green-7)' : 'var(--red-7)'}`,
        boxShadow: `0 0 32px ${didWin ? 'var(--green-a6)' : 'var(--red-a6)'}`,
      }
    : {
        background: 'var(--blue-4)',
        color: 'transparent',
        border: '3px solid var(--blue-7)',
        boxShadow: '0 0 32px var(--blue-a5)',
      };

  return (
    <div className="flex justify-center">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full text-5xl font-extrabold transition-all duration-500"
        style={hiddenBallStyle}
      >
        {showNumber ? randomNumber : '??'}
      </div>
    </div>
  );
});

const PostGameResult = memo(function PostGameResult() {
  const { showNumber, didWin } = useGuessNumStatus();
  const { timeLeft } = useGuessNumTimer();
  const { restartGame } = useGuessNumActions();

  if (!showNumber) return null;

  const resultMessage = didWin
    ? '🎉 You got it!'
    : timeLeft === 0
      ? "⏰ Time's up — try again"
      : 'You lose — try again';

  return (
    <div className={centeredPanelClassName}>
      <Text size="4" weight="bold" style={{ color: didWin ? 'var(--green-11)' : 'var(--red-11)' }}>
        {resultMessage}
      </Text>
      <Button
        size="3"
        variant="solid"
        color={didWin ? 'green' : 'blue'}
        onClick={restartGame}
        style={{ minWidth: 140 }}
      >
        Play Again
      </Button>
    </div>
  );
});

export default function HiddenNumber() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <TimerDisplay />
        <LevelSelector />
      </div>
      <StartControls />
      <HiddenBall />
      <PostGameResult />
    </section>
  );
}
