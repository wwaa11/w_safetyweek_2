<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function login(Request $request): Response
    {
        return Inertia::render('auth/login');
    }

    public function store(LoginRequest $request): JsonResponse
    {
        // In local environment, bypass authentication
        if (config('app.env') === 'local') {
            $userid = $request->input('userid');
            if (! $userid) {
                return response()->json([
                    'status' => 0,
                    'errors' => ['userid' => 'User ID is required'],
                ], 422);
            }

            try {
                $response = Http::withHeaders(['token' => env('API_AUTH_KEY')])
                    ->post('http://172.20.1.12/dbstaff/api/getuser', ['userid' => $userid])
                    ->json();
            } catch (\Throwable $e) {
                return response()->json([
                    'status' => 0,
                    'errors' => ['userid' => 'Cannot reach user service'],
                ], 422);
            }

            if (is_array($response) && ($response['status'] ?? 0) == 1 && isset($response['user'])) {
                $userData = $response['user'];
                $user     = User::where('user_id', $userid)->first();
                if (! $user) {
                    $user          = new User();
                    $user->user_id = $userid;
                }
                $user->name       = $userData['name'] ?? ($user->name ?? $userid);
                $user->department = $userData['department'] ?? $user->department;
                $user->position   = $userData['position'] ?? $user->position;
                $user->save();

                Auth::login($user);
                $request->session()->regenerate();

                return response()->json([
                    'status'   => 1,
                    'message'  => 'Login successful',
                    'redirect' => route('admin.dashboard'),
                ]);
            }

            return response()->json([
                'status' => 0,
                'errors' => ['userid' => 'User not found'],
            ], 422);
        }

        $request->authenticate();

        $request->session()->regenerate();

        return response()->json([
            'status'   => 1,
            'message'  => 'Login successful',
            'redirect' => route('admin.dashboard'),
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
