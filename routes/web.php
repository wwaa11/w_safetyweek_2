<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Event Settings Routes
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/event', [App\Http\Controllers\EventSettingsController::class, 'index'])->name('event');
        Route::post('/event/settings', [App\Http\Controllers\EventSettingsController::class, 'storeSettings'])->name('event.settings.store');
        Route::post('/event/dates', [App\Http\Controllers\EventSettingsController::class, 'storeRegisterDate'])->name('event.dates.store');
        Route::put('/event/dates/{id}', [App\Http\Controllers\EventSettingsController::class, 'updateRegisterDate'])->name('event.dates.update');
        Route::delete('/event/dates/{id}', [App\Http\Controllers\EventSettingsController::class, 'deleteRegisterDate'])->name('event.dates.delete');
        Route::post('/event/times', [App\Http\Controllers\EventSettingsController::class, 'storeRegisterTime'])->name('event.times.store');
        Route::put('/event/times/{id}', [App\Http\Controllers\EventSettingsController::class, 'updateRegisterTime'])->name('event.times.update');
        Route::delete('/event/times/{id}', [App\Http\Controllers\EventSettingsController::class, 'deleteRegisterTime'])->name('event.times.delete');
        Route::post('/event/save-all', [App\Http\Controllers\EventSettingsController::class, 'saveAll'])->name('event.save-all');
    });
});
