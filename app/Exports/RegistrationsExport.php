<?php
namespace App\Exports;

use App\Models\RegisterDate;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class RegistrationsExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    /** @var \Illuminate\Support\Collection<int, array<string, mixed>> */
    protected Collection $rows;

    public function __construct()
    {
        $this->rows = collect();

        $dates = RegisterDate::with(['times' => function ($query) {
            $query->orderBy('start_time', 'asc');
        }, 'times.slots.userSelections' => function ($query) {
            $query->where('is_delete', false);
        }])
            ->orderBy('date', 'asc')
            ->get();

        foreach ($dates as $date) {
            foreach ($date->times as $time) {
                foreach ($time->slots as $slot) {
                    // Only process slots that have non-deleted user selections
                    $nonDeletedSelections = $slot->userSelections->filter(function ($selection) {
                        return $selection->is_delete === false;
                    });

                    foreach ($nonDeletedSelections as $selection) {
                        // Format time display - use time range if available, fallback to old time field
                        $timeDisplay   = '';
                        $formattedTime = '';

                        if ($time->start_time && $time->end_time) {
                            $timeDisplay   = $time->start_time . ' - ' . $time->end_time;
                            $formattedTime = date('g:i A', strtotime($time->start_time)) . ' - ' . date('g:i A', strtotime($time->end_time));
                        } else {
                            $timeDisplay   = $time->start_time || 'No time set';
                            $formattedTime = $time->start_time ? date('g:i A', strtotime($time->start_time)) : 'No time set';
                        }

                        $this->rows->push([
                            'date'           => $date->date->format('Y-m-d'),
                            'formatted_date' => $date->date->format('l, F j, Y'),
                            'time'           => $timeDisplay,
                            'slot_title'     => $slot->title,
                            'userid'         => $selection->userid,
                            'name'           => $selection->name,
                            'department'     => $selection->department,
                            'register_type'  => $selection->register_type,
                        ]);
                    }
                }
            }
        }
    }

    public function collection(): Collection
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return [
            'Date',
            'Date (Formatted)',
            'Time',
            'Slot Title',
            'User ID',
            'Name',
            'Department',
            'Register Type',
        ];
    }

    /**
     * @param array<string, mixed> $row
     */
    public function map($row): array
    {
        return [
            $row['date'],
            $row['formatted_date'],
            $row['time'],
            $row['slot_title'],
            $row['userid'],
            $row['name'],
            $row['department'],
            $row['register_type'],
        ];
    }

    public function title(): string
    {
        return 'Registrations';
    }
}
