<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SkillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $mode = $request->query('mode');
        $cacheKey = "skills:list:{$mode}";

        $skills = Cache::remember($cacheKey, 600, function () use ($mode) {
            return Skill::query()
                ->when(in_array($mode, ['code', 'terminal'], true), fn ($query) => $query->where('mode', $mode))
                ->orderBy('id')
                ->get();
        });

        return $this->etaggedResponse($request, [
            'success' => true,
            'message' => 'Skills retrieved successfully.',
            'data' => SkillResource::collection($skills),
            'meta' => ['count' => $skills->count(), 'mode' => $mode],
        ]);
    }

    public function store(StoreSkillRequest $request): JsonResponse
    {
        try {
            $skill = Skill::create($request->validated());
        } catch (QueryException $queryException) {
            if (($queryException->errorInfo[1] ?? null) === 1062) {
                return response()->json(['success' => false, 'message' => 'Duplicate lang value.', 'data' => null], 409);
            }

            throw $queryException;
        }

        $this->invalidateSkillCache($skill->id);

        return response()->json([
            'success' => true,
            'message' => 'Skill created successfully.',
            'data' => new SkillResource($skill),
        ], 201);
    }

    public function show(Request $request, Skill $skill): JsonResponse
    {
        $cachedSkill = Cache::remember("skills:item:{$skill->id}", 600, fn () => $skill->fresh());

        return $this->etaggedResponse($request, [
            'success' => true,
            'message' => 'Skill retrieved successfully.',
            'data' => new SkillResource($cachedSkill),
        ]);
    }

    public function update(UpdateSkillRequest $request, Skill $skill): JsonResponse
    {
        $ifMatch = $request->header('If-Match');
        if (! $ifMatch) {
            return response()->json(['success' => false, 'message' => 'If-Match header is required.', 'data' => null], 428);
        }

        $currentEtag = $this->buildEtag($skill->updated_at?->toISOString() ?? (string) $skill->id);
        if ($ifMatch !== $currentEtag) {
            return response()->json(['success' => false, 'message' => 'If-Match precondition failed.', 'data' => null], 412);
        }

        try {
            $skill->update($request->validated());
        } catch (QueryException $queryException) {
            if (($queryException->errorInfo[1] ?? null) === 1062) {
                return response()->json(['success' => false, 'message' => 'Duplicate lang value.', 'data' => null], 409);
            }

            throw $queryException;
        }

        $skill->refresh();
        $this->invalidateSkillCache($skill->id);

        return response()->json([
            'success' => true,
            'message' => 'Skill updated successfully.',
            'data' => new SkillResource($skill),
        ]);
    }

    public function destroy(Skill $skill): JsonResponse
    {
        $skillId = $skill->id;
        $skill->delete();
        $this->invalidateSkillCache($skillId);

        return response()->json([
            'success' => true,
            'message' => 'Skill deleted successfully.',
            'data' => null,
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function etaggedResponse(Request $request, array $payload): JsonResponse
    {
        $etag = $this->buildEtag(json_encode($payload));

        if ($request->header('If-None-Match') === $etag) {
            return response()->json(null, 304, ['ETag' => $etag]);
        }

        return response()->json($payload, 200, ['ETag' => $etag]);
    }

    private function buildEtag(string $content): string
    {
        return '"'.sha1($content).'"';
    }

    private function invalidateSkillCache(int $skillId): void
    {
        Cache::forget('skills:list:');
        Cache::forget('skills:list:code');
        Cache::forget('skills:list:terminal');
        Cache::forget("skills:item:{$skillId}");
    }
}
