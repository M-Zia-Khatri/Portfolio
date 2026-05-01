<?php

use App\Http\Controllers\SkillController;
use Illuminate\Support\Facades\Route;

Route::get('/skills', [SkillController::class, 'index']);
Route::get('/skills/{skill}', [SkillController::class, 'show']);

Route::middleware(['auth', 'require-admin'])->group(function (): void {
    Route::post('/skills', [SkillController::class, 'store']);
    Route::patch('/skills/{skill}', [SkillController::class, 'update']);
    Route::delete('/skills/{skill}', [SkillController::class, 'destroy']);
});
