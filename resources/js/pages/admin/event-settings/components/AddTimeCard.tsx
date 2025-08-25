import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { EventSettingsProps, RegisterDate } from '../types';

interface Props {
    registerDates: RegisterDate[];
    selectedDateId: number | null;
    setSelectedDateId: (id: number | null) => void;
    newTime: { start_time: string; end_time: string };
    setNewTime: (v: { start_time: string; end_time: string }) => void;
    isLoading: boolean;
    errors?: EventSettingsProps['errors'];
    onAdd: () => void;
}

export function AddTimeCard({ registerDates, selectedDateId, setSelectedDateId, newTime, setNewTime, isLoading, errors, onAdd }: Props) {
    const handleStartTimeChange = (value: string) => {
        setNewTime({ ...newTime, start_time: value });
    };

    const handleEndTimeChange = (value: string) => {
        setNewTime({ ...newTime, end_time: value });
    };

    const isValidTimeRange = newTime.start_time && newTime.end_time && newTime.start_time < newTime.end_time;

    return (
        <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Add Time Slot to Date
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="date-select" className="text-sm font-medium mb-2 block">
                        Select Date
                    </Label>
                    <select
                        id="date-select"
                        className="w-full h-10 px-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedDateId || ''}
                        onChange={(e) => setSelectedDateId(Number(e.target.value))}
                    >
                        <option value="">Choose a date</option>
                        {registerDates.map((date) => (
                            <option key={date.id} value={date.id}>
                                {new Date(date.date).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label htmlFor="start_time" className="text-sm font-medium mb-2 block">
                        Start Time
                    </Label>
                    <Input
                        id="start_time"
                        type="text"
                        value={newTime.start_time}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        placeholder="e.g., 09:00"
                        className={errors?.start_time ? 'border-red-400' : ''}
                    />
                </div>
                <div>
                    <Label htmlFor="end_time" className="text-sm font-medium mb-2 block">
                        End Time
                    </Label>
                    <Input
                        id="end_time"
                        type="text"
                        value={newTime.end_time}
                        onChange={(e) => handleEndTimeChange(e.target.value)}
                        placeholder="e.g., 10:00"
                        className={errors?.end_time ? 'border-red-400' : ''}
                    />
                </div>
                <div className="flex items-end">
                    <Button
                        onClick={onAdd}
                        disabled={!isValidTimeRange || selectedDateId === null || isLoading}
                        className="px-6 w-full"
                    >
                        {isLoading ? 'Adding...' : 'Add Time'}
                    </Button>
                </div>
            </div>
            {errors?.start_time && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.start_time}
                </p>
            )}
            {errors?.end_time && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.end_time}
                </p>
            )}
            {!isValidTimeRange && newTime.start_time && newTime.end_time && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    End time must be after start time
                </p>
            )}
        </div>
    );
}


