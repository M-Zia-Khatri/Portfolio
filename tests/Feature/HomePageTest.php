<?php

use App\Models\Skill;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the home page with contact skills matching skill data shape', function () {
    Skill::query()->create([
        'name' => 'TypeScript',
        'icon' => 'SiTypescript',
        'file_name' => 'contact.ts',
        'lang' => 'ts',
        'color' => '#3178c6',
        'mode' => 'code',
        'code' => ['export const contact = true;'],
        'commands' => null,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home/index')
            ->has('skills', 1)
            ->has('contactSkills', 1)
            ->where('contactSkills.0.name', 'TypeScript')
            ->where('contactSkills.0.fileName', 'contact.ts')
            ->where('contactSkills.0.mode', 'code')
            ->where('contactSkills.0.code.0', 'export const contact = true;')
            ->where('contactSkills.0.commands', null)
        );
});
