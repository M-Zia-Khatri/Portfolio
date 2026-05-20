import type { ComponentType } from "react";
import { lazy } from "react";

const AboutSection = lazy(() => import("./sections/AboutSection"));
const ContactSection = lazy(() => import("./sections/ContactSection"));
const GameSection = lazy(() => import("./sections/GameSection"));
const HeroSection = lazy(() => import("./sections/hero/HeroSection"));
const PortfolioSection = lazy(() => import("./sections/PortfolioSection"));
const SkillsSection = lazy(() => import("./sections/SkillsSection"));

export type SectionConfig = {
  id: string;
  Component: ComponentType;
  Loader?: ComponentType;
};

const AboutLoader = () => (
  <div className="animate-pulse text-sm text-gray-11">Loading About...</div>
);

const SkillsLoader = () => (
  <div className="animate-pulse text-sm text-gray-11">Loading Skills...</div>
);

const PortfolioLoader = () => (
  <div className="animate-pulse text-sm text-gray-11">Loading Portfolio...</div>
);

const GameLoader = () => <div className="animate-pulse text-sm text-gray-11">Loading Game...</div>;

const ContactLoader = () => (
  <div className="animate-pulse text-sm text-gray-11">Loading Contact...</div>
);

export const sections: SectionConfig[] = [
  { id: "home", Component: HeroSection },
  { id: "about", Component: AboutSection, Loader: AboutLoader },
  { id: "skills", Component: SkillsSection, Loader: SkillsLoader },
  { id: "portfolio", Component: PortfolioSection, Loader: PortfolioLoader },
  { id: "game", Component: GameSection, Loader: GameLoader },
  { id: "contact", Component: ContactSection, Loader: ContactLoader },
];

export const sectionClassName =
  "scroll-mt-24 min-h-[calc(100dvh)] flex flex-col justify-center items-center";
