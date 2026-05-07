import { startLenis, stopLenis } from '@/shared/lib/lenis';
import { useEffect } from 'react';
import Footer from '../../../Pages/home/Footer';
import TopBar from '../../../Pages/home/TopBar/TopBar';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  useEffect(() => {
    startLenis();

    return () => {
      stopLenis();
    };
  }, []);

  return (
    <>
      <TopBar />
      {children}
      <Footer />
    </>
  );
}
