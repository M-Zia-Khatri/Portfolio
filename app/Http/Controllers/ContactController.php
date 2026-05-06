<?php

namespace App\Http\Controllers;

use App\Data\ContactMessageData;
use App\Data\PaginationMetaData;
use App\Http\Requests\StoreContactRequest;
use App\Jobs\SendContactEmailJob;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function submit(StoreContactRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $contactMessage = ContactMessage::query()->create([
            'full_name' => $validated['fullName'],
            'email' => $validated['email'],
            'message' => $validated['message'],
        ]);

        SendContactEmailJob::dispatch($contactMessage);

        return back()->with('success', 'Your message has been sent successfully.');
    }

    public function index(): Response
    {
        $contacts = ContactMessage::query()
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/contact/index', [
            'contacts' => collect($contacts->items())
                ->map(static fn (ContactMessage $contact): ContactMessageData => ContactMessageData::fromModel($contact))
                ->all(),
            'meta' => PaginationMetaData::fromPaginator($contacts),
        ]);
    }

    public function destroy(string $id): RedirectResponse
    {
        ContactMessage::query()->whereKey($id)->firstOrFail()->delete();

        return back()->with('success', 'Contact message deleted successfully.');
    }
}
