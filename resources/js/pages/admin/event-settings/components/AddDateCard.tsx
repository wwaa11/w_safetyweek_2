import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { EventSettingsProps } from '../types';

interface Props {
    newDate: string;
    setNewDate: (v: string) => void;
    isLoading: boolean;
    errors?: EventSettingsProps['errors'];
    onAdd: () => void;
}

export function AddDateCard({ newDate, setNewDate, isLoading, errors, onAdd }: Props) {
    return (
        <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Add New Date
            </h3>
            <div className="flex gap-3">
                <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Select date"
                    className={errors?.date ? 'border-red-400' : ''}
                />
                <Button onClick={onAdd} disabled={!newDate || isLoading} className="px-6">
                    {isLoading ? 'Adding...' : 'Add Date'}
                </Button>
            </div>
            {errors?.date && <p className="text-sm text-red-500 mt-2">{errors.date}</p>}
        </div>
    );
}


