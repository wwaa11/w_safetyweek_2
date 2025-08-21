import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Trash2, Calendar, Clock, Users, Settings as SettingsIcon, Plus, Save, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Setting {
    id?: number;
    title: string;
    register_start_date: string;
    register_end_date: string;
}

interface RegisterDate {
    id?: number;
    date: string;
    is_active: boolean;
    times?: RegisterTime[];
}

interface RegisterTime {
    id?: number;
    register_date_id: number;
    time: string;
    is_active: boolean;
    slots?: RegisterSlot[];
}

interface RegisterSlot {
    id?: number;
    register_time_id: number;
    title: string;
    available_slots: number;
    is_active: boolean;
}

interface EventSettingsProps {
    settings?: Setting;
    registerDates: RegisterDate[];
    success?: string;
    error?: string;
    errors?: Record<string, string>;
}

export default function EventSettings({
    settings: initialSettings,
    registerDates: initialDates,
    success,
    error,
    errors
}: EventSettingsProps) {
    const [settings, setSettings] = useState<Setting>({
        title: initialSettings?.title || '',
        register_start_date: initialSettings?.register_start_date || '',
        register_end_date: initialSettings?.register_end_date || ''
    });


    const [registerDates, setRegisterDates] = useState<RegisterDate[]>(initialDates || []);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
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
            console.log('Initial settings received:', initialSettings);
            console.log('Start date:', initialSettings.register_start_date);
            console.log('End date:', initialSettings.register_end_date);

            setSettings({
                title: initialSettings.title || '',
                register_start_date: initialSettings.register_start_date || '',
                register_end_date: initialSettings.register_end_date || ''
            });
        }
        setRegisterDates(initialDates || []);
    }, [initialSettings, initialDates]);

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend validation
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

        // Check if end date is after start date
        if (new Date(settings.register_end_date) <= new Date(settings.register_start_date)) {
            alert('End date must be after start date');
            return;
        }

        setIsLoading(true);

        try {
            router.post(route('admin.settings.store'), settings as Record<string, any>, {
                onFinish: () => {
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    setIsLoading(false);
                },
                preserveScroll: true, // Prevent scrolling to top
                preserveState: true // Preserve the current page state
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            setIsLoading(false);
        }
    };

    const addRegisterDate = async () => {
        if (newDate) {
            setIsLoading(true);

            try {
                router.post(route('admin.dates.store'), { date: newDate }, {
                    onFinish: () => {
                        setIsLoading(false);
                        // Keep the input value for quick addition of multiple dates
                        // setNewDate(''); // Removed - preserve input value
                    },
                    preserveScroll: true, // Prevent scrolling to top
                    preserveState: true // Preserve the current page state
                });
            } catch (error) {
                console.error('Error adding date:', error);
                setIsLoading(false);
            }
        }
    };

    const addRegisterTime = async () => {
        if (newTime && selectedDateId !== null) {
            setIsLoading(true);

            try {
                router.post(route('admin.times.store'), {
                    register_date_id: selectedDateId,
                    time: newTime
                }, {
                    onFinish: () => {
                        setIsLoading(false);
                        // Keep the input values for quick addition of multiple time slots
                        // setNewTime(''); // Removed - preserve input value
                        // setSelectedDateId(null); // Removed - preserve selection
                    },
                    preserveScroll: true, // Prevent scrolling to top
                    preserveState: true // Preserve the current page state
                });
            } catch (error) {
                console.error('Error adding time:', error);
                setIsLoading(false);
            }
        }
    };

    const toggleDateActive = async (index: number) => {
        const date = registerDates[index];
        if (!date.id) return;

        setIsLoading(true);

        try {
            router.post(route('admin.dates.update', { id: date.id }), { is_active: !date.is_active }, {
                onFinish: () => {
                    setIsLoading(false);
                },
                preserveScroll: true, // Prevent scrolling to top
                preserveState: true // Preserve the current page state
            });
        } catch (error) {
            console.error('Error updating date:', error);
            setIsLoading(false);
        }
    };

    const toggleTimeActive = async (timeId: number) => {
        // Find the time in the nested structure
        let time: RegisterTime | undefined;
        for (const date of registerDates) {
            if (date.times) {
                time = date.times.find(t => t.id === timeId);
                if (time) break;
            }
        }
        if (!time) return;

        setIsLoading(true);

        try {
            router.post(route('admin.times.update', { id: time.id }), { is_active: !time.is_active }, {
                onFinish: () => {
                    setIsLoading(false);
                },
                preserveScroll: true, // Prevent scrolling to top
                preserveState: true // Preserve the current page state
            });
        } catch (error) {
            console.error('Error updating time:', error);
            setIsLoading(false);
        }
    };

    const confirmDeleteDate = (index: number) => {
        const date = registerDates[index];
        if (!date.id) return;

        setDeleteDateId(date.id);
        setShowDeleteDateDialog(true);
    };

    const removeDate = async () => {
        if (!deleteDateId) return;

        setIsLoading(true);

        try {
            router.delete(route('admin.dates.delete', { id: deleteDateId }), {
                onFinish: () => {
                    setIsLoading(false);
                    setShowDeleteDateDialog(false);
                    setDeleteDateId(null);
                },
                preserveScroll: true, // Prevent scrolling to top
                preserveState: true // Preserve the current page state
            });
        } catch (error) {
            console.error('Error deleting date:', error);
            setIsLoading(false);
        }
    };

    const confirmDeleteTime = (timeId: number) => {
        setDeleteTimeId(timeId);
        setShowDeleteTimeDialog(true);
    };

    const removeTime = async () => {
        if (!deleteTimeId) return;

        setIsLoading(true);

        try {
            router.delete(route('admin.times.delete', { id: deleteTimeId }), {
                onFinish: () => {
                    setIsLoading(false);
                    setShowDeleteTimeDialog(false);
                    setDeleteTimeId(null);
                },
                preserveScroll: true, // Prevent scrolling to top
                preserveState: true // Preserve the current page state
            });
        } catch (error) {
            console.error('Error deleting time:', error);
            setIsLoading(false);
        }
    };

    const addRegisterSlot = async () => {
        if (newSlotTitle && selectedTimeId !== null && newSlotCapacity > 0) {
            setIsLoading(true);

            try {
                router.post(route('admin.slots.store'), {
                    register_time_id: selectedTimeId,
                    title: newSlotTitle,
                    available_slots: newSlotCapacity
                }, {
                    onFinish: () => {
                        setIsLoading(false);
                        // Keep the input values for quick addition of multiple slots
                        // setNewSlotTitle(''); // Removed - preserve input value
                        // setNewSlotCapacity(10); // Removed - preserve capacity value
                        // setSelectedTimeId(null); // Removed - preserve selection
                    },
                    preserveScroll: true, // Prevent scrolling to top
                    preserveState: true // Preserve the current page state
                });
            } catch (error) {
                console.error('Error adding slot:', error);
                setIsLoading(false);
            }
        }
    };

    const toggleSlotActive = async (slotId: number) => {
        // Find the slot in the nested structure
        let slot: RegisterSlot | undefined;
        for (const date of registerDates) {
            if (date.times) {
                for (const time of date.times) {
                    if (time.slots) {
                        slot = time.slots.find(s => s.id === slotId);
                        if (slot) break;
                    }
                }
                if (slot) break;
            }
        }
        if (!slot) return;

        setIsLoading(true);

        try {
            router.post(route('admin.slots.update', { id: slot.id }), { is_active: !slot.is_active }, {
                onFinish: () => {
                    setIsLoading(false);
                },
                preserveScroll: true, // Prevent scrolling to top
                preserveState: true // Preserve the current page state
            });
        } catch (error) {
            console.error('Error updating slot:', error);
            setIsLoading(false);
        }
    };

    const confirmDeleteSlot = (slotId: number) => {
        setDeleteSlotId(slotId);
        setShowDeleteSlotDialog(true);
    };

    const removeSlot = async () => {
        if (!deleteSlotId) return;

        setIsLoading(true);

        try {
            router.delete(route('admin.slots.delete', { id: deleteSlotId }), {
                onFinish: () => {
                    setIsLoading(false);
                    setShowDeleteSlotDialog(false);
                    setDeleteSlotId(null);
                },
                preserveScroll: true, // Prevent scrolling to top
                preserveState: true // Preserve the current page state
            });
        } catch (error) {
            console.error('Error deleting slot:', error);
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.visit(route('admin.dashboard'))}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Dashboard</span>
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Event Settings
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Event Settings
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage event registration settings, dates, and time slots.
                        </p>
                    </div>

                    {/* Flash Messages */}
                    {success && (
                        <div className="mb-6">
                            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 shadow-lg">
                                <AlertDescription className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    {success}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6">
                            <Alert className="border-red-200 bg-red-50 text-red-800 shadow-lg">
                                <AlertDescription className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* General Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <SettingsIcon className="h-5 w-5" />
                                    <span>General Settings</span>
                                </CardTitle>
                                <CardDescription>
                                    Configure basic event information and registration period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="title" className="text-sm font-medium">
                                                Event Title
                                            </Label>
                                            <Input
                                                id="title"
                                                value={settings.title}
                                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                                placeholder="Enter event title"
                                                required
                                                className={errors?.title ? 'border-red-400' : ''}
                                            />
                                            {errors?.title && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="register_start_date" className="text-sm font-medium">
                                                Registration Start Date
                                            </Label>
                                            <Input
                                                id="register_start_date"
                                                type="date"
                                                value={settings.register_start_date || ''}
                                                onChange={(e) => {
                                                    console.log('Start date changed to:', e.target.value);
                                                    setSettings({ ...settings, register_start_date: e.target.value });
                                                }}
                                                required
                                                className={errors?.register_start_date ? 'border-red-400' : ''}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {errors?.register_start_date && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                    {errors.register_start_date}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="register_end_date" className="text-sm font-medium">
                                            Registration End Date
                                        </Label>
                                        <Input
                                            id="register_end_date"
                                            type="date"
                                            value={settings.register_end_date || ''}
                                            onChange={(e) => {
                                                console.log('End date changed to:', e.target.value);
                                                setSettings({ ...settings, register_end_date: e.target.value });
                                            }}
                                            required
                                            className={errors?.register_end_date ? 'border-red-400' : ''}
                                            min={settings.register_start_date || undefined}
                                        />
                                        {errors?.register_end_date && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                {errors.register_end_date}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Settings'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Registration Dates and Times */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Registration Dates & Time Slots</span>
                                </CardTitle>
                                <CardDescription>
                                    Manage dates and their associated time slots. Each date can have multiple time slots.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {/* Add New Date */}
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
                                            <Button
                                                onClick={addRegisterDate}
                                                disabled={!newDate || isLoading}
                                                className="px-6"
                                            >
                                                {isLoading ? 'Adding...' : 'Add Date'}
                                            </Button>
                                        </div>
                                        {errors?.date && (
                                            <p className="text-sm text-red-500 mt-2">
                                                {errors.date}
                                            </p>
                                        )}
                                    </div>

                                    {/* Add New Time to Existing Date */}
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
                                                <Button
                                                    onClick={addRegisterTime}
                                                    disabled={!newTime || selectedDateId === null || isLoading}
                                                    className="w-full"
                                                >
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

                                    {/* Add New Slot to Existing Time */}
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
                                                    {registerDates.flatMap(date =>
                                                        date.times ? date.times.map(time => (
                                                            <option key={time.id} value={time.id}>
                                                                {new Date(date.date).toLocaleDateString()} - {time.time}
                                                            </option>
                                                        )) : []
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
                                                    className={`h-12 px-4 border-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-500 ${errors?.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                                                        }`}
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
                                                    className={`h-12 px-4 border-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-500 ${errors?.available_slots ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    onClick={addRegisterSlot}
                                                    disabled={!newSlotTitle || selectedTimeId === null || newSlotCapacity <= 0 || isLoading}
                                                    className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 w-full"
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

                                    {/* Display Dates with their Times */}
                                    <div className="space-y-6">
                                        {registerDates.map((date) => (
                                            <div key={date.id} className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg">
                                                {/* Date Header */}
                                                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-slate-200">
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            checked={date.is_active}
                                                            onCheckedChange={() => toggleDateActive(registerDates.findIndex(d => d.id === date.id))}
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
                                                        onClick={() => confirmDeleteDate(registerDates.findIndex(d => d.id === date.id))}
                                                        disabled={isLoading}
                                                        className="h-10 w-10 p-0 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 bg-white hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Times for this Date */}
                                                <div className="p-6">
                                                    {date.times && date.times.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {date.times.map((time) => (
                                                                <div key={time.id} className="border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                                                    {/* Time Header */}
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
                                                                                <span className={`text-lg font-semibold ${time.is_active ? 'text-slate-900' : 'line-through text-slate-500'}`}>
                                                                                    {time.time}
                                                                                </span>
                                                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                                                                    {time.slots?.length || 0} slots
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => confirmDeleteTime(time.id!)}
                                                                            disabled={isLoading}
                                                                            className="h-8 w-8 p-0 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 bg-white hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>

                                                                    {/* Slots for this Time */}
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
                                                                                                <span className={`font-semibold ${slot.is_active ? 'text-slate-900' : 'line-through text-slate-500'}`}>
                                                                                                    {slot.title}
                                                                                                </span>
                                                                                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                                                                                                    {slot.available_slots} slots
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() => confirmDeleteSlot(slot.id!)}
                                                                                            disabled={isLoading}
                                                                                            className="h-7 w-7 p-0 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 bg-white hover:bg-red-50"
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center py-6 text-slate-500 text-sm bg-white rounded-lg border-2 border-dashed border-slate-200">
                                                                                <Users className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                                                                No slots added yet. Add slots above.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-slate-500 bg-white rounded-lg border-2 border-dashed border-slate-200">
                                                            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                                            <p className="text-lg font-medium">No time slots added yet</p>
                                                            <p className="text-sm">Add time slots above to get started</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Confirmation Dialogs */}
                        {/* Delete Date Confirmation */}
                        <Dialog open={showDeleteDateDialog} onOpenChange={setShowDeleteDateDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="h-5 w-5" />
                                        Confirm Delete Date
                                    </DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this date? This will also remove all associated time slots and registration slots. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteDateDialog(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={removeDate}
                                        disabled={isLoading}
                                        className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
                                    >
                                        {isLoading ? 'Deleting...' : 'Delete Date'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Delete Time Confirmation */}
                        <Dialog open={showDeleteTimeDialog} onOpenChange={setShowDeleteTimeDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="h-5 w-5" />
                                        Confirm Delete Time
                                    </DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this time slot? This will also remove all associated registration slots. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteTimeDialog(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={removeTime}
                                        disabled={isLoading}
                                        className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
                                    >
                                        {isLoading ? 'Deleting...' : 'Delete Time'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Delete Slot Confirmation */}
                        <Dialog open={showDeleteSlotDialog} onOpenChange={setShowDeleteSlotDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="h-5 w-5" />
                                        Confirm Delete Slot
                                    </DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this registration slot? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteSlotDialog(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={removeSlot}
                                        disabled={isLoading}
                                        className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
                                    >
                                        {isLoading ? 'Deleting...' : 'Delete Slot'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </div>
                </div>
            </main>
        </div>
    );
}
