import { Flex, Spinner, Text } from '@radix-ui/themes';
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useHasVisited } from './hooks/useHasVisited';

function LandingPage() {
  const navigate = useNavigate();
  const { hasVisited, hydrated, markVisited } = useHasVisited();

  useEffect(() => {
    if (!hydrated) return;

    if (hasVisited) {
      navigate('/home', { replace: true });
      return;
    }

    markVisited();
    const timer = window.setTimeout(() => navigate('/home', { replace: true }), 700);

    return () => window.clearTimeout(timer);
  }, [hasVisited, hydrated, markVisited, navigate]);

  return (
    <Flex align="center" justify="center" direction="column" gap="3" className="min-h-dvh">
      <Spinner size="3" />
      <Text size="2" color="gray">
        Loading...
      </Text>
    </Flex>
  );
}

export default memo(LandingPage);
