import { CheckCircledIcon, Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useGuessNumProgress } from '../context/GuessNumContext';

export default function Feedback() {
  const { guessResults } = useGuessNumProgress();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (guessResults.length === 0) return;

    const last = guessResults[guessResults.length - 1];
    setMessage(last.message);
    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [guessResults]);

  if (!visible) return null;

  const isWin = message === 'you win';
  const isClose = message === 'very close';

  const color = isWin ? 'green' : isClose ? 'amber' : 'blue';
  const Icon = isWin ? CheckCircledIcon : isClose ? InfoCircledIcon : Cross2Icon;
  const displayMessage =
    {
      'you win': 'You win',
      'very close': 'Very close',
      'too low': 'Too low',
      'too high': 'Too high',
    }[message] ?? message;

  return (
    <div className="fixed top-8 left-1/2 z-50 w-fit min-w-48 -translate-x-1/2">
      <Callout.Root color={color} variant="surface" size="2">
        <Callout.Icon>
          <Icon />
        </Callout.Icon>
        <Callout.Text className="font-medium">{displayMessage}</Callout.Text>
      </Callout.Root>
    </div>
  );
}
