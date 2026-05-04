import { TEXT } from '@/shared/constants/style.constants';
import { scrollToTarget } from '@/shared/lib/lenis';
import { Link, Text } from '@radix-ui/themes';
import { motion, type Variants } from 'motion/react';
import React from 'react';
import type { NavItem } from './TopBar.types';

const itemVariants: Variants = {
  initial: { y: 0, opacity: 0.9, fontWeight: 400 },
  hover: {
    y: -5,
    opacity: 1,
    fontWeight: 500,
    scale: 1.02,
    margin: '0 1%',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

const underlineVariants: Variants = {
  initial: { scaleX: 0, opacity: 0 },
  hover: {
    scaleX: 1,
    opacity: 1,
    transition: { delay: 0.1, duration: 0.3, ease: 'easeIn' },
  },
};

function TopBarItemImpl({ item }: { item: NavItem }) {
  return (
    <motion.li
      key={item.label}
      initial="initial"
      whileHover="hover"
      className="relative list-none"
      variants={itemVariants}
    >
      <Link asChild underline="none">
        <a
          href={item.href}
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget(`#${item.sectionId}`);
          }}
          className="relative inline-flex items-center pb-1"
        >
          <Text size={TEXT.base.size} className="text-white">
            {item.label}
          </Text>
          <motion.span
            variants={underlineVariants}
            className="absolute right-0 -bottom-0.5 left-0 h-0.5 origin-left rounded-full"
            style={{ backgroundColor: 'var(--blue-9)' }}
          />
        </a>
      </Link>
    </motion.li>
  );
}

export const TopBarItem = React.memo(TopBarItemImpl);
