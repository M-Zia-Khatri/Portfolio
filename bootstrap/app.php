<?php

use App\Http\Middleware\ConvertEmptyStringsToNullPreservingStructuredText;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RequireAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trimStrings(except: [
            'code.*',
            'commands.*.text',
        ]);

        $middleware->replace(ConvertEmptyStringsToNull::class, ConvertEmptyStringsToNullPreservingStructuredText::class);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias(['require-admin' => RequireAdmin::class]);

        $middleware->redirectGuestsTo(fn () => route('auth.login.create'));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
