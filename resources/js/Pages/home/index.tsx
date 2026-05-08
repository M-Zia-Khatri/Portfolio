import { SECTION_NAVIGATION_EVENT, scrollToTarget, startLenis, stopLenis, type SectionNavigationDetail } from '@/shared/lib/lenis';
import { cn } from '@/shared/utils/cn';
import { Spinner } from '@radix-ui/themes';
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { sectionClassName, sections } from './config';
import Footer from './Footer';
import TopBar from './TopBar/TopBar';

function getSectionIdFromHash() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return window.location.hash.slice(1);
  }
}

function DeferredSection({ id, className, children, eager = false }: { id: string; className: string; children: ReactNode; eager?: boolean }) {
  const [shouldRender, setShouldRender] = useState(eager);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (eager) {
      if (!shouldRender) {
        setShouldRender(true);
      }
      return;
    }

    if (shouldRender) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: '350px 0px', threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, shouldRender]);

  return (
    <section ref={ref} id={id} className={className}>
      {shouldRender ? children : <div className="h-full min-h-[inherit] w-full" aria-hidden="true" />}
    </section>
  );
}

export default function Home() {
  const sectionIds = useMemo(() => new Set(sections.map((section) => section.id)), []);
  const [forcedSectionIds, setForcedSectionIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();

    const initialSectionId = getSectionIdFromHash();

    return sectionIds.has(initialSectionId) ? new Set([initialSectionId]) : new Set();
  });

  useEffect(() => {
    startLenis();

    return () => {
      stopLenis();
    };
  }, []);

  useEffect(() => {
    const forceSection = (sectionId: string) => {
      if (!sectionIds.has(sectionId)) return;

      setForcedSectionIds((currentSectionIds) => {
        if (currentSectionIds.has(sectionId)) return currentSectionIds;

        return new Set(currentSectionIds).add(sectionId);
      });
    };

    const onSectionNavigation = (event: Event) => {
      const sectionId = (event as CustomEvent<SectionNavigationDetail>).detail?.sectionId;

      if (sectionId) {
        forceSection(sectionId);
      }
    };

    const onHashChange = () => {
      const sectionId = getSectionIdFromHash();
      forceSection(sectionId);

      if (sectionIds.has(sectionId)) {
        void scrollToTarget(`#${sectionId}`, { updateHash: false });
      }
    };

    window.addEventListener(SECTION_NAVIGATION_EVENT, onSectionNavigation);
    window.addEventListener('hashchange', onHashChange);

    onHashChange();

    return () => {
      window.removeEventListener(SECTION_NAVIGATION_EVENT, onSectionNavigation);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [sectionIds]);

  return (
    <>
      <TopBar />

      <div className="absolute top-0 left-0 -z-100 h-full w-full bg-[url(@/assets/images/bg-noise.png)] opacity-2.5" />
      <div className="absolute top-0 left-0 -z-90 h-full w-full bg-(--blue-3)/15" />

      <div className="mx-auto space-y-6">
        {sections.map((section) => {
          const SectionComponent = section.Component;
          const className = cn(section.id === 'home' ? 'mb-5 flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center' : sectionClassName);

          return (
            <DeferredSection key={section.id} id={section.id} className={className} eager={section.id === 'home' || forcedSectionIds.has(section.id)}>
              <Suspense fallback={<Spinner />}>
                <SectionComponent />
              </Suspense>
            </DeferredSection>
          );
        })}
      </div>

      <Footer />
    </>
  );
}
