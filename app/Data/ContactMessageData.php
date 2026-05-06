<?php

namespace App\Data;

use App\Models\ContactMessage;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ContactMessageData extends Data
{
    public function __construct(
        public string $id,
        public string $fullName,
        public string $email,
        public string $message,
        public bool $isRead,
        public ?string $createdAt,
    ) {}

    public static function fromModel(ContactMessage $contactMessage): self
    {
        return new self(
            id: (string) $contactMessage->id,
            fullName: $contactMessage->full_name,
            email: $contactMessage->email,
            message: $contactMessage->message,
            isRead: $contactMessage->is_read,
            createdAt: $contactMessage->created_at?->toISOString(),
        );
    }
}
