<?php

namespace App\Http\Controllers;

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
        $contactMessage = ContactMessage::query()->create($request->validated());

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
            'contacts' => $contacts->items(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total(),
            ],
        ]);
    }

    public function destroy(string $id): RedirectResponse
    {
        ContactMessage::query()->whereKey($id)->firstOrFail()->delete();

        return back()->with('success', 'Contact message deleted successfully.');
    }
}
