import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { EventSettingsProps, RegisterDate } from '../types';

interface Props {
    registerDates: RegisterDate[];
    selectedTimeId: number | null;
    setSelectedTimeId: (id: number | null) => void;
    newSlotTitle: string;
    setNewSlotTitle: (v: string) => void;
    newSlotCapacity: number;
    setNewSlotCapacity: (v: number) => void;
    isLoading: boolean;
    errors?: EventSettingsProps['errors'];
    onAdd: () => void;
}

export function AddSlotCard({ registerDates, selectedTimeId, setSelectedTimeId, newSlotTitle, setNewSlotTitle, newSlotCapacity, setNewSlotCapacity, isLoading, errors, onAdd }: Props) {
    return (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-r from-slate-50 to-orange-50">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Add Registration Slot to Time
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="time-select" className="text-sm font-semibold text-slate-700 mb-2 block">
                        Select Time
                    </Label>
                    <select
                        id="time-select"
                        className="w-full h-12 px-4 border-2 border-slate-200 bg-white rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        value={selectedTimeId || ''}
                        onChange={(e) => setSelectedTimeId(Number(e.target.value))}
                    >
                        <option value="">Choose a time</option>
                        {registerDates.flatMap((date) =>
                            date.times
                                ? date.times.map((time) => (
                                    <option key={time.id} value={time.id}>
                                        {new Date(date.date).toLocaleDateString()} - {time.time}
                                    </option>
                                ))
                                : [],
                        )}
                    </select>
                </div>
                <div>
                    <Label htmlFor="slot-title" className="text-sm font-semibold text-slate-700 mb-2 block">
                        Slot Title
                    </Label>
                    <Input
                        id="slot-title"
                        type="text"
                        value={newSlotTitle}
                        onChange={(e) => setNewSlotTitle(e.target.value)}
                        placeholder="e.g., Group A, Morning Session"
                        className={`h-12 px-4 border-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-500 ${errors?.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                    />
                </div>
                <div>
                    <Label htmlFor="slot-capacity" className="text-sm font-semibold text-slate-700 mb-2 block">
                        Available Slots
                    </Label>
                    <Input
                        id="slot-capacity"
                        type="number"
                        min="1"
                        value={newSlotCapacity}
                        onChange={(e) => setNewSlotCapacity(Number(e.target.value))}
                        placeholder="20"
                        className={`h-12 px-4 border-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-500 ${errors?.available_slots ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                    />
                </div>
                <div className="flex items-end">
                    <Button onClick={onAdd} disabled={!newSlotTitle || selectedTimeId === null || newSlotCapacity <= 0 || isLoading} className="px-6 w-full">
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Adding...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Slot
                            </div>
                        )}
                    </Button>
                </div>
            </div>
            {errors?.title && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.title}
                </p>
            )}
            {errors?.available_slots && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.available_slots}
                </p>
            )}
        </div>
    );
}


