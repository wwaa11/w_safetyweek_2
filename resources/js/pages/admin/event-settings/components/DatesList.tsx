import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Pencil, Save, X, Trash2, Users } from 'lucide-react';
import { RegisterDate } from '../types';

interface Props {
    registerDates: RegisterDate[];
    isLoading: boolean;
    toggleDateActive: (index: number) => void;
    confirmDeleteDate: (index: number) => void;
    toggleTimeActive: (timeId: number) => void;
    confirmDeleteTime: (timeId: number) => void;
    toggleSlotActive: (slotId: number) => void;
    confirmDeleteSlot: (slotId: number) => void;
    updateTimeValue: (timeId: number, newTime: { start_time: string; end_time: string }) => void;
    updateSlotDetails: (slotId: number, payload: { title?: string; available_slots?: number }) => void;
}

export function DatesList({ registerDates, isLoading, toggleDateActive, confirmDeleteDate, toggleTimeActive, confirmDeleteTime, toggleSlotActive, confirmDeleteSlot, updateTimeValue, updateSlotDetails }: Props) {
    const [editingTimeId, setEditingTimeId] = useState<number | null>(null);
    const [editingTimeValue, setEditingTimeValue] = useState<{ start_time: string; end_time: string }>({ start_time: '', end_time: '' });
    const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
    const [editingSlotTitle, setEditingSlotTitle] = useState('');
    const [editingSlotCapacity, setEditingSlotCapacity] = useState<number | ''>('');

    const startEditTime = (timeId: number, current: { start_time?: string; end_time?: string }) => {
        setEditingTimeId(timeId);
        setEditingTimeValue({
            start_time: current.start_time || '',
            end_time: current.end_time || ''
        });
    };

    const cancelEditTime = () => {
        setEditingTimeId(null);
        setEditingTimeValue({ start_time: '', end_time: '' });
    };

    const saveEditTime = () => {
        if (editingTimeId !== null && editingTimeValue.start_time && editingTimeValue.end_time) {
            if (editingTimeValue.start_time >= editingTimeValue.end_time) {
                alert('End time must be after start time');
                return;
            }
            updateTimeValue(editingTimeId, editingTimeValue);
            cancelEditTime();
        }
    };

    const startEditSlot = (slotId: number, currentTitle: string, currentCapacity: number) => {
        setEditingSlotId(slotId);
        setEditingSlotTitle(currentTitle);
        setEditingSlotCapacity(currentCapacity);
    };
    const cancelEditSlot = () => {
        setEditingSlotId(null);
        setEditingSlotTitle('');
        setEditingSlotCapacity('');
    };
    const saveEditSlot = () => {
        if (editingSlotId !== null && editingSlotTitle.trim() && editingSlotCapacity && editingSlotCapacity > 0) {
            updateSlotDetails(editingSlotId, { title: editingSlotTitle.trim(), available_slots: Number(editingSlotCapacity) });
            cancelEditSlot();
        }
    };

    const formatTimeRange = (time: { start_time?: string; end_time?: string; time?: string }) => {
        if (time.start_time && time.end_time) {
            return `${time.start_time} - ${time.end_time}`;
        }
        return time.time || 'No time set';
    };

    // Sort dates and times for proper ordering
    // Note: Backend already provides sorted data, this is a fallback for consistent ordering
    const sortedDates = [...registerDates].sort((a, b) => {
        // First sort by date ascending
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        // If dates are equal, sort by start_time ascending
        const timeA = a.times?.[0]?.start_time || '';
        const timeB = b.times?.[0]?.start_time || '';

        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0;
    });

    // Sort times within each date by start_time ascending
    // This ensures consistent ordering even if backend sorting changes
    const sortedDatesWithSortedTimes = sortedDates.map(date => ({
        ...date,
        times: date.times ? [...date.times].sort((a, b) => {
            const timeA = a.start_time || a.time || '';
            const timeB = b.start_time || b.time || '';

            if (timeA < timeB) return -1;
            if (timeA > timeB) return 1;
            return 0;
        }) : []
    }));

    return (
        <div className="space-y-6">
            {sortedDatesWithSortedTimes.map((date) => (
                <div key={date.id} className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-slate-200">
                        <div className="flex items-center gap-4">
                            <Checkbox
                                checked={date.is_active}
                                onCheckedChange={() => toggleDateActive(registerDates.findIndex((d) => d.id === date.id))}
                                disabled={isLoading}
                                className="w-5 h-5 border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div className="flex items-center gap-3">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                <span className={`text-xl font-bold ${date.is_active ? 'text-slate-900' : 'line-through text-slate-500'}`}>
                                    {new Date(date.date).toLocaleDateString()}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                    {date.times?.length || 0} time slots
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteDate(registerDates.findIndex((d) => d.id === date.id))}
                            disabled={isLoading}
                            className="h-10 w-10 p-0 border-2 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 bg-white hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="p-6">
                        {date.times && date.times.length > 0 ? (
                            <div className="space-y-4">
                                {date.times.map((time) => (
                                    <div key={time.id} className="border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 border-b-2 border-slate-200">
                                            <div className="flex items-center gap-4">
                                                <Checkbox
                                                    checked={time.is_active}
                                                    onCheckedChange={() => toggleTimeActive(time.id!)}
                                                    disabled={isLoading}
                                                    className="w-4 h-4 border-2 border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <Clock className="h-5 w-5 text-purple-600" />
                                                    {editingTimeId === time.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="text"
                                                                value={editingTimeValue.start_time}
                                                                onChange={(e) => setEditingTimeValue({ ...editingTimeValue, start_time: e.target.value })}
                                                                className="h-8 w-32"
                                                                placeholder="09:00"
                                                            />
                                                            <span className="text-gray-500">to</span>
                                                            <Input
                                                                type="text"
                                                                value={editingTimeValue.end_time}
                                                                onChange={(e) => setEditingTimeValue({ ...editingTimeValue, end_time: e.target.value })}
                                                                className="h-8 w-32"
                                                                placeholder="10:00"
                                                            />
                                                            <Button variant="outline" size="sm" onClick={saveEditTime} className="h-8 px-2"><Save className="h-3 w-3" /></Button>
                                                            <Button variant="ghost" size="sm" onClick={cancelEditTime} className="h-8 px-2"><X className="h-3 w-3" /></Button>
                                                        </div>
                                                    ) : (
                                                        <span className={`text-lg font-semibold ${time.is_active ? 'text-slate-900' : 'line-through text-slate-500'}`}>
                                                            {formatTimeRange(time)}
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                                        {time.slots?.length || 0} slots
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editingTimeId !== time.id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => startEditTime(time.id!, { start_time: time.start_time, end_time: time.end_time })}
                                                        disabled={isLoading}
                                                        className="h-8 w-8 p-0 border-2"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => confirmDeleteTime(time.id!)}
                                                    disabled={isLoading}
                                                    className="h-8 w-8 p-0 border-2 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 bg-white hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50">
                                            {time.slots && time.slots.length > 0 ? (
                                                <div className="space-y-3">
                                                    {time.slots.map((slot) => (
                                                        <div key={slot.id} className="flex items-center justify-between p-3 border-2 border-slate-200 rounded-lg bg-white shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <Checkbox
                                                                    checked={slot.is_active}
                                                                    onCheckedChange={() => toggleSlotActive(slot.id!)}
                                                                    disabled={isLoading}
                                                                    className="w-4 h-4 border-2 border-slate-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                                                                />
                                                                <div className="flex items-center gap-3">
                                                                    <Users className="h-4 w-4 text-orange-600" />
                                                                    {editingSlotId === slot.id ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <Input type="text" value={editingSlotTitle} onChange={(e) => setEditingSlotTitle(e.target.value)} className="h-8 w-40" />
                                                                            <Input type="number" min={1} value={editingSlotCapacity} onChange={(e) => setEditingSlotCapacity(e.target.value === '' ? '' : Number(e.target.value))} className="h-8 w-24" />
                                                                            <Button variant="outline" size="sm" onClick={saveEditSlot} className="h-8 px-2"><Save className="h-3 w-3" /></Button>
                                                                            <Button variant="ghost" size="sm" onClick={cancelEditSlot} className="h-8 px-2"><X className="h-3 w-3" /></Button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`font-semibold ${slot.is_active ? 'text-slate-900' : 'line-through text-slate-500'}`}>
                                                                            {slot.title}
                                                                        </span>
                                                                    )}
                                                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                                                                        {slot.available_slots} slots
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {editingSlotId !== slot.id && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => startEditSlot(slot.id!, slot.title, slot.available_slots)}
                                                                        disabled={isLoading}
                                                                        className="h-7 w-7 p-0 border-2"
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => confirmDeleteSlot(slot.id!)}
                                                                    disabled={isLoading}
                                                                    className="h-7 w-7 p-0 border-2 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 bg-white hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-3 w-7" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-gray-500">
                                                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                    <p>No registration slots created yet.</p>
                                                    <p className="text-sm">Create slots to allow users to register for this time.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p>No time slots created yet.</p>
                                <p className="text-sm">Add time slots to allow users to register for this date.</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}


