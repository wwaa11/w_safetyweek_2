<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegisterTime extends Model
{
    protected $fillable = [
        'register_date_id',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'string',
        'end_time'   => 'string',
        'is_active'  => 'boolean',
    ];

    /**
     * Get the date that owns this time
     */
    public function date(): BelongsTo
    {
        return $this->belongsTo(RegisterDate::class, 'register_date_id');
    }

    /**
     * Get the slots associated with this time
     */
    public function slots(): HasMany
    {
        return $this->hasMany(RegisterSlot::class, 'register_time_id');
    }
}
