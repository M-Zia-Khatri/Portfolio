<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('2fa_verified', false)) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
