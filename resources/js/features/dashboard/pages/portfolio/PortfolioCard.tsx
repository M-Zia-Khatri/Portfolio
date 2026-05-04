import { cn } from '@/shared/utils/cn';
import { Badge, Card, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import type { PortfolioItem } from './portfolio.types';

// ─── Animation Variants ───────────────────────────────────────────────────────

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface PortfolioCardProps {
  item: PortfolioItem;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PortfolioCard({ item, onEdit, onDelete }: PortfolioCardProps) {
  const techList = item.use_tech ?? [];

  return (
    <motion.div variants={cardVariants}>
      <Card
        className={cn(
          'group relative overflow-hidden h-full',
          'border border-(--gray-4) bg-(--gray-2)',
          'hover:border-(--blue-7) transition-colors duration-200',
        )}
      >
        {/* Image */}
        <div className={cn('relative w-full overflow-hidden', 'h-44 rounded-t-(--radius-3)')}>
          <img
            src={item.site_image_url}
            alt={item.site_name}
            className={cn(
              'w-full h-full object-cover',
              'group-hover:scale-[1.03] transition-transform duration-300',
            )}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://placehold.co/400x200/0d2d3b/70c1e5?text=No+Image';
            }}
          />

          {/* Overlay actions */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center gap-2',
              'bg-(--gray-1)/80 opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200',
            )}
          >
            <Tooltip content="Edit">
              <IconButton
                size="2"
                variant="soft"
                color="blue"
                onClick={() => onEdit(item)}
                aria-label="Edit portfolio item"
              >
                <Pencil size={14} />
              </IconButton>
            </Tooltip>

            <Tooltip content="Delete">
              <IconButton
                size="2"
                variant="soft"
                color="red"
                onClick={() => onDelete(item.id)}
                aria-label="Delete portfolio item"
              >
                <Trash2 size={14} />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Content */}
        <div className={cn('p-4 flex flex-col gap-2')}>
          {/* Title + link */}
          <div className={cn('flex items-start justify-between gap-2')}>
            <Text
              as="p"
              size="3"
              weight="bold"
              className={cn('text-(--gray-12) leading-snug line-clamp-1')}
            >
              {item.site_name}
            </Text>
            <a
              href={item.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'shrink-0 text-(--blue-9) hover:text-(--blue-11)',
                'transition-colors duration-150',
              )}
              aria-label={`Visit ${item.site_name}`}
            >
              <ExternalLink size={15} />
            </a>
          </div>

          {/* Role */}
          {item.site_role && (
            <Text
              as="p"
              size="1"
              className={cn('text-(--blue-9) font-medium tracking-wide uppercase')}
            >
              {item.site_role}
            </Text>
          )}

          {/* Description */}
          {item.description && (
            <Text as="p" size="1" className={cn('text-(--gray-11) leading-relaxed line-clamp-3')}>
              {item.description}
            </Text>
          )}

          {/* Tech badges */}
          {techList.length > 0 && (
            <div className={cn('flex flex-wrap gap-1 mt-1')}>
              {techList.map((tech) => (
                <Badge key={tech} color="blue" variant="soft" size="1" radius="full">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
