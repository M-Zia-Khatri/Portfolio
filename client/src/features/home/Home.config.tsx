import type { ComponentType } from "react";
import { lazy } from "react";
import AboutSkeleton from "./loaders/AboutSkeleton";
import ContactSkeleton from "./loaders/ContactSkeleton";
import GameSkeleton from "./loaders/GameSkeleton";
import HeroSkeleton from "./loaders/HeroSkeleton";
import PortfolioSkeleton from "./loaders/PortfolioSkeleton";
import SkillsSkeleton from "./loaders/SkillsSkeleton";

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
