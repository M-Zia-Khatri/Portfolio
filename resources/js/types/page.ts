import type { ContactMessageData, PaginationMetaData, PortfolioItemData, SharedAuthData, SharedQuoteData, SkillData } from './generated';

export type FlashProps = {
  success?: string;
  status?: string;
  error?: string;
};

export type AppPageProps<TPageProps extends Record<string, unknown> = Record<string, unknown>> = TPageProps & {
  name: string;
  quote: SharedQuoteData;
  auth: SharedAuthData;
  flash?: FlashProps;
  errors: Record<string, string>;
};

export type HomePageProps = AppPageProps<{
  skills: SkillData[];
  contactSkills: SkillData[];
  portfolioItems: PortfolioItemData[];
}>;

export type AdminSkillsPageProps = AppPageProps<{
  skills?: SkillData[];
  skill?: SkillData;
  filters?: { mode: string };
  create?: boolean;
  edit?: boolean;
}>;

export type PortfolioPageProps = AppPageProps<{
  portfolioItems: PortfolioItemData[];
  portfolioItem?: PortfolioItemData;
}>;

export type ContactMessagesPageProps = AppPageProps<{
  contacts: ContactMessageData[];
  meta: PaginationMetaData;
}>;
