import type { ComponentType } from "react";
import { lazy } from "react";
import { HeroSection } from "./sections";
import {
  AboutSkeleton,
  ContactSkeleton,
  GameSkeleton,
  HeroSkeleton,
  PortfolioSkeleton,
  SkillsSkeleton,
} from "./loaders";

const AboutSection = lazy(() => import("./sections/AboutSection"));
const ContactSection = lazy(() => import("./sections/ContactSection"));
const GameSection = lazy(() => import("./sections/GameSection"));
const PortfolioSection = lazy(() => import("./sections/PortfolioSection"));
const SkillsSection = lazy(() => import("./sections/SkillsSection"));

export type SectionConfig = {
  id: string;
  Component: ComponentType;
  Loader?: ComponentType;
};

export const sections: SectionConfig[] = [
  { id: "home", Component: HeroSection, Loader: HeroSkeleton },
  { id: "about", Component: AboutSection, Loader: AboutSkeleton },
  { id: "skills", Component: SkillsSection, Loader: SkillsSkeleton },
  { id: "portfolio", Component: PortfolioSection, Loader: PortfolioSkeleton },
  { id: "game", Component: GameSection, Loader: GameSkeleton },
  { id: "contact", Component: ContactSection, Loader: ContactSkeleton },
];

export const sectionClassName =
  "scroll-mt-24 min-h-[calc(100dvh)] flex flex-col justify-center items-center";
