import ContactCodeCard from '@/features/contact/public/ContactCodeCard';
import ContactFormCard from '@/features/contact/public/ContactForm';
import SecComponent from '@/shared/components/SecContainer';
import { useGsapStagger } from '@/shared/hooks/useGsapAnimations';
import { Flex } from '@radix-ui/themes';
import { useRef } from 'react';
import { useSectionActive } from '../hooks/useSectionActive';

export default function ContactSection() {
  const isSectionActive = useSectionActive('contact');
  const sectionRef = useRef<HTMLDivElement>(null);

  useGsapStagger(sectionRef, '[data-gsap="contact-card"]', { y: 24, stagger: 0.12, duration: 0.5 });

  return (
    <SecComponent className="w-full">
      <Flex ref={sectionRef} direction="column" align="center" gap="2">
        <div className="mt-4 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <ContactFormCard />

          <div
            data-gsap="contact-card"
            className="hidden flex-col justify-center lg:flex"
            style={{ perspective: 900 }}
          >
            <ContactCodeCard isActive={isSectionActive} />
          </div>
        </div>
      </Flex>
    </SecComponent>
  );
}
