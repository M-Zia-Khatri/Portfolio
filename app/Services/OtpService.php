<?php

namespace App\Services;

use App\Models\OtpToken;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class OtpService
{
    public function generateOtp(int $userId): string
    {
        OtpToken::query()
            ->where('user_id', $userId)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $otp = (string) random_int(100000, 999999);

        OtpToken::query()->create([
            'user_id' => $userId,
            'code_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(5),
        ]);

        return $otp;
    }

    public function verifyOtp(int $userId, string $code): bool
    {
        $token = OtpToken::query()
            ->where('user_id', $userId)
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        if (! $token instanceof OtpToken) {
            return false;
        }

        if ($token->expires_at->isPast()) {
            return false;
        }

        if (! Hash::check($code, $token->code_hash)) {
            return false;
        }

        $token->update(['used_at' => Carbon::now()]);

        return true;
    }
}
