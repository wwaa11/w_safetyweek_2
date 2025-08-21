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
            $table->date('register_start_date');
            $table->date('register_end_date');
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
            $table->timestamps();
        });

        Schema::create('register_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('register_time_id');
            $table->string('title');
            $table->integer('available_slots');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_slot_selections', function (Blueprint $table) {
            $table->id();
            $table->string('userid');
            $table->string('name');
            $table->string('position')->nullable();
            $table->string('department')->nullable();
            $table->boolean('is_delete')->default(false);
            $table->foreignId('register_slot_id')->constrained('register_slots')->onDelete('cascade');
            $table->enum('register_type', ['regular', 'outsource'])->default('regular');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_slot_selections');
        Schema::dropIfExists('register_slots');
        Schema::dropIfExists('register_times');
        Schema::dropIfExists('register_dates');
        Schema::dropIfExists('settings');
    }
};
