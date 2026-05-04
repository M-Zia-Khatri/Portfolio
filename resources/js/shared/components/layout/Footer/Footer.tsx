import { AppNavigation } from '@/shared/constants/navigation.constants';
import { TEXT } from '@/shared/constants/style.constants';
import { Link, Strong, Text } from '@radix-ui/themes'; // ✅ Text from here, not callout
import type { ComponentType } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { FaFacebook, FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa6';
import { NavLink } from 'react-router';

const socialMedia: {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
}[] = [
  {
    icon: FaInstagram,
    href: 'https://instagram.com/m_zia_khatri',
    label: 'Instagram',
  },
  {
    icon: FaFacebook,
    href: 'https://www.facebook.com/profile.php?id=61579565593155',
    label: 'Facebook',
  },
  {
    icon: FaLinkedin,
    href: 'https://www.linkedin.com/in/muhammad-zia-khatri-1891ab390/',
    label: 'LinkedIn',
  },
  { icon: FaGithub, href: 'https://github.com/M-Zia-Khatri', label: 'GitHub' },
  { icon: FaWhatsapp, href: 'https://wa.me/923121070936', label: 'WhatsApp' },
];

export default function Footer() {
  return (
    <footer className="border-t border-(--blue-a2)/45 bg-(--blue-a2)/35 px-6 py-4">
      <div className="flex flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">
        {/* Brand / Logo */}
        <Link asChild underline="none" className="shrink-0">
          <NavLink to={AppNavigation.HOME} className="flex items-center gap-2">
            <Text size={TEXT.lg.size} weight="bold" className="text-(--blue-12)">
              Muhammad Zia Khatri
            </Text>
          </NavLink>
        </Link>

        {/* Social Media Icons */}
        <div className="flex items-center gap-4">
          {socialMedia.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-(--blue-11) transition duration-200 hover:-translate-y-0.5 hover:scale-110 hover:text-(--blue-12) active:scale-95"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <Text size="1" className="text-center text-(--blue-a11) sm:text-right">
          © 2026 <Strong>Muhammad Zia Khatri</Strong>. All Rights Reserved.
        </Text>
      </div>
    </footer>
  );
}
