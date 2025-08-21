<?php
namespace Database\Seeders;

use App\Models\RegisterDate;
use App\Models\RegisterSlot;
use App\Models\RegisterTime;
use App\Models\User;
use Carbon\Carbon;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name'  => 'Test User',
            'email' => 'test@example.com',
            'role'  => 'user',
        ]);

        User::factory()->create([
            'name'  => 'Admin User',
            'email' => 'admin@example.com',
            'role'  => 'admin',
        ]);

        // Create test registration data
        $this->createTestRegistrationData();
    }

    private function createTestRegistrationData(): void
    {
        // Create dates for the next 7 days
        for ($i = 1; $i <= 7; $i++) {
            $date = Carbon::now()->addDays($i);

            $registerDate = RegisterDate::create([
                'date'      => $date->format('Y-m-d'),
                'is_active' => true,
            ]);

            // Create time slots for each date
            $times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

            foreach ($times as $time) {
                $registerTime = RegisterTime::create([
                    'register_date_id' => $registerDate->id,
                    'time'             => $time,
                    'is_active'        => true,
                ]);

                // Create slots for each time
                $slotTitles = ['Safety Training', 'Equipment Check', 'Emergency Procedures'];

                foreach ($slotTitles as $title) {
                    RegisterSlot::create([
                        'register_time_id' => $registerTime->id,
                        'title'            => $title,
                        'available_slots'  => rand(5, 20),
                        'is_active'        => true,
                    ]);
                }
            }
        }
    }
}
