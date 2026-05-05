import { AppNavigation } from '@/shared/constants/navigation.constants';
import type { NavItem } from './TopBar.types';

export const navItems: NavItem[] = [
  { label: 'Home', href: AppNavigation.HOME, sectionId: 'home' },
  { label: 'About', href: AppNavigation.ABOUT, sectionId: 'about' },
  { label: 'Skills', href: AppNavigation.SKILLS, sectionId: 'skills' },
  { label: 'Portfolio', href: AppNavigation.PORTFOLIO, sectionId: 'portfolio' },
  { label: 'Contact', href: AppNavigation.CONTACT, sectionId: 'contact' },
] as const;

export const HIDE_DELAY_MS = 4000;
