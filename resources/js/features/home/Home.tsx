import SEO from '@/shared/components/SEO';
import { cn } from '@/shared/utils/cn';
import { Spinner } from '@radix-ui/themes';
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { sectionClassName, sections } from './Home.config';

function DeferredSection({
  id,
  className,
  children,
  eager = false,
}: {
  id: string;
  className: string;
  children: ReactNode;
  eager?: boolean;
}) {
  const [shouldRender, setShouldRender] = useState(eager);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (eager || shouldRender) return;

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
      {shouldRender ? (
        children
      ) : (
        <div className="h-full min-h-[inherit] w-full" aria-hidden="true" />
      )}
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SEO
        title="Muhammad Zia khatri | Full Stack Developer"
        description="Mohammad Zia Khatri - Full Stack Developer specializing in React, Node.js, TypeScript, and modern web technologies. Building scalable, performant applications with clean code. Hire me for your next project."
        canonical="https://zia-khatri.vercel.app/home"
      />
      <div className="absolute top-0 left-0 -z-100 h-full w-full bg-[url(@/assets/images/bg-noise.png)] opacity-2.5" />
      <div className="absolute top-0 left-0 -z-90 h-full w-full bg-(--blue-3)/15" />

      <div className="mx-auto space-y-6">
        {sections.map((section) => {
          const SectionComponent = section.Component;
          const className = cn(
            section.id === 'home'
              ? 'mb-5 flex h-[calc(100dvh)] scroll-mt-24 flex-col justify-center'
              : sectionClassName,
          );

          return (
            <DeferredSection
              key={section.id}
              id={section.id}
              className={className}
              eager={section.id === 'home'}
            >
              <Suspense fallback={<Spinner />}>
                <SectionComponent />
              </Suspense>
            </DeferredSection>
          );
        })}
      </div>
    </>
  );
}
