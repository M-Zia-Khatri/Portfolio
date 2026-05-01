<?php

use App\Models\Skill;

it('lists skills with mode filter', function (): void {
    Skill::factory()->count(2)->create();
    Skill::factory()->terminalMode()->create();

    $response = $this->getJson('/api/skills?mode=code');

    $response->assertOk()->assertJsonPath('success', true)->assertJsonPath('meta.count', 2);
});

it('returns 304 when if none match header matches', function (): void {
    Skill::factory()->create();

    $firstResponse = $this->getJson('/api/skills');
    $etag = $firstResponse->headers->get('ETag');

    $this->withHeaders(['If-None-Match' => $etag])->getJson('/api/skills')->assertStatus(304);
});
