import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    EventSettingsProps,
    RegisterDate,
    RegisterSlot,
    RegisterTime,
    Setting,
} from './types';

export function useEventSettings({
    settings: initialSettings,
    registerDates: initialDates,
    errors,
}: EventSettingsProps) {
    const [settings, setSettings] = useState<Setting>({
        title: initialSettings?.title || '',
        register_start_date: initialSettings?.register_start_date || '',
        register_end_date: initialSettings?.register_end_date || '',
    });

    const [registerDates, setRegisterDates] = useState<RegisterDate[]>(initialDates || []);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState<{ start_time: string; end_time: string }>({ start_time: '', end_time: '' });
    const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
    const [selectedTimeId, setSelectedTimeId] = useState<number | null>(null);
    const [newSlotTitle, setNewSlotTitle] = useState('');
    const [newSlotCapacity, setNewSlotCapacity] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    // Confirmation dialog states
    const [deleteDateId, setDeleteDateId] = useState<number | null>(null);
    const [deleteTimeId, setDeleteTimeId] = useState<number | null>(null);
    const [deleteSlotId, setDeleteSlotId] = useState<number | null>(null);
    const [showDeleteDateDialog, setShowDeleteDateDialog] = useState(false);
    const [showDeleteTimeDialog, setShowDeleteTimeDialog] = useState(false);
    const [showDeleteSlotDialog, setShowDeleteSlotDialog] = useState(false);

    // Update local state when props change
    useEffect(() => {
        if (initialSettings) {
            setSettings({
                title: initialSettings.title || '',
                register_start_date: initialSettings.register_start_date || '',
                register_end_date: initialSettings.register_end_date || '',
            });
        }
        setRegisterDates(initialDates || []);
    }, [initialSettings, initialDates]);

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!settings.title.trim()) {
            alert('Please enter an event title');
            return;
        }
        if (!settings.register_start_date) {
            alert('Please select a start date');
            return;
        }
        if (!settings.register_end_date) {
            alert('Please select an end date');
            return;
        }
        if (new Date(settings.register_end_date) <= new Date(settings.register_start_date)) {
            alert('End date must be after start date');
            return;
        }

        setIsLoading(true);
        try {
            router.post(route('admin.settings.store'), settings as Record<string, any>, {
                onFinish: () => setIsLoading(false),
                onError: () => setIsLoading(false),
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            setIsLoading(false);
        }
    };

    const addRegisterDate = async () => {
        if (!newDate) return;
        setIsLoading(true);
        try {
            router.post(
                route('admin.dates.store'),
                { date: newDate },
                {
                    onFinish: () => setIsLoading(false),
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        } catch (error) {
            console.error('Error adding date:', error);
            setIsLoading(false);
        }
    };

    const addRegisterTime = async () => {
        if (!newTime.start_time || !newTime.end_time || selectedDateId === null) return;
        if (newTime.start_time >= newTime.end_time) return;

        setIsLoading(true);
        try {
            router.post(
                route('admin.times.store'),
                {
                    register_date_id: selectedDateId,
                    start_time: newTime.start_time,
                    end_time: newTime.end_time
                },
                {
                    onFinish: () => setIsLoading(false),
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        } catch (error) {
            console.error('Error adding time:', error);
            setIsLoading(false);
        }
    };

    const addRegisterSlot = async (massAdd: boolean = false) => {
        if (massAdd) {
            // Mass add to all time slots
            if (!newSlotTitle || newSlotCapacity <= 0) return;

            // Get all available time IDs
            const allTimeIds = registerDates.flatMap((date) =>
                date.times ? date.times.map((time) => time.id!) : []
            );

            if (allTimeIds.length === 0) return;

            setIsLoading(true);
            try {
                // Use the new backend mass add endpoint
                router.post(
                    route('admin.slots.mass-add'),
                    {
                        title: newSlotTitle,
                        available_slots: newSlotCapacity,
                        time_ids: allTimeIds
                    },
                    {
                        onFinish: () => setIsLoading(false),
                        preserveScroll: true,
                        preserveState: true,
                    }
                );

                // Reset form after successful mass add
                setNewSlotTitle('');
                setNewSlotCapacity(10);

            } catch (error) {
                console.error('Error mass adding slots:', error);
                setIsLoading(false);
            }
        } else {
            // Single slot add
            if (!newSlotTitle || selectedTimeId === null || newSlotCapacity <= 0) return;
            setIsLoading(true);
            try {
                router.post(
                    route('admin.slots.store'),
                    { register_time_id: selectedTimeId, title: newSlotTitle, available_slots: newSlotCapacity },
                    {
                        onFinish: () => setIsLoading(false),
                        preserveScroll: true,
                        preserveState: true,
                    },
                );

                // Reset form after successful single add
                setNewSlotTitle('');
                setNewSlotCapacity(10);
                setSelectedTimeId(null);
            } catch (error) {
                console.error('Error adding slot:', error);
                setIsLoading(false);
            }
        }
    };

    const toggleDateActive = async (index: number) => {
        const date = registerDates[index];
        if (!date?.id) return;
        setIsLoading(true);
        try {
            router.post(route('admin.dates.update', { id: date.id }), { is_active: !date.is_active }, {
                onFinish: () => setIsLoading(false),
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error updating date:', error);
            setIsLoading(false);
        }
    };

    const toggleTimeActive = async (timeId: number) => {
        let time: RegisterTime | undefined;
        for (const date of registerDates) {
            if (date.times) {
                time = date.times.find((t) => t.id === timeId);
                if (time) break;
            }
        }
        if (!time?.id) return;
        setIsLoading(true);
        try {
            router.post(route('admin.times.update', { id: time.id }), { is_active: !time.is_active }, {
                onFinish: () => setIsLoading(false),
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error updating time:', error);
            setIsLoading(false);
        }
    };

    const updateTimeValue = async (timeId: number, newTime: { start_time: string; end_time: string }) => {
        let time: RegisterTime | undefined;
        for (const date of registerDates) {
            if (date.times) {
                time = date.times.find((t) => t.id === timeId);
                if (time) break;
            }
        }
        if (!time?.id) return;

        if (newTime.start_time >= newTime.end_time) {
            alert('End time must be after start time');
            return;
        }

        setIsLoading(true);
        try {
            router.post(route('admin.times.update', { id: time.id }), {
                start_time: newTime.start_time,
                end_time: newTime.end_time
            }, {
                onFinish: () => setIsLoading(false),
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error updating time value:', error);
            setIsLoading(false);
        }
    };

    const toggleSlotActive = async (slotId: number) => {
        let slot: RegisterSlot | undefined;
        for (const date of registerDates) {
            if (!date.times) continue;
            for (const time of date.times) {
                if (time.slots) {
                    slot = time.slots.find((s) => s.id === slotId);
                    if (slot) break;
                }
            }
            if (slot) break;
        }
        if (!slot?.id) return;
        setIsLoading(true);
        try {
            router.post(route('admin.slots.update', { id: slot.id }), { is_active: !slot.is_active }, {
                onFinish: () => setIsLoading(false),
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error updating slot:', error);
            setIsLoading(false);
        }
    };

    const updateSlotDetails = async (slotId: number, payload: Partial<Pick<RegisterSlot, 'title' | 'available_slots'>>) => {
        let slot: RegisterSlot | undefined;
        for (const date of registerDates) {
            if (!date.times) continue;
            for (const time of date.times) {
                if (time.slots) {
                    slot = time.slots.find((s) => s.id === slotId);
                    if (slot) break;
                }
            }
            if (slot) break;
        }
        if (!slot?.id) return;
        setIsLoading(true);
        try {
            router.post(route('admin.slots.update', { id: slot.id }), payload as Record<string, any>, {
                onFinish: () => setIsLoading(false),
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error updating slot details:', error);
            setIsLoading(false);
        }
    };

    const confirmDeleteDate = (index: number) => {
        const date = registerDates[index];
        if (!date?.id) return;
        setDeleteDateId(date.id);
        setShowDeleteDateDialog(true);
    };

    const removeDate = async () => {
        if (!deleteDateId) return;
        setIsLoading(true);
        setShowDeleteDateDialog(false); // Close dialog immediately
        try {
            router.post(route('admin.dates.delete', { id: deleteDateId }), {}, {
                onFinish: () => {
                    setIsLoading(false);
                    setDeleteDateId(null);
                },
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error deleting date:', error);
            setIsLoading(false);
            setShowDeleteDateDialog(true); // Reopen dialog on error
        }
    };

    const confirmDeleteTime = (timeId: number) => {
        setDeleteTimeId(timeId);
        setShowDeleteTimeDialog(true);
    };

    const removeTime = async () => {
        if (!deleteTimeId) return;
        setIsLoading(true);
        setShowDeleteTimeDialog(false); // Close dialog immediately
        try {
            router.post(route('admin.times.delete', { id: deleteTimeId }), {}, {
                onFinish: () => {
                    setIsLoading(false);
                    setDeleteTimeId(null);
                },
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error deleting time:', error);
            setIsLoading(false);
            setShowDeleteTimeDialog(true); // Reopen dialog on error
        }
    };

    const confirmDeleteSlot = (slotId: number) => {
        setDeleteSlotId(slotId);
        setShowDeleteSlotDialog(true);
    };

    const removeSlot = async () => {
        if (!deleteSlotId) return;
        setIsLoading(true);
        setShowDeleteSlotDialog(false); // Close dialog immediately
        try {
            router.post(route('admin.slots.delete', { id: deleteSlotId }), {}, {
                onFinish: () => {
                    setIsLoading(false);
                    setDeleteSlotId(null);
                },
                preserveScroll: true,
                preserveState: true,
            });
        } catch (error) {
            console.error('Error deleting slot:', error);
            setIsLoading(false);
            setShowDeleteSlotDialog(true); // Reopen dialog on error
        }
    };

    return {
        // state
        settings,
        setSettings,
        registerDates,
        setRegisterDates,
        newDate,
        setNewDate,
        newTime,
        setNewTime,
        selectedDateId,
        setSelectedDateId,
        selectedTimeId,
        setSelectedTimeId,
        newSlotTitle,
        setNewSlotTitle,
        newSlotCapacity,
        setNewSlotCapacity,
        isLoading,

        // delete states
        deleteDateId,
        deleteTimeId,
        deleteSlotId,
        showDeleteDateDialog,
        setShowDeleteDateDialog,
        showDeleteTimeDialog,
        setShowDeleteTimeDialog,
        showDeleteSlotDialog,
        setShowDeleteSlotDialog,

        // actions
        handleSettingsSubmit,
        addRegisterDate,
        addRegisterTime,
        addRegisterSlot,
        toggleDateActive,
        toggleTimeActive,
        updateTimeValue,
        toggleSlotActive,
        updateSlotDetails,
        confirmDeleteDate,
        removeDate,
        confirmDeleteTime,
        removeTime,
        confirmDeleteSlot,
        removeSlot,
    };
}


