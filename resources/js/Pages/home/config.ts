import type { ComponentType } from 'react';
import { lazy } from 'react';

const AboutSection = lazy(() => import('../../features/home/sections/AboutSection'));
const ContactSection = lazy(() => import('../../features/home/sections/ContactSection'));
const GameSection = lazy(() => import('../../features/home/sections/GameSection'));
const HeroSection = lazy(() => import('../../features/home/sections/hero/HeroSection'));
const PortfolioSection = lazy(() => import('../../features/home/sections/PortfolioSection'));
const SkillsSection = lazy(() => import('../../features/home/sections/SkillsSection'));

export type SectionConfig = {
  id: string;
  Component: ComponentType;
};

export const sections: SectionConfig[] = [
  { id: 'home', Component: HeroSection },
  { id: 'about', Component: AboutSection },
  { id: 'skills', Component: SkillsSection },
  { id: 'portfolio', Component: PortfolioSection },
  { id: 'game', Component: GameSection },
  { id: 'contact', Component: ContactSection },
];

export const sectionClassName = 'scroll-mt-24 min-h-[calc(100dvh)] flex flex-col justify-center items-center';
