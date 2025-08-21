import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { EventSettingsProps, RegisterDate } from '../types';

interface Props {
    registerDates: RegisterDate[];
    selectedDateId: number | null;
    setSelectedDateId: (id: number | null) => void;
    newTime: string;
    setNewTime: (v: string) => void;
    isLoading: boolean;
    errors?: EventSettingsProps['errors'];
    onAdd: () => void;
}

export function AddTimeCard({ registerDates, selectedDateId, setSelectedDateId, newTime, setNewTime, isLoading, errors, onAdd }: Props) {
    return (
        <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Add Time Slot to Date
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                    <Label htmlFor="time" className="text-sm font-medium mb-2 block">
                        Time
                    </Label>
                    <Input
                        id="time"
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        placeholder="Select time"
                        className={errors?.time ? 'border-red-400' : ''}
                    />
                </div>
                <div className="flex items-end">
                    <Button onClick={onAdd} disabled={!newTime || selectedDateId === null || isLoading} className="px-6 w-full">
                        {isLoading ? 'Adding...' : 'Add Time'}
                    </Button>
                </div>
            </div>
            {errors?.time && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.time}
                </p>
            )}
        </div>
    );
}


