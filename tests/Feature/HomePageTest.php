<?php

use App\Models\Skill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('serializes contact skills with API-safe camel case data', function () {
    Skill::query()->create([
        'name' => 'Laravel',
        'icon' => 'FaLaravel',
        'file_name' => 'routes/web.php',
        'lang' => 'php',
        'color' => '#ff2d20',
        'mode' => 'code',
        'code' => ['Route::get("/", HomeController::class);'],
        'commands' => null,
    ]);

    Skill::query()->create([
        'name' => 'Deploy',
        'icon' => 'FaTerminal',
        'file_name' => 'deploy.sh',
        'lang' => 'shell',
        'color' => '#ffffff',
        'mode' => 'terminal',
        'code' => null,
        'commands' => [['kind' => 'command', 'text' => 'php artisan optimize']],
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home/index')
            ->has('skills', 2)
            ->has('contactSkills', 1)
            ->where('contactSkills.0.name', 'Laravel')
            ->where('contactSkills.0.fileName', 'routes/web.php')
            ->where('contactSkills.0.mode', 'code')
            ->where('contactSkills.0.code.0', 'Route::get("/", HomeController::class);')
            ->missing('contactSkills.1')
        );
});
