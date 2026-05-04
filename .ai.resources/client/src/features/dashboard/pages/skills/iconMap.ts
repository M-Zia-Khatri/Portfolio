import { BsTypescript } from 'react-icons/bs';
import { FaCode, FaLinux } from 'react-icons/fa';
import { FaCss3Alt, FaHtml5, FaLaravel, FaNodeJs, FaPhp, FaReact } from 'react-icons/fa6';
import { SiDocker, SiExpress, SiGit, SiGithub, SiMongodb, SiMysql } from 'react-icons/si';

// Keys must exactly match the `icon` string stored in the database.
// When adding a new icon: add it here AND pick the same key in the admin form.
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
  FaLaravel,
  SiGit,
  SiGithub,
  SiDocker,
  FaLinux,
  // fallback — must always exist
  default: FaCode,
};

// Used to populate the icon <Select> in SkillDialog.
export const ICON_OPTIONS = Object.keys(ICON_MAP).filter((k) => k !== 'default');
