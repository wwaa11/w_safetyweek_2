<?php
namespace App\Http\Controllers;

use App\Models\RegisterDate;
use App\Models\RegisterSlot;
use App\Models\RegisterTime;
use App\Models\Setting;
use App\Models\UserSlotSelection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class EventSettingsController extends Controller
{
    public function index(): Response
    {
        // Get statistics for dashboard
        $totalDates         = RegisterDate::where('is_active', true)->count();
        $totalTimeSlots     = RegisterTime::where('is_active', true)->count();
        $totalSlots         = RegisterSlot::where('is_active', true)->count();
        $totalRegistrations = UserSlotSelection::where('is_delete', false)->count();

        // Get upcoming sessions (next 7 days)
        $upcomingSessions = RegisterDate::with(['times.slots'])
            ->where('is_active', true)
            ->where('date', '>=', now()->toDateString())
            ->where('date', '<=', now()->addDays(7)->toDateString())
            ->count();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalDates'         => $totalDates,
                'totalTimeSlots'     => $totalTimeSlots,
                'totalSlots'         => $totalSlots,
                'totalRegistrations' => $totalRegistrations,
                'upcomingSessions'   => $upcomingSessions,
            ],
        ]);
    }

    /**
     * Display the event settings page
     */
    public function settings(): Response
    {
        $settings      = Setting::first();
        $registerDates = RegisterDate::with('times.slots')->orderBy('date')->get();

        return Inertia::render('admin/event-settings', [
            'settings'      => $settings,
            'registerDates' => $registerDates,
            'success'       => session('success'),
            'error'         => session('error'),
            'errors'        => session('errors'),
        ]);
    }

    /**
     * Store or update general settings
     */
    public function storeSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'               => 'required|string|max:255',
            'register_start_date' => 'required|date_format:Y-m-d',
            'register_end_date'   => 'required|date_format:Y-m-d|after:register_start_date',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Ensure dates are stored in Y-m-d format
            $startDate = \Carbon\Carbon::parse($request->register_start_date)->format('Y-m-d');
            $endDate   = \Carbon\Carbon::parse($request->register_end_date)->format('Y-m-d');

            Setting::updateOrCreate(
                ['id' => 1],
                [
                    'title'               => $request->title,
                    'register_start_date' => $startDate,
                    'register_end_date'   => $endDate,
                ]
            );

            return back()->with('success', 'Settings saved successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to save settings: ' . $e->getMessage());
            return back()->with('error', 'Failed to save settings: ' . $e->getMessage());
        }
    }

    /**
     * Store a new register date
     */
    public function storeRegisterDate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|unique:register_dates,date',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $date = RegisterDate::create([
                'date'      => $request->date,
                'is_active' => true,
            ]);

            return back()->with('success', 'Date added successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to add date');
        }
    }

    /**
     * Update register date status
     */
    public function updateRegisterDate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            $date = RegisterDate::findOrFail($id);
            $date->update([
                'is_active' => $request->is_active,
            ]);

            return back()->with('success', 'Date updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update date');
        }
    }

    /**
     * Delete a register date
     */
    public function deleteRegisterDate($id)
    {
        try {
            $date = RegisterDate::findOrFail($id);
            // Delete associated times first (this will happen automatically due to foreign key constraints)
            $date->times()->delete();
            // Delete the date
            $date->delete();

            return back()->with('success', 'Date deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete date');
        }
    }

    /**
     * Store a new register time
     */
    public function storeRegisterTime(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'register_date_id' => 'required|exists:register_dates,id',
            'time'             => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $time = RegisterTime::create([
                'register_date_id' => $request->register_date_id,
                'time'             => $request->time,
                'is_active'        => true,
            ]);

            return back()->with('success', 'Time slot added successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to add time slot');
        }
    }

    /**
     * Update register time status or fields
     */
    public function updateRegisterTime(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'sometimes|boolean',
            'time'      => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            $time       = RegisterTime::findOrFail($id);
            $updateData = [];
            if ($request->has('is_active')) {
                $updateData['is_active'] = (bool) $request->is_active;
            }
            if ($request->has('time')) {
                $updateData['time'] = $request->time;
            }
            if (! empty($updateData)) {
                $time->update($updateData);
            }

            return back()->with('success', 'Time slot updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update time slot');
        }
    }

    /**
     * Delete a register time
     */
    public function deleteRegisterTime($id)
    {
        try {
            $time = RegisterTime::findOrFail($id);
            // Delete associated slots first
            $time->slots()->delete();
            $time->delete();

            return back()->with('success', 'Time slot deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete time slot');
        }
    }

    /**
     * Store a new register slot
     */
    public function storeRegisterSlot(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'register_time_id' => 'required|exists:register_times,id',
            'title'            => 'required|string|max:255',
            'available_slots'  => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $slot = RegisterSlot::create([
                'register_time_id' => $request->register_time_id,
                'title'            => $request->title,
                'available_slots'  => $request->available_slots,
                'is_active'        => true,
            ]);

            return back()->with('success', 'Slot added successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to add slot');
        }
    }

    /**
     * Update register slot status or fields
     */
    public function updateRegisterSlot(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'is_active'       => 'sometimes|boolean',
            'title'           => 'sometimes|string|max:255',
            'available_slots' => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            $slot       = RegisterSlot::findOrFail($id);
            $updateData = [];
            if ($request->has('is_active')) {
                $updateData['is_active'] = (bool) $request->is_active;
            }
            if ($request->has('title')) {
                $updateData['title'] = $request->title;
            }
            if ($request->has('available_slots')) {
                $updateData['available_slots'] = (int) $request->available_slots;
            }
            if (! empty($updateData)) {
                $slot->update($updateData);
            }

            return back()->with('success', 'Slot updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update slot');
        }
    }

    /**
     * Delete a register slot
     */
    public function deleteRegisterSlot($id)
    {
        try {
            $slot = RegisterSlot::findOrFail($id);
            $slot->delete();

            return back()->with('success', 'Slot deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete slot');
        }
    }

    /**
     * Display all registrations with date/time/slot information
     */
    public function registrations(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));

        $registrations = RegisterDate::with(['times.slots.userSelections' => function ($query) use ($search) {
            $query->where('is_delete', false);
            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('userid', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            }
        }])
            ->orderBy('date')
            ->get()
            ->map(function ($date) {
                $times = $date->times->map(function ($time) {
                    $slots = $time->slots->map(function ($slot) {
                        $userSelections = $slot->userSelections->map(function ($selection) {
                            return [
                                'id'            => $selection->id,
                                'userid'        => $selection->userid,
                                'name'          => $selection->name,
                                'position'      => $selection->position,
                                'department'    => $selection->department,
                                'register_type' => $selection->register_type,
                            ];
                        });

                        return [
                            'id'              => $slot->id,
                            'title'           => $slot->title,
                            'available_slots' => $slot->available_slots,
                            'userSelections'  => $userSelections,
                        ];
                    })
                        ->filter(function ($slot) {
                            return $slot['userSelections']->count() > 0;
                        })
                        ->values();

                    return [
                        'id'             => $time->id,
                        'time'           => $time->time,
                        'formatted_time' => date('g:i A', strtotime($time->time)),
                        'slots'          => $slots,
                    ];
                })
                    ->filter(function ($time) {
                        return collect($time['slots'])->count() > 0;
                    })
                    ->sortBy('time')
                    ->values();

                return [
                    'id'             => $date->id,
                    'date'           => $date->date->format('Y-m-d'),
                    'formatted_date' => $date->date->format('l, F j, Y'),
                    'times'          => $times,
                ];
            })
            ->filter(function ($date) {
                return collect($date['times'])->count() > 0;
            })
            ->values();

        return Inertia::render('admin/registrations', [
            'registrations' => $registrations,
            'search'        => $search,
        ]);
    }

    /**
     * Delete a user registration
     */
    public function deleteRegistration($id)
    {
        try {
            $selection = UserSlotSelection::findOrFail($id);
            $selection->update(['is_delete' => true]);

            return back()->with('success', 'Registration deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete registration');
        }
    }

    /**
     * Export all user slot selections grouped by date and time to Excel
     */
    public function exportRegistrations()
    {
        $filename = 'registrations_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new \App\Exports\RegistrationsExport(), $filename);
    }
}
