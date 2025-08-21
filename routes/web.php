<?php

use App\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\EventSettingsController;
use App\Http\Controllers\WebController;
use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::get('/login', [AuthenticatedSessionController::class, 'login'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::get('/', [WebController::class, 'index'])->name('user.index');
Route::post('/api/getuser', [WebController::class, 'getUser'])->name('api.getuser');
Route::post('/api/register-slot', [WebController::class, 'registerSlot'])->name('api.register-slot');
Route::get('/api/get-slot-selection/{id}', [WebController::class, 'getSlotSelection'])->name('api.get-slot-selection');
Route::post('/api/search-registrations', [WebController::class, 'searchRegistrations'])->name('api.search-registrations');

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [EventSettingsController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/settings', [EventSettingsController::class, 'settings'])->name('admin.settings');
    Route::get('/admin/registrations', [EventSettingsController::class, 'registrations'])->name('admin.registrations');
    Route::delete('/admin/registrations/{id}', [EventSettingsController::class, 'deleteRegistration'])->name('admin.registrations.delete');
    Route::get('/admin/registrations/export', [EventSettingsController::class, 'exportRegistrations'])->name('admin.registrations.export');
    Route::post('/admin/settings', [EventSettingsController::class, 'storeSettings'])->name('admin.settings.store');
    Route::post('/admin/dates', [EventSettingsController::class, 'storeRegisterDate'])->name('admin.dates.store');
    Route::post('/admin/dates/{id}/update', [EventSettingsController::class, 'updateRegisterDate'])->name('admin.dates.update');
    Route::delete('/admin/dates/{id}', [EventSettingsController::class, 'deleteRegisterDate'])->name('admin.dates.delete');
    Route::post('/admin/times', [EventSettingsController::class, 'storeRegisterTime'])->name('admin.times.store');
    Route::post('/admin/times/{id}/update', [EventSettingsController::class, 'updateRegisterTime'])->name('admin.times.update');
    Route::delete('/admin/times/{id}', [EventSettingsController::class, 'deleteRegisterTime'])->name('admin.times.delete');
    Route::post('/admin/slots', [EventSettingsController::class, 'storeRegisterSlot'])->name('admin.slots.store');
    Route::post('/admin/slots/{id}/update', [EventSettingsController::class, 'updateRegisterSlot'])->name('admin.slots.update');
    Route::delete('/admin/slots/{id}', [EventSettingsController::class, 'deleteRegisterSlot'])->name('admin.slots.delete');
    Route::post('/admin/save-all', [EventSettingsController::class, 'saveAll'])->name('admin.save-all');
});
