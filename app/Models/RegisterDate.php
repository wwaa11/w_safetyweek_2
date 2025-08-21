<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegisterDate extends Model
{
    protected $fillable = [
        'date',
        'is_active',
    ];

    protected $casts = [
        'date'      => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the times associated with this date
     */
    public function times(): HasMany
    {
        return $this->hasMany(RegisterTime::class);
    }
}
