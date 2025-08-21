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

        $dates = RegisterDate::with(['times.slots.userSelections' => function ($query) {
            $query->where('is_delete', false);
        }])
            ->orderBy('date')
            ->get();

        foreach ($dates as $date) {
            foreach ($date->times()->orderBy('time')->get() as $time) {
                foreach ($time->slots as $slot) {
                    // Only process slots that have non-deleted user selections
                    $nonDeletedSelections = $slot->userSelections->filter(function ($selection) {
                        return $selection->is_delete === false;
                    });

                    foreach ($nonDeletedSelections as $selection) {
                        $this->rows->push([
                            'date'           => $date->date->format('Y-m-d'),
                            'formatted_date' => $date->date->format('l, F j, Y'),
                            'time'           => $time->time,
                            'formatted_time' => date('g:i A', strtotime($time->time)),
                            'slot_title'     => $slot->title,
                            'userid'         => $selection->userid,
                            'name'           => $selection->name,
                            'position'       => $selection->position,
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
            'Time (Formatted)',
            'Slot Title',
            'User ID',
            'Name',
            'Position',
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
            $row['formatted_time'],
            $row['slot_title'],
            $row['userid'],
            $row['name'],
            $row['position'],
            $row['department'],
            $row['register_type'],
        ];
    }

    public function title(): string
    {
        return 'Registrations';
    }
}
