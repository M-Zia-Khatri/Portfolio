import { startLenis, stopLenis } from '@/shared/lib/lenis';
import { useEffect } from 'react';
import { Outlet } from 'react-router';
import Footer from '../../../Pages/home/Footer';
import TopBar from '../../../Pages/home/TopBar/TopBar';

export default function AppLayout() {
  useEffect(() => {
    startLenis();

    return () => {
      stopLenis();
    };
  }, []);

  return (
    <>
      <TopBar />
      <Outlet />
      <Footer />
    </>
  );
}
