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
            ->get()
            ->map(fn (Skill $skill): array => [
                'id' => $skill->id,
                'name' => $skill->name,
                'icon' => $skill->icon,
                'fileName' => $skill->file_name,
                'lang' => $skill->lang,
                'color' => $skill->color,
                'mode' => $skill->mode,
                'code' => $skill->code,
                'commands' => $skill->commands,
            ]);

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
        $validated = $request->validated();
        $validated['file_name'] = $validated['fileName'];
        unset($validated['fileName']);
        Skill::query()->create($validated);

        return to_route('skills.index')->with('success', 'Skill created successfully.');
    }

    public function edit(Skill $skill): Response
    {
        return Inertia::render('skills/edit', [
            'skill' => [
                'id' => $skill->id,
                'name' => $skill->name,
                'icon' => $skill->icon,
                'fileName' => $skill->file_name,
                'lang' => $skill->lang,
                'color' => $skill->color,
                'mode' => $skill->mode,
                'code' => $skill->code,
                'commands' => $skill->commands,
            ],
        ]);
    }

    public function update(UpdateSkillRequest $request, Skill $skill): RedirectResponse
    {
        $validated = $request->validated();
        $validated['file_name'] = $validated['fileName'];
        unset($validated['fileName']);
        $skill->update($validated);

        return to_route('skills.index')->with('success', 'Skill updated successfully.');
    }

    public function destroy(Skill $skill): RedirectResponse
    {
        $skill->delete();

        return to_route('skills.index')->with('success', 'Skill deleted successfully.');
    }
}
