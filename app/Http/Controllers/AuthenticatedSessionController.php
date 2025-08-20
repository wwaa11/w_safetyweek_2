<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function login(Request $request): Response
    {

        return Inertia::render('auth/login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        // In local environment, bypass authentication
        if (config('app.env') === 'local') {
            $userid = $request->input('userid');
            if (! $userid) {
                return back()->withErrors(['userid' => 'User ID is required']);
            }

            try {
                $response = Http::withHeaders(['token' => env('API_AUTH_KEY')])
                    ->post('http://172.20.1.12/dbstaff/api/getuser', ['userid' => $userid])
                    ->json();
            } catch (\Throwable $e) {
                return back()->withErrors(['userid' => 'Cannot reach user service']);
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
                if (! $user->role) {
                    $user->role = 'user';
                }
                $user->save();

                Auth::login($user);
                $request->session()->regenerate();
                return redirect()->intended(route('users.dashboard'));
            }

            return back()->withErrors(['userid' => 'User not found']);
        }

        $request->authenticate($request);

        $request->session()->regenerate();

        return redirect()->intended(route('users.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
