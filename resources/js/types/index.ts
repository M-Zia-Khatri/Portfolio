import type { LucideIcon } from 'lucide-react';
import type { AppPageProps } from './page';

export type {
  ContactMessageData,
  PaginationMetaData,
  PortfolioItemData,
  SharedAuthData,
  SharedAuthUserData,
  SharedQuoteData,
  SkillCommandData,
  SkillData,
} from './generated';
export type { AdminSkillsPageProps, AppPageProps, ContactMessagesPageProps, HomePageProps, PortfolioPageProps } from './page';

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export type SharedData = AppPageProps;
