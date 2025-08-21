<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSlotSelection extends Model
{
    protected $fillable = [
        'userid',
        'name',
        'position',
        'department',
        'register_type',
        'is_delete',
        'register_slot_id',
    ];

    protected $casts = [
        'is_delete' => 'boolean',
    ];

    /**
     * Get the slot that owns this selection
     */
    public function slot(): BelongsTo
    {
        return $this->belongsTo(RegisterSlot::class, 'register_slot_id');
    }

    /**
     * Get the time that owns this selection through the slot
     */
    public function time(): BelongsTo
    {
        return $this->belongsTo(RegisterTime::class, 'register_slot_id', 'id');
    }

    /**
     * Scope to get active selections
     */
    public function scopeActive($query)
    {
        return $query->where('is_delete', false);
    }
}
