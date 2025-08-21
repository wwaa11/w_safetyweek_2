<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegisterSlot extends Model
{
    protected $fillable = [
        'register_time_id',
        'title',
        'available_slots',
        'is_active',
    ];

    protected $casts = [
        'available_slots' => 'integer',
        'is_active'       => 'boolean',
    ];

    /**
     * Get the time that owns this slot
     */
    public function time(): BelongsTo
    {
        return $this->belongsTo(RegisterTime::class, 'register_time_id');
    }

    /**
     * Get the user selections for this slot
     */
    public function userSelections(): HasMany
    {
        return $this->hasMany(UserSlotSelection::class, 'register_slot_id');
    }
}
