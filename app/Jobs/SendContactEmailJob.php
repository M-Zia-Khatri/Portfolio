<?php

namespace App\Jobs;

use App\Mail\ContactSubmittedMail;
use App\Models\ContactMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendContactEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public ContactMessage $contactMessage)
    {
    }

    public function handle(): void
    {
        Mail::to((string) config('mail.from.address'))->send(new ContactSubmittedMail($this->contactMessage));
    }
}
