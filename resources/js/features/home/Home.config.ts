import type { ComponentType } from 'react';
import { lazy } from 'react';

const AboutSection = lazy(() => import('./sections/AboutSection'));
const ContactSection = lazy(() => import('./sections/ContactSection'));
const GameSection = lazy(() => import('./sections/GameSection'));
const HeroSection = lazy(() => import('./sections/hero/HeroSection'));
const PortfolioSection = lazy(() => import('./sections/PortfolioSection'));
const SkillsSection = lazy(() => import('./sections/SkillsSection'));

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

export const sectionClassName =
  'scroll-mt-24 min-h-[calc(100dvh)] flex flex-col justify-center items-center';
