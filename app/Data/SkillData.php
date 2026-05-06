<?php

namespace App\Data;

use App\Models\Skill;
use Illuminate\Support\Collection;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SkillData extends Data
{
    /**
     * @param array<int, string>|null $code
     * @param array<int, SkillCommandData>|null $commands
     */
    public function __construct(
        public int $id,
        public string $name,
        public string $icon,
        public string $fileName,
        public string $lang,
        public string $color,
        public string $mode,
        public ?array $code,
        public ?array $commands,
    ) {}

    public static function fromModel(Skill $skill): self
    {
        return new self(
            id: $skill->id,
            name: $skill->name,
            icon: $skill->icon,
            fileName: $skill->file_name,
            lang: $skill->lang,
            color: $skill->color,
            mode: $skill->mode,
            code: $skill->mode === 'code' ? self::stringList($skill->code) : null,
            commands: $skill->mode === 'terminal' ? self::commands($skill->commands) : null,
        );
    }

    /**
     * @param Collection<int, Skill>|iterable<int, Skill> $skills
     * @return array<int, self>
     */
    public static function collection(Collection|iterable $skills): array
    {
        $items = $skills instanceof Collection ? $skills->all() : $skills;

        return array_map(
            static fn (Skill $skill): self => self::fromModel($skill),
            is_array($items) ? $items : iterator_to_array($items),
        );
    }

    /**
     * @param mixed $commands
     * @return array<int, SkillCommandData>
     */
    private static function commands(mixed $commands): array
    {
        if (! is_array($commands)) {
            return [];
        }

        return array_values(array_map(
            static fn (array $command): SkillCommandData => new SkillCommandData(
                kind: (string) ($command['kind'] ?? 'blank'),
                text: isset($command['text']) ? (string) $command['text'] : null,
            ),
            array_filter($commands, static fn (mixed $command): bool => is_array($command)),
        ));
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
