<?php
namespace App\Http\Controllers;

use App\Models\RegisterDate;
use App\Models\RegisterSlot;
use App\Models\RegisterTime;
use App\Models\Setting;
use App\Models\UserSlotSelection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WebController extends Controller
{
    public function index()
    {
        // Get event settings
        $settings = Setting::first();

        // Check if registration is currently open
        $isRegistrationOpen = false;
        $currentDate        = now()->toDateString();

        if ($settings && $settings->register_start_date && $settings->register_end_date) {
            $isRegistrationOpen = $currentDate >= $settings->register_start_date && $currentDate <= $settings->register_end_date;
        }

        $availableDates = RegisterDate::with(['times.slots'])
            ->where('is_active', true)
            ->whereHas('times', function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('date')
            ->get()
            ->map(function ($date) {
                return [
                    'id'             => $date->id,
                    'date'           => $date->date->format('Y-m-d'),
                    'formatted_date' => $date->date->format('l, F j, Y'),
                    'times'          => $date->times->map(function ($time) {
                        // Calculate remaining available slots for this time
                        $totalCapacity   = $time->slots->where('is_active', true)->sum('available_slots');
                        $registeredCount = UserSlotSelection::whereHas('slot', function ($query) use ($time) {
                            $query->where('register_time_id', $time->id);
                        })->where('is_delete', false)->count();
                        $remainingSlots = max(0, $totalCapacity - $registeredCount);

                        return [
                            'id'                    => $time->id,
                            'time'                  => $time->time,
                            'formatted_time'        => date('g:i A', strtotime($time->time)),
                            'total_available_slots' => $remainingSlots, // Remaining slots = Total capacity - Registered count
                        ];
                    })->sortBy('time')->values(),
                ];
            });
        return Inertia::render('user-index', [
            'availableDates' => $availableDates,
            'settings'       => [
                'title'                => $settings?->title ?? 'Safety Week Registration',
                'register_start_date'  => $settings?->register_start_date,
                'register_end_date'    => $settings?->register_end_date,
                'is_registration_open' => $isRegistrationOpen,
            ],
        ]);
    }

    public function getUser(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|string|max:255|min:1',
        ]);

        $userId = trim($request->input('user_id'));

        if (empty($userId)) {
            return response()->json([
                'success' => false,
                'message' => 'User ID cannot be empty',
            ], 400);
        }

        try {
            // Make API call to external service
            try {
                $response = Http::withHeaders(['token' => env('API_AUTH_KEY')])
                    ->post('http://172.20.1.12/dbstaff/api/getuser', ['userid' => $userId])
                    ->json();
            } catch (\Throwable $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot reach user service',
                ], 500);
            }

            if (is_array($response) && ($response['status'] ?? 0) == 1 && isset($response['user'])) {
                $user = [
                    'name'       => $response['user']['name'],
                    'department' => $response['user']['department'],
                ];

                return response()->json([
                    'success' => true,
                    'user'    => $user,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $response['message'] ?? 'User not found',
                ], 404);
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection timeout. Please try again.',
            ], 408);
        } catch (\Exception $e) {
            \Log::error('GetUser API Error: ' . $e->getMessage(), [
                'user_id' => $userId,
                'error'   => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error. Please try again later.',
            ], 500);
        }
    }

    public function getSlotSelection(Request $request, $id): JsonResponse
    {
        try {
            // Find the slot selection by ID with related data
            $slotSelection = UserSlotSelection::with([
                'slot.time.date',
            ])
                ->where('id', $id)
                ->where('is_delete', false)
                ->first();

            if (! $slotSelection) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot selection not found or has been cancelled.',
                ], 404);
            }

            // Format the response data
            $formattedSelection = [
                'id'            => $slotSelection->id,
                'userid'        => $slotSelection->userid,
                'name'          => $slotSelection->name,
                'department'    => $slotSelection->department,
                'register_type' => $slotSelection->register_type,
                'time_id'       => $slotSelection->slot->time->id ?? null,
                'date_id'       => $slotSelection->slot->time->date->id ?? null,
                'slot_title'    => $slotSelection->slot->title ?? 'N/A',
                'time'          => $slotSelection->slot->time ? date('g:i A', strtotime($slotSelection->slot->time->time)) : 'N/A',
                'date'          => $slotSelection->slot->time->date ? $slotSelection->slot->time->date->date->format('l, F j, Y') : 'N/A',
                'created_at'    => $slotSelection->created_at->toISOString(),
            ];

            return response()->json([
                'success'        => true,
                'slot_selection' => $formattedSelection,
            ]);

        } catch (\Exception $e) {
            \Log::error('Get Slot Selection Error: ' . $e->getMessage(), [
                'selection_id' => $id,
                'error'        => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve slot selection. Please try again.',
            ], 500);
        }
    }

    public function registerSlot(Request $request): JsonResponse
    {
        $request->validate([
            'userid'        => 'required|string|max:255',
            'name'          => 'required|string|max:255',
            'department'    => 'nullable|string|max:255',
            'register_type' => 'required|in:regular,outsource',
            'time_id'       => 'required|integer|exists:register_times,id',
        ]);

        try {
            // Check if user already has a selection
            $existingSelection = UserSlotSelection::where('userid', $request->userid)
                ->where('is_delete', false)
                ->first();

            if ($existingSelection) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already registered for a slot. Only one registration per user is allowed.',
                ], 400);
            }

            // Find the time and get its available slots
            $time = RegisterTime::with(['slots' => function ($query) {
                $query->where('is_active', true);
            }, 'date'])->find($request->time_id);

            if (! $time || ! $time->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected time slot is not available.',
                ], 400);
            }

            // Find an available slot for this time
            $availableSlot = null;
            foreach ($time->slots as $slot) {
                // Count current selections for this slot
                $currentSelections = UserSlotSelection::where('register_slot_id', $slot->id)
                    ->where('is_delete', false)
                    ->count();

                if ($currentSelections < $slot->available_slots) {
                    $availableSlot = $slot;
                    break;
                }
            }

            if (! $availableSlot) {
                return response()->json([
                    'success' => false,
                    'message' => 'No available slots for this time. All slots are full.',
                ], 400);
            }

            // Create the selection
            $selection = UserSlotSelection::create([
                'userid'           => $request->userid,
                'name'             => $request->name,
                'department'       => $request->department,
                'register_type'    => $request->register_type,
                'register_slot_id' => $availableSlot->id,
                'is_delete'        => false,
            ]);

            return response()->json([
                'success'           => true,
                'message'           => 'Successfully registered for the selected time slot!',
                'slot_selection_id' => $selection->id,
                'slot_info'         => [
                    'slot_id'    => $availableSlot->id,
                    'slot_title' => $availableSlot->title,
                    'time'       => date('g:i A', strtotime($time->time)),
                    'date'       => $time->date->date->format('l, F j, Y'),
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Register Slot Error: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'error'        => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to register for slot. Please try again.',
            ], 500);
        }
    }

    public function searchRegistrations(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'required|string|min:1|max:255',
        ]);

        $search = trim($request->input('search'));

        try {
            $registrations = UserSlotSelection::with([
                'slot.time.date',
            ])
                ->where('is_delete', false)
                ->where(function ($query) use ($search) {
                    $query->where('userid', 'LIKE', "%{$search}%")
                        ->orWhere('name', 'LIKE', "%{$search}%");
                })
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(function ($registration) {
                    return [
                        'id'            => $registration->id,
                        'userid'        => $registration->userid,
                        'name'          => $registration->name,
                        'department'    => $registration->department,
                        'register_type' => $registration->register_type,
                        'slot_title'    => $registration->slot->title ?? 'N/A',
                        'time'          => $registration->slot->time ? date('g:i A', strtotime($registration->slot->time->time)) : 'N/A',
                        'date'          => $registration->slot->time->date ? $registration->slot->time->date->date->format('l, F j, Y') : 'N/A',
                        'created_at'    => $registration->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'success'       => true,
                'registrations' => $registrations,
                'count'         => $registrations->count(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Search Registrations Error: ' . $e->getMessage(), [
                'search_term' => $search,
                'error'       => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to search registrations. Please try again.',
            ], 500);
        }
    }
}
