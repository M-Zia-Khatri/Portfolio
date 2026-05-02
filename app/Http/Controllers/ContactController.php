<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Jobs\SendContactEmailJob;
use App\Models\ContactMessage;
use App\Services\CloudinaryService;
use Illuminate\Http\RedirectResponse;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function submit(StoreContactRequest $request, CloudinaryService $cloudinaryService): RedirectResponse
    {
        $validatedData = $request->validated();
        $imageUrl = $validatedData['image_url'] ?? null;

        try {
            $contactMessage = ContactMessage::query()->create($validatedData);
            SendContactEmailJob::dispatch($contactMessage);
        } catch (Throwable $exception) {
            if (is_string($imageUrl) && $imageUrl !== '') {
                $cloudinaryService->deleteFromCloudinary($imageUrl);
            }

            throw $exception;
        }

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

    public function destroy(string $id, CloudinaryService $cloudinaryService): RedirectResponse
    {
        $contactMessage = ContactMessage::query()->whereKey($id)->firstOrFail();

        if (is_string($contactMessage->image_url) && $contactMessage->image_url !== '') {
            $cloudinaryService->deleteFromCloudinary($contactMessage->image_url);
        }

        $contactMessage->delete();

        return back()->with('success', 'Contact message deleted successfully.');
    }
}
