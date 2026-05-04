import { AppNavigation } from '@/shared/constants/navigation.constants';
import { TEXT } from '@/shared/constants/style.constants';
import { cn } from '@/shared/utils/cn';
import { Box, Card, Container, Link, Text } from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { MagneticShinyButton } from './MagneticShinyButton';
import { HIDE_DELAY_MS } from './TopBar.constants';
import { TopBarMobile } from './TopBarMobile';
import { TopBarNav } from './TopBarNav';

/** How long (ms) the user must keep scrolling DOWN before the bar hides */

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
}

export default function TopBar() {
  // ── scroll-hide logic ─────────────────────────────────────────────────────
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafId.current !== null) return;

      rafId.current = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastScrollY.current;

        if (scrollingDown) {
          if (!hideTimer.current) {
            hideTimer.current = setTimeout(() => {
              setHidden(true);
              hideTimer.current = null;
            }, HIDE_DELAY_MS);
          }
        } else {
          if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
          }
          setHidden(false);
        }

        lastScrollY.current = currentY;
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <Box asChild className="fixed top-4 z-50 w-full px-4">
      <header
        className={cn(
          'transition-transform duration-300 ease-out',
          hidden ? '-translate-y-[120%] opacity-0' : 'translate-y-0 opacity-100',
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        <Container size={{ initial: '3' }}>
          <Card
            asChild
            size="2"
            variant="surface"
            className={cn(
              'mx-auto flex w-full items-center rounded-full outline-2 -outline-offset-2 backdrop-blur-lg',
              'h-15 gap-4 px-8',
              'shadow-[0_2px_15px_color-mix(in_srgb,var(--blue-3),transparent_10%)]',
              'bg-(--blue-4)/20',
            )}
            style={{ outlineColor: 'var(--gray-6)' }}
          >
            <div className="flex w-full items-center justify-between gap-4">
              {/* Brand logo */}
              <Link asChild underline="none" className="shrink-0">
                <NavLink
                  to={AppNavigation.HOME}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('home');
                  }}
                  className="flex items-center gap-2"
                >
                  <Text size={TEXT.lg.size} weight="bold" className="text-white">
                    M.Zia Khatri
                  </Text>
                </NavLink>
              </Link>

              <TopBarNav />

              {/* Let's talk btn */}
              <MagneticShinyButton />

              <TopBarMobile />
            </div>
          </Card>
        </Container>
      </header>
    </Box>
  );
}
