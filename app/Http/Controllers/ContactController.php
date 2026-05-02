<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Jobs\SendContactEmailJob;
use App\Models\ContactMessage;
use App\Services\CloudinaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ContactController extends Controller
{
    public function __construct(private readonly CloudinaryService $cloudinaryService) {}

    public function submit(StoreContactRequest $request): RedirectResponse
    {
        $imageUrl = $request->input('image_url');

        try {
            $validator = Validator::make($request->all(), $request->rules());

            if ($validator->fails()) {
                if (is_string($imageUrl) && $imageUrl !== '') {
                    $this->cloudinaryService->deleteFromCloudinary($imageUrl);
                }

                throw ValidationException::withMessages($validator->errors()->toArray());
            }

            $validatedData = $validator->validated();

            $contactMessage = ContactMessage::query()->create($validatedData);

            SendContactEmailJob::dispatch($contactMessage);

            return back()->with('success', 'Your message has been sent successfully.');
        } catch (Throwable $exception) {
            if (is_string($imageUrl) && $imageUrl !== '') {
                $this->cloudinaryService->deleteFromCloudinary($imageUrl);
            }

            throw $exception;
        }
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
