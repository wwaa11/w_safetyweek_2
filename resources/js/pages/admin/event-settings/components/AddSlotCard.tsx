import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, Zap } from 'lucide-react';
import { EventSettingsProps, RegisterDate } from '../types';
import { useState } from 'react';

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
    onAdd: (massAdd: boolean) => void;
}

export function AddSlotCard({ registerDates, selectedTimeId, setSelectedTimeId, newSlotTitle, setNewSlotTitle, newSlotCapacity, setNewSlotCapacity, isLoading, errors, onAdd }: Props) {
    const [massAdd, setMassAdd] = useState(false);

    // Get all available time IDs for mass adding
    const allTimeIds = registerDates.flatMap((date) =>
        date.times ? date.times.map((time) => time.id!) : []
    );

    const canMassAdd = massAdd && newSlotTitle && newSlotCapacity > 0 && allTimeIds.length > 0;
    const canSingleAdd = !massAdd && newSlotTitle && selectedTimeId !== null && newSlotCapacity > 0;

    return (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-r from-slate-50 to-orange-50">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Add Registration Slot to Time
            </h3>

            {/* Mass Add Checkbox */}
            <div className={`mb-4 p-3 rounded-lg border ${massAdd && allTimeIds.length === 0
                ? 'bg-red-100 border-red-200'
                : 'bg-orange-100 border-orange-200'
                }`}>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="mass-add"
                        checked={massAdd}
                        onCheckedChange={(checked) => setMassAdd(checked as boolean)}
                        className={`w-4 h-4 border-2 ${massAdd && allTimeIds.length === 0
                            ? 'border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600'
                            : 'border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600'
                            }`}
                    />
                    <Label htmlFor="mass-add" className={`text-sm font-medium ${massAdd && allTimeIds.length === 0 ? 'text-red-800' : 'text-orange-800'
                        }`}>
                        Mass Add to All Times
                    </Label>
                    {massAdd && allTimeIds.length > 0 && (
                        <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                            {allTimeIds.length} time{allTimeIds.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <p className={`text-xs mt-1 ml-6 ${massAdd && allTimeIds.length === 0
                    ? 'text-red-700'
                    : 'text-orange-700'
                    }`}>
                    {massAdd
                        ? allTimeIds.length === 0
                            ? 'No time slots available for mass adding. Please add time slots first.'
                            : `Will create "${newSlotTitle}" slot with ${newSlotCapacity} capacity across ${allTimeIds.length} time slots`
                        : 'Enable to add the same slot to all available time slots at once'
                    }
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor="time-select" className="text-sm font-semibold text-slate-700 mb-2 block">
                        {massAdd ? 'Time Selection (Disabled)' : 'Select Time'}
                    </Label>
                    <select
                        id="time-select"
                        className={`w-full h-12 px-4 border-2 border-slate-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${massAdd
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                            }`}
                        value={selectedTimeId || ''}
                        onChange={(e) => setSelectedTimeId(Number(e.target.value))}
                        disabled={massAdd}
                    >
                        <option value="">Choose a time</option>
                        {registerDates.flatMap((date) =>
                            date.times
                                ? date.times.map((time) => (
                                    <option key={time.id} value={time.id}>
                                        {new Date(date.date).toLocaleDateString()} - {time.start_time && time.end_time ? `${time.start_time} - ${time.end_time}` : (time.time || 'No time set')}
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
                    <Button
                        onClick={() => onAdd(massAdd)}
                        disabled={!((massAdd && canMassAdd) || (!massAdd && canSingleAdd)) || isLoading}
                        className={`px-6 w-full ${massAdd ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                {massAdd ? 'Adding to All Times...' : 'Adding...'}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {massAdd ? <Zap className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {massAdd ? `Add to All ${allTimeIds.length} Times` : 'Add Slot'}
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


