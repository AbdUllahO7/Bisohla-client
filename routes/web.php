Route::middleware(['auth'])->group(function () {
    Route::post('/car-listings', [CarListingController::class, 'store']);
}); 