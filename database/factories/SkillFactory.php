<?php

namespace Database\Factories;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Skill>
 */
class SkillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'icon' => fake()->word(),
            'file_name' => fake()->word().'.svg',
            'lang' => fake()->unique()->lexify('lang_????'),
            'color' => fake()->hexColor(),
            'mode' => 'code',
            'code' => ['echo "Hello";'],
            'commands' => null,
        ];
    }

    public function terminalMode(): static
    {
        return $this->state(fn (): array => [
            'mode' => 'terminal',
            'code' => null,
            'commands' => [['kind' => 'command', 'text' => 'npm run dev']],
        ]);
    }
}
