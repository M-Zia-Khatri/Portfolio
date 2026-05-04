import {
  CheckHiddenNumber,
  Feedback,
  GuessResult,
  HiddenNumber,
  ScoreHistory,
  ViewDelHistory,
} from '@/features/game/components';
import { GuessNumProvider } from '@/features/game/context/GuessNumContext';
import SecComponent from '@/shared/components/SecContainer';
import { HEADING } from '@/shared/constants/style.constants';
import { Card, Heading } from '@radix-ui/themes';

export default function GameSection() {
  return (
    <SecComponent className="min-h-dvh w-full lg:h-dvh" height={{ lg: '100%' }} py={'8'}>
      <GuessNumProvider>
        <div className="flex h-full w-full flex-col gap-6 lg:flex-row">
          {/* Left: Results Summary (desktop only) */}
          <aside className="hidden w-full lg:flex lg:w-1/4">
            <Card size={'2'} className="flex h-full w-full flex-col">
              <GuessResult />
            </Card>
          </aside>

          {/* Mobile feedback toast */}
          <div className="lg:hidden">
            <Feedback />
          </div>

          {/* Center: Game Area */}
          <section className="flex flex-1 flex-col gap-4">
            <Card size={'2'} className="w-full text-center">
              <Heading as="h2" size={HEADING.h2.size} className="font-bold">
                Guess the number
              </Heading>
            </Card>

            {/* Hidden Number + Timer */}
            <Card size={'3'}>
              <HiddenNumber />
            </Card>

            {/* Guess Buttons */}
            <Card size={'2'} className="flex-1 overflow-auto">
              <CheckHiddenNumber />
            </Card>
          </section>

          {/* Right: Score History */}
          <aside className="w-full lg:w-1/3">
            <Card size={'2'} className="flex h-full flex-col justify-between gap-4">
              <div className="flex-1 overflow-hidden">
                <ScoreHistory />
              </div>
              <ViewDelHistory />
            </Card>
          </aside>
        </div>
      </GuessNumProvider>
    </SecComponent>
  );
}
