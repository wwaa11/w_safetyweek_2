<?php
namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'title',
        'register_start_date',
        'register_end_date',
    ];

    protected $casts = [
        'register_start_date' => 'date:Y-m-d',
        'register_end_date'   => 'date:Y-m-d',
    ];

    // Accessors to ensure dates are always returned in Y-m-d format
    public function getRegisterStartDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function getRegisterEndDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }
}
