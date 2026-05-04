import { fetchPublicPortfolio } from '@/features/portfolio/api';
import { PortfolioItemCard } from '@/features/portfolio/components/PortfolioItemCard';
import type { PortfolioItem } from '@/features/portfolio/types';
import SecComponent from '@/shared/components/SecContainer';
import { TEXT } from '@/shared/constants/style.constants';
import { cn } from '@/shared/utils/cn';
import { Box, Card, Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'motion/react';
import React from 'react';

// ✅ Explicit typing
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 80, damping: 18 },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ✅ These are already correct
const VIEWPORT_ONCE = { once: true, margin: '-60px' } as const;
const VIEWPORT_GRID = { once: true, margin: '-80px' } as const;

const PORTFOLIO_QUERY_KEY = ['portfolio'] as const;

type PortfolioApiRow = Awaited<ReturnType<typeof fetchPublicPortfolio>>[number];

const mapPortfolioItem = (item: PortfolioApiRow): PortfolioItem => ({
  siteName: item.site_name,
  siteRole: item.site_role,
  siteUrl: item.site_url,
  siteImageUrl: item.site_image_url,
  useTech: item.use_tech,
  description: item.description,
});

export default function PortfolioSection() {
  const {
    data: portfolioItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: fetchPublicPortfolio,
    select: (items) => items.map(mapPortfolioItem),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <SecComponent className="w-full" py="8">
      <Box className="flex flex-col items-center gap-8 md:gap-10 lg:gap-12 xl:gap-14">
        <motion.div
          className=" text-center"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <Heading as="h2" className="font-bold">
            Portfolio
          </Heading>

          <Text size={TEXT.sm.size} color="blue">
            Selected Work
          </Text>
        </motion.div>

        <motion.div
          className={cn('grid w-full ', 'grid-cols-1 md:grid-cols-2', 'gap-5 md:gap-3 lg:gap-4')}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_GRID}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <React.Fragment key={index}>
                <Card size="2">
                  <Flex direction="column" gap="3">
                    <Skeleton className="h-48 w-full rounded-md" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </Flex>
                </Card>
              </React.Fragment>
            ))
          ) : isError ? (
            <Card size="3" className="md:col-span-2">
              <Text size={TEXT.base.size} color="red">
                Couldn&apos;t load portfolio items right now. Please try again later.
              </Text>
            </Card>
          ) : portfolioItems.length === 0 ? (
            <Card size="3" className="md:col-span-2">
              <Text size={TEXT.base.size} color="gray">
                Portfolio items coming soon.
              </Text>
            </Card>
          ) : (
            portfolioItems.map((item) => (
              <motion.div key={item.siteUrl} variants={cardVariants}>
                <PortfolioItemCard item={item} />
              </motion.div>
            ))
          )}
        </motion.div>
      </Box>
    </SecComponent>
  );
}
