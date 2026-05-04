import { memo } from 'react';
import { useGuessNumStatus } from '../context/GuessNumContext';
import SelDifficultLevel from './SelDifficultLevel';

const LevelSelector = memo(function LevelSelector() {
  const { started, showNumber } = useGuessNumStatus();

  const selectorStyle = {
    opacity: started && !showNumber ? 0.4 : 1,
    pointerEvents: started && !showNumber ? ('none' as const) : ('auto' as const),
  };

  return (
    <div
      style={selectorStyle}
    >
      <SelDifficultLevel />
    </div>
  );
});

export default LevelSelector;
