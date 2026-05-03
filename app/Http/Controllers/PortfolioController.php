<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePortfolioRequest;
use App\Http\Requests\UpdatePortfolioRequest;
use App\Models\PortfolioItem;
use App\Services\CloudinaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PortfolioController extends Controller
{
    public function __construct(private CloudinaryService $cloudinaryService) {}

    public function index(): Response
    {
        $portfolioItems = PortfolioItem::query()->latest('created_at')->get()->map(fn (PortfolioItem $item): array => [
            'id' => $item->id,
            'siteName' => $item->site_name,
            'siteRole' => $item->site_role,
            'siteUrl' => $item->site_url,
            'siteImageUrl' => $item->site_image_url,
            'useTech' => $item->use_tech,
            'description' => $item->description,
        ]);

        return Inertia::render('portfolio/index', ['portfolioItems' => $portfolioItems]);
    }

    public function create(): Response
    {
        return Inertia::render('portfolio/create');
    }

    public function store(StorePortfolioRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $mappedData = [
            'site_name' => $validated['siteName'],
            'site_role' => $validated['siteRole'],
            'site_url' => $validated['siteUrl'],
            'use_tech' => $validated['useTech'],
            'description' => $validated['description'],
        ];
        $uploadedImageUrl = $this->cloudinaryService->uploadToCloudinary($request->file('siteImage'));

        try {
            DB::transaction(function () use ($mappedData, $uploadedImageUrl): void {
                PortfolioItem::query()->create([
                    ...$mappedData,
                    'site_image_url' => $uploadedImageUrl,
                ]);
            });
        } catch (Throwable $exception) {
            $this->cloudinaryService->deleteFromCloudinary($uploadedImageUrl);

            throw $exception;
        }

        return to_route('portfolio.index')->with('success', 'Portfolio item created successfully.');
    }

    public function edit(PortfolioItem $portfolio): Response
    {
        return Inertia::render('portfolio/edit', [
            'portfolioItem' => [
                'id' => $portfolio->id,
                'siteName' => $portfolio->site_name,
                'siteRole' => $portfolio->site_role,
                'siteUrl' => $portfolio->site_url,
                'siteImageUrl' => $portfolio->site_image_url,
                'useTech' => $portfolio->use_tech,
                'description' => $portfolio->description,
            ],
        ]);
    }

    public function update(UpdatePortfolioRequest $request, PortfolioItem $portfolio): RedirectResponse
    {
        $validated = $request->validated();
        $mappedData = [];
        foreach (['siteName' => 'site_name', 'siteRole' => 'site_role', 'siteUrl' => 'site_url', 'useTech' => 'use_tech', 'description' => 'description'] as $camel => $snake) {
            if (array_key_exists($camel, $validated)) {
                $mappedData[$snake] = $validated[$camel];
            }
        }
        $oldImageUrl = $portfolio->site_image_url;
        $newImageUrl = null;

        if ($request->hasFile('siteImage')) {
            $newImageUrl = $this->cloudinaryService->uploadToCloudinary($request->file('siteImage'));
            $mappedData['site_image_url'] = $newImageUrl;
        }

        try {
            DB::transaction(function () use ($portfolio, $mappedData): void {
                $portfolio->update($mappedData);
            });
        } catch (Throwable $exception) {
            if (is_string($newImageUrl) && $newImageUrl !== '') {
                $this->cloudinaryService->deleteFromCloudinary($newImageUrl);
            }

            throw $exception;
        }

        if (is_string($newImageUrl) && $newImageUrl !== '' && $newImageUrl !== $oldImageUrl) {
            $this->cloudinaryService->deleteFromCloudinary($oldImageUrl);
        }

        return to_route('portfolio.index')->with('success', 'Portfolio item updated successfully.');
    }

    public function destroy(PortfolioItem $portfolio): RedirectResponse
    {
        $imageUrl = $portfolio->site_image_url;

        DB::transaction(function () use ($portfolio): void {
            $portfolio->delete();
        });

        $this->cloudinaryService->deleteFromCloudinary($imageUrl);

        return to_route('portfolio.index')->with('success', 'Portfolio item deleted successfully.');
    }
}
