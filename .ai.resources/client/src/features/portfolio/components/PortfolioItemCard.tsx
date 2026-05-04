import { BorderTrail } from '@/shared/components/motion-primitives/border-trail';
import { HEADING, TEXT } from '@/shared/constants/style.constants';
import { cn } from '@/shared/utils/cn';
import { AspectRatio, Badge, Flex, Heading, Text } from '@radix-ui/themes';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { animate, motion, useMotionValue, useTransform, type Variants } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PortfolioItem } from '../types';

interface PortfolioItemCardProps {
  item: PortfolioItem;
}

const backItemVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.18 + i * 0.08,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function PortfolioItemCard({ item }: PortfolioItemCardProps) {
  const rotateY = useMotionValue(0);
  const isFlipped = useRef(false);
  const [flipped, setFlipped] = useState(false);

  // Grid refs
  const gridBaseRef = useRef<HTMLDivElement>(null);
  const gridShineLeadRef = useRef<HTMLDivElement>(null);
  const gridShineTrailRef = useRef<HTMLDivElement>(null);

  // Store tweens so we can pause/resume/kill them individually
  const shineTlRef = useRef<gsap.core.Timeline | null>(null);
  const baseTweenRef = useRef<gsap.core.Tween | null>(null);

  // ── GSAP setup ──────────────────────────────────────────────
  useEffect(() => {
    const base = gridBaseRef.current;
    const lead = gridShineLeadRef.current;
    const trail = gridShineTrailRef.current;
    if (!base || !lead || !trail) return;

    // Base grid breath — runs always but very cheap (opacity only)
    baseTweenRef.current = gsap.to(base, {
      opacity: 0.18,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Shine sweep — starts paused, only plays when card is flipped
    shineTlRef.current = gsap
      .timeline({ repeat: -1, repeatDelay: 3, paused: true })
      .fromTo(
        trail,
        { backgroundPosition: '-180% -180%', opacity: 0 },
        {
          backgroundPosition: '280% 280%',
          opacity: 1,
          duration: 3.6,
          ease: 'none',
        },
        0,
      )
      .fromTo(
        lead,
        { backgroundPosition: '-150% -150%', opacity: 0 },
        {
          backgroundPosition: '250% 250%',
          opacity: 1,
          duration: 3,
          ease: 'none',
        },
        0.25,
      )
      .to([lead, trail], { opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.5');

    return () => {
      shineTlRef.current?.kill();
      baseTweenRef.current?.kill();
    };
  }, []);

  // ── Play/pause shine when flip state changes ─────────────────
  useEffect(() => {
    if (flipped) {
      shineTlRef.current?.play(0);
    } else {
      shineTlRef.current?.pause();
    }
  }, [flipped]);

  // ── Flip ────────────────────────────────────────────────────
  const frontOpacity = useTransform(rotateY, [0, 89, 90, 91, 180], [1, 1, 0, 0, 0]);
  const backOpacity = useTransform(rotateY, [0, 89, 90, 91, 180], [0, 0, 0, 1, 1]);
  const frontTransform = useTransform(rotateY, (v) => `rotateY(${v}deg)`);
  const backTransform = useTransform(rotateY, (v) => `rotateY(${v + 180}deg)`);

  // ── Mouse tilt ───────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const tiltY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  const imgX = useTransform(mouseX, [-0.5, 0.5], [10, -10]);
  const imgY = useTransform(mouseY, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    animate(mouseX, 0, { type: 'spring', stiffness: 180, damping: 22 });
    animate(mouseY, 0, { type: 'spring', stiffness: 180, damping: 22 });
  }, [mouseX, mouseY]);

  const flip = useCallback(() => {
    const next = !isFlipped.current;
    isFlipped.current = next;
    setFlipped(next);
    animate(rotateY, next ? 180 : 0, {
      type: 'spring',
      stiffness: 70,
      damping: 15,
    });
  }, [rotateY]);

  const faceBase =
    'absolute inset-0 flex flex-col [backface-visibility:hidden] overflow-hidden rounded-xl';

  return (
    <motion.div
      className="group cursor-pointer perspective-distant"
      onClick={flip}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial="idle"
      whileHover="hovered"
      whileTap={{
        scale: 0.975,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }}
      style={{
        rotateX: tiltX,
        rotateY: tiltY,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      variants={{
        idle: { y: 0 },
        hovered: {
          y: -7,
          transition: { type: 'spring', stiffness: 280, damping: 22 },
        },
      }}
    >
      <AspectRatio ratio={16 / 9}>
        <div className="relative h-full w-full transform-3d">
          {/* ── FRONT ── */}
          <motion.div
            className={cn(faceBase)}
            style={{
              transform: frontTransform,
              opacity: frontOpacity,
              willChange: 'transform, opacity',
            }}
          >
            <motion.img
              className="absolute -top-[5%] left-[0%] h-[110%] w-[110%] object-cover"
              src={item.siteImageUrl}
              alt={item.siteName}
              style={{ x: imgX, y: imgY, willChange: 'transform' }}
            />

            <motion.div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
              }}
              variants={{
                idle: { x: '-110%', opacity: 0 },
                hovered: {
                  x: '110%',
                  opacity: 1,
                  transition: { duration: 0.7, ease: 'easeInOut' },
                },
              }}
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

            <motion.a
              href={item.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-(--blue-12)/30 bg-(--blue-12)/10 backdrop-blur-sm"
              variants={{
                idle: { opacity: 0, scale: 0.75, y: -4 },
                hovered: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { duration: 0.22, delay: 0.04 },
                },
              }}
              whileHover={{
                scale: 1.18,
                backgroundColor: 'rgba(255,255,255,0.14)',
                transition: { type: 'spring', stiffness: 350, damping: 20 },
              }}
            >
              <motion.div
                whileHover={{ rotate: 45 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <ArrowUpRight size={14} className="text-(--blue-12)/70" />
              </motion.div>
            </motion.a>

            <motion.div
              className="absolute right-0 bottom-0 left-0 p-4"
              variants={{
                idle: { y: 4, opacity: 0.85 },
                hovered: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <Heading
                as="h3"
                size={HEADING.h3.size}
                className="ml-2 leading-tight font-bold text-white"
              >
                {item.siteName}
              </Heading>
              <Badge
                size="3"
                className="mt-2 inline-block rounded-full text-[10px] font-semibold uppercase"
              >
                {item.siteRole}
              </Badge>
            </motion.div>

            <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
            <BorderTrail className="bg-white/30" size={60} />
          </motion.div>

          {/* ── BACK ── */}
          <motion.div
            className={cn(faceBase, 'bg-(--gray-2)')}
            style={{
              transform: backTransform,
              opacity: backOpacity,
              willChange: 'transform, opacity',
            }}
          >
            {/* Base grid — breathes */}
            <div
              ref={gridBaseRef}
              className="absolute inset-0"
              style={{
                opacity: 0.08,
                backgroundImage:
                  'linear-gradient(rgba(99,179,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,1) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Soft trail — masked to grid lines */}
            <div
              ref={gridShineTrailRef}
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, transparent 44%, rgba(96,165,250,0.25) 50%, transparent 56%)',
                backgroundSize: '350% 350%',
                backgroundPosition: '-180% -180%',
                maskImage:
                  'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                WebkitMaskImage:
                  'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                maskSize: '24px 24px',
                WebkitMaskSize: '24px 24px',
                willChange: 'background-position, opacity',
              }}
            />

            {/* Sharp lead — masked to grid lines */}
            <div
              ref={gridShineLeadRef}
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, transparent 48%, rgba(186,230,255,0.95) 50%, transparent 52%)',
                backgroundSize: '300% 300%',
                backgroundPosition: '-150% -150%',
                maskImage:
                  'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                WebkitMaskImage:
                  'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                maskSize: '24px 24px',
                WebkitMaskSize: '24px 24px',
                willChange: 'background-position, opacity',
              }}
            />

            <div className="absolute top-0 right-0 left-0 h-0.5 bg-linear-to-r from-transparent via-(--blue-8) to-transparent blur-[1.5px]" />

            <div className="relative z-10 flex h-full flex-col gap-2 p-4">
              <motion.div
                custom={0}
                variants={backItemVariants}
                animate={flipped ? 'visible' : 'hidden'}
                className="flex justify-between"
              >
                <div className="flex flex-col">
                  <Heading as="h4" size={HEADING.h4.size} className="leading-tight text-white">
                    {item.siteName}
                  </Heading>
                  <Text
                    size={TEXT.sm.size}
                    className="mt-1 font-semibold tracking-widest text-(--blue-10)/90 uppercase"
                    as="p"
                  >
                    {item.siteRole}
                  </Text>
                </div>
                <motion.a
                  href={item.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="z-20 flex h-8 w-8 items-center justify-center rounded-full border border-(--blue-12)/30 bg-(--blue-12)/10 backdrop-blur-sm"
                >
                  <motion.div
                    whileHover={{ rotate: 45 }}
                    whileTap={{ rotate: 45 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    <ArrowUpRight size={14} className="text-(--blue-12)/70" />
                  </motion.div>
                </motion.a>
              </motion.div>

              <motion.div
                custom={1}
                variants={backItemVariants}
                animate={flipped ? 'visible' : 'hidden'}
                className="flex-1"
              >
                <Text size={TEXT.sm.size} className="leading-relaxed text-white/60" as="p">
                  {item.description}
                </Text>
              </motion.div>

              <motion.div
                custom={2}
                variants={backItemVariants}
                animate={flipped ? 'visible' : 'hidden'}
              >
                <Flex wrap="wrap" gap="2">
                  {item.useTech.map((tech, i) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={flipped ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                      transition={{
                        delay: flipped ? 0.32 + i * 0.055 : 0,
                        type: 'spring',
                        stiffness: 260,
                        damping: 18,
                      }}
                      whileHover={{
                        scale: 1.12,
                        y: -2,
                        transition: {
                          type: 'spring',
                          stiffness: 400,
                          damping: 16,
                        },
                      }}
                    >
                      <Badge variant="surface" size="3" className="cursor-default tracking-wide">
                        {tech}
                      </Badge>
                    </motion.div>
                  ))}
                </Flex>
              </motion.div>
            </div>

            <div className="absolute inset-0 rounded-xl ring-1 ring-white/5" />
          </motion.div>
        </div>
      </AspectRatio>
    </motion.div>
  );
}
