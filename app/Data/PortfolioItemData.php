<?php

namespace App\Data;

use App\Models\PortfolioItem;
use Illuminate\Support\Collection;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class PortfolioItemData extends Data
{
    /**
     * @param array<int, string> $useTech
     */
    public function __construct(
        public string $id,
        public string $siteName,
        public string $siteRole,
        public string $siteUrl,
        public string $siteImageUrl,
        public array $useTech,
        public string $description,
    ) {}

    public static function fromModel(PortfolioItem $portfolioItem): self
    {
        return new self(
            id: $portfolioItem->id,
            siteName: $portfolioItem->site_name,
            siteRole: $portfolioItem->site_role,
            siteUrl: $portfolioItem->site_url,
            siteImageUrl: $portfolioItem->site_image_url,
            useTech: self::stringList($portfolioItem->use_tech),
            description: $portfolioItem->description,
        );
    }

    /**
     * @param Collection<int, PortfolioItem>|iterable<int, PortfolioItem> $portfolioItems
     * @return array<int, self>
     */
    public static function collection(Collection|iterable $portfolioItems): array
    {
        $items = $portfolioItems instanceof Collection ? $portfolioItems->all() : $portfolioItems;

        return array_map(
            static fn (PortfolioItem $portfolioItem): self => self::fromModel($portfolioItem),
            is_array($items) ? $items : iterator_to_array($items),
        );
    }

    /**
     * @return array<int, string>
     */
    private static function stringList(mixed $values): array
    {
        if (! is_array($values)) {
            return [];
        }

        return array_values(array_map(
            static fn (mixed $value): string => (string) $value,
            $values,
        ));
    }
}
