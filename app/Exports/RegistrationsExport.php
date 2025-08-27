<?php
namespace App\Exports;

use App\Models\RegisterDate;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RegistrationsExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles, WithColumnWidths, ShouldAutoSize
{
    /** @var \Illuminate\Support\Collection<int, array<string, mixed>> */
    protected Collection $rows;
    protected ?string $search;
    protected ?string $department;
    protected ?string $registerType;

    public function __construct(?string $search = null, ?string $department = null, ?string $registerType = null)
    {
        $this->search       = $search;
        $this->department   = $department;
        $this->registerType = $registerType;
        $this->rows         = collect();
    }

    public function collection(): Collection
    {
        try {
            // Use chunking to prevent memory issues in production
            $this->rows = collect();

            $query = RegisterDate::with(['times' => function ($query) {
                $query->orderBy('start_time', 'asc');
            }, 'times.slots.userSelections' => function ($query) {
                $query->where('is_delete', false);

                // Apply search filter
                if ($this->search) {
                    $query->where(function ($q) {
                        $q->where('userid', 'like', "%{$this->search}%")
                            ->orWhere('name', 'like', "%{$this->search}%");
                    });
                }

                // Apply department filter
                if ($this->department) {
                    $query->where('department', $this->department);
                }

                // Apply register type filter
                if ($this->registerType) {
                    $query->where('register_type', $this->registerType);
                }
            }])
                ->orderBy('date', 'asc');

            // Process in chunks to avoid memory issues
            $query->chunk(100, function ($dates) {
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
                                    $timeDisplay   = $time->start_time ?: 'No time set';
                                    $formattedTime = $time->start_time ? date('g:i A', strtotime($time->start_time)) : 'No time set';
                                }

                                // Clean and validate data before adding to collection
                                $this->rows->push([
                                    'date'           => $date->date->format('Y-m-d'),
                                    'formatted_date' => $date->date->format('l, F j, Y'),
                                    'time'           => $timeDisplay,
                                    'formatted_time' => $formattedTime,
                                    'slot_title'     => $this->cleanString($slot->title),
                                    'userid'         => $this->cleanString($selection->userid),
                                    'name'           => $this->cleanString($selection->name),
                                    'position'       => $this->cleanString($selection->position),
                                    'department'     => $this->cleanString($selection->department),
                                    'register_type'  => $this->cleanString($selection->register_type),
                                ]);
                            }
                        }
                    }
                }
            });

            return $this->rows;
        } catch (\Exception $e) {
            // Log the error and create a basic export with error information
            \Log::error('Export error: ' . $e->getMessage());
            \Log::error('Export stack trace: ' . $e->getTraceAsString());

            return collect([
                [
                    'date'           => 'Error',
                    'formatted_date' => 'Export failed',
                    'time'           => 'Please check logs',
                    'formatted_time' => '',
                    'slot_title'     => '',
                    'userid'         => '',
                    'name'           => '',
                    'position'       => '',
                    'department'     => '',
                    'register_type'  => '',
                ],
            ]);
        }
    }

    /**
     * Clean string data to prevent Excel corruption
     */
    private function cleanString($string): string
    {
        if (is_null($string)) {
            return '';
        }

        // Convert to string and clean
        $string = (string) $string;

        // Remove any control characters that might corrupt Excel
        $string = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $string);

        // Trim whitespace
        $string = trim($string);

        // Limit length to prevent Excel issues
        return mb_substr($string, 0, 32767);
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

    public function styles(Worksheet $sheet)
    {
        // Style the header row
        $sheet->getStyle('A1:J1')->applyFromArray([
            'font'      => [
                'bold'  => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill'      => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Style all data rows
        $sheet->getStyle('A2:J' . ($sheet->getHighestRow()))->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Add borders to all cells
        $sheet->getStyle('A1:J' . ($sheet->getHighestRow()))->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color'       => ['rgb' => '000000'],
                ],
            ],
        ]);

        // Freeze the header row
        $sheet->freezePane('A2');
    }

    public function columnWidths(): array
    {
        return [
            'A' => 12, // Date
            'B' => 20, // Date (Formatted)
            'C' => 15, // Time
            'D' => 20, // Time (Formatted)
            'E' => 30, // Slot Title
            'F' => 15, // User ID
            'G' => 25, // Name
            'H' => 20, // Position
            'I' => 20, // Department
            'J' => 15, // Register Type
        ];
    }
}
