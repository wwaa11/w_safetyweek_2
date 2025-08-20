<?php
namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class EventSettingsController extends Controller
{
    /**
     * Display the event settings page
     */
    public function index(): Response
    {
        $settings      = DB::table('settings')->first();
        $registerDates = DB::table('register_dates')->orderBy('date')->get();
        $registerTimes = DB::table('register_times')
            ->join('register_dates', 'register_times.register_date_id', '=', 'register_dates.id')
            ->select('register_times.*', 'register_dates.date')
            ->orderBy('register_dates.date')
            ->orderBy('register_times.time')
            ->get();

        return Inertia::render('settings/event-settings', [
            'settings'      => $settings,
            'registerDates' => $registerDates,
            'registerTimes' => $registerTimes,
        ]);
    }

    /**
     * Store or update general settings
     */
    public function storeSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'               => 'required|string|max:255',
            'register_start_date' => 'required|date',
            'register_end_date'   => 'required|date|after:register_start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::table('settings')->updateOrInsert(
                ['id' => 1],
                [
                    'title'               => $request->title,
                    'register_start_date' => $request->register_start_date,
                    'register_end_date'   => $request->register_end_date,
                    'updated_at'          => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Settings saved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save settings',
            ], 500);
        }
    }

    /**
     * Store a new register date
     */
    public function storeRegisterDate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|unique:register_dates,date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $id = DB::table('register_dates')->insertGetId([
                'date'       => $request->date,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $date = DB::table('register_dates')->find($id);

            return response()->json([
                'success' => true,
                'message' => 'Date added successfully',
                'date'    => $date,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add date',
            ], 500);
        }
    }

    /**
     * Update register date status
     */
    public function updateRegisterDate(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::table('register_dates')
                ->where('id', $id)
                ->update([
                    'is_active'  => $request->is_active,
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Date updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update date',
            ], 500);
        }
    }

    /**
     * Delete a register date
     */
    public function deleteRegisterDate($id): JsonResponse
    {
        try {
            // Delete associated times first
            DB::table('register_times')->where('register_date_id', $id)->delete();

            // Delete the date
            DB::table('register_dates')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Date deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete date',
            ], 500);
        }
    }

    /**
     * Store a new register time
     */
    public function storeRegisterTime(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'register_date_id' => 'required|exists:register_dates,id',
            'time'             => 'required|string',
            'available_slots'  => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $id = DB::table('register_times')->insertGetId([
                'register_date_id' => $request->register_date_id,
                'time'             => $request->time,
                'is_active'        => true,
                'available_slots'  => $request->available_slots,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            $time = DB::table('register_times')
                ->join('register_dates', 'register_times.register_date_id', '=', 'register_dates.id')
                ->select('register_times.*', 'register_dates.date')
                ->where('register_times.id', $id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Time slot added successfully',
                'time'    => $time,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add time slot',
            ], 500);
        }
    }

    /**
     * Update register time status
     */
    public function updateRegisterTime(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::table('register_times')
                ->where('id', $id)
                ->update([
                    'is_active'  => $request->is_active,
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Time slot updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update time slot',
            ], 500);
        }
    }

    /**
     * Delete a register time
     */
    public function deleteRegisterTime($id): JsonResponse
    {
        try {
            DB::table('register_times')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Time slot deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete time slot',
            ], 500);
        }
    }

    /**
     * Save all changes at once
     */
    public function saveAll(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings'                     => 'required|array',
            'settings.title'               => 'required|string|max:255',
            'settings.register_start_date' => 'required|date',
            'settings.register_end_date'   => 'required|date|after:settings.register_start_date',
            'registerDates'                => 'array',
            'registerTimes'                => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Save settings
            DB::table('settings')->updateOrInsert(
                ['id' => 1],
                [
                    'title'               => $request->settings['title'],
                    'register_start_date' => $request->settings['register_start_date'],
                    'register_end_date'   => $request->settings['register_end_date'],
                    'updated_at'          => now(),
                ]
            );

            // Clear existing dates and times
            DB::table('register_times')->delete();
            DB::table('register_dates')->delete();

            // Insert new dates
            if (! empty($request->registerDates)) {
                foreach ($request->registerDates as $date) {
                    $dateId = DB::table('register_dates')->insertGetId([
                        'date'       => $date['date'],
                        'is_active'  => $date['is_active'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Insert times for this date
                    if (! empty($request->registerTimes)) {
                        foreach ($request->registerTimes as $time) {
                            if ($time['register_date_id'] === $date['id']) {
                                DB::table('register_times')->insert([
                                    'register_date_id' => $dateId,
                                    'time'             => $time['time'],
                                    'is_active'        => $time['is_active'],
                                    'available_slots'  => $time['available_slots'],
                                    'created_at'       => now(),
                                    'updated_at'       => now(),
                                ]);
                            }
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'All changes saved successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to save changes: ' . $e->getMessage(),
            ], 500);
        }
    }
}
