<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->datetime('register_start_date');
            $table->datetime('register_end_date');
            $table->timestamps();
        });

        Schema::create('register_dates', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('register_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('register_date_id');
            $table->string('time');
            $table->boolean('is_active')->default(true);
            $table->integer('available_slots');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
