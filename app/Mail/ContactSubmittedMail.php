<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ContactSubmittedMail extends Mailable
{
    use Queueable;

    public function __construct(public ContactMessage $contactMessage)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Contact Form Submission',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-submitted',
            with: [
                'fullName' => $this->contactMessage->full_name,
                'email' => $this->contactMessage->email,
                'messageText' => $this->contactMessage->message,
                'createdAt' => $this->contactMessage->created_at,
            ],
        );
    }
}
