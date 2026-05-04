import { TEXT } from '@/shared/constants/style.constants';
import { Button, Text } from '@radix-ui/themes';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const MagneticShinyButton = () => {
  const ref = useRef<HTMLAnchorElement | null>(null);

  // Cursor position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics
  const springX = useSpring(x, { stiffness: 150, damping: 12 });
  const springY = useSpring(y, { stiffness: 150, damping: 12 });

  // Glow intensity based on distance
  const glow = useTransform(y, [-20, 0, 20], [0.2, 0.4, 0.2]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.2;
    const deltaY = (e.clientY - centerY) * 0.3;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Button asChild radius="full" color="gray" className="shrink-0">
      <motion.a
        ref={ref}
        href="mailto:muhammadziakhatri@gmail.com"
        className="relative overflow-hidden md:inline-flex items-center justify-center px-5 py-2 text-center hidden"
        style={{
          x: springX,
          y: springY,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        initial="rest"
        animate="rest"
      >
        {/* Glow */}
        <motion.span
          style={{ opacity: glow }}
          className="absolute inset-0 rounded-full bg-[var(--blue-4)] blur-md z-0"
        />

        {/* Shine */}
        <motion.span
          initial={{ x: '-120%', skewX: '-18deg' }}
          animate={{ x: '500%' }}
          transition={{
            duration: 1.4,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="pointer-events-none absolute top-0 left-0 h-full w-[20%]    bg-linear-to-r from-transparent via-(--blue-10) to-transparent    opacity-60 blur-sm z-20"
        />

        {/* Text */}
        <motion.span className="relative z-30 flex items-center justify-center w-full h-full text-center">
          <Text size={TEXT.lg.size} weight="bold" className="leading-none text-white">
            Let&apos;s Talk
          </Text>
        </motion.span>
      </motion.a>
    </Button>
  );
};
