import { BsTypescript } from "react-icons/bs";
import { FaCode, FaLinux } from "react-icons/fa";
import { FaCss3Alt, FaHtml5, FaLaravel, FaNodeJs, FaPhp, FaReact, FaSass } from "react-icons/fa6";
import { SiDocker, SiExpress, SiGit, SiGithub, SiMongodb, SiMysql } from "react-icons/si";

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  FaHtml5,
  FaCss3Alt,
  BsTypescript,
  FaReact,
  FaNodeJs,
  SiExpress,
  SiMysql,
  SiMongodb,
  FaPhp,
  FaSass,
  FaLaravel,
  SiGit,
  SiGithub,
  SiDocker,
  FaLinux,
  default: FaCode,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP).filter((k) => k !== "default");
