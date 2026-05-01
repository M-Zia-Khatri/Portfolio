<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    public function index(Request $request): Response
    {
        $mode = $request->string('mode')->toString();

        $skills = Skill::query()
            ->when(in_array($mode, ['code', 'terminal'], true), function ($query) use ($mode) {
                $query->where('mode', $mode);
            })
            ->latest('id')
            ->get();

        return Inertia::render('skills/index', [
            'skills' => $skills,
            'filters' => [
                'mode' => $mode,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('skills/create');
    }

    public function store(StoreSkillRequest $request): RedirectResponse
    {
        Skill::query()->create($request->validated());

        return to_route('skills.index')->with('success', 'Skill created successfully.');
    }

    public function edit(Skill $skill): Response
    {
        return Inertia::render('skills/edit', [
            'skill' => $skill,
        ]);
    }

    public function update(UpdateSkillRequest $request, Skill $skill): RedirectResponse
    {
        $skill->update($request->validated());

        return to_route('skills.index')->with('success', 'Skill updated successfully.');
    }

    public function destroy(Skill $skill): RedirectResponse
    {
        $skill->delete();

        return to_route('skills.index')->with('success', 'Skill deleted successfully.');
    }
}
