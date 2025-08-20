import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@/components/icon';
import { useToast } from '@/hooks/use-toast';

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
}

interface RegisterTime {
    id?: number;
    register_date_id: number;
    time: string;
    is_active: boolean;
    available_slots: number;
}

interface EventSettingsProps {
    settings?: Setting;
    registerDates: RegisterDate[];
    registerTimes: RegisterTime[];
}

export default function EventSettings({ settings: initialSettings, registerDates: initialDates, registerTimes: initialTimes }: EventSettingsProps) {
    const [settings, setSettings] = useState<Setting>({
        title: initialSettings?.title || '',
        register_start_date: initialSettings?.register_start_date || '',
        register_end_date: initialSettings?.register_end_date || ''
    });

    const [registerDates, setRegisterDates] = useState<RegisterDate[]>(initialDates || []);
    const [registerTimes, setRegisterTimes] = useState<RegisterTime[]>(initialTimes || []);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newSlots, setNewSlots] = useState(10);
    const [selectedDateId, setSelectedDateId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Update local state when props change
    useEffect(() => {
        if (initialSettings) {
            setSettings({
                title: initialSettings.title || '',
                register_start_date: initialSettings.register_start_date || '',
                register_end_date: initialSettings.register_end_date || ''
            });
        }
        setRegisterDates(initialDates || []);
        setRegisterTimes(initialTimes || []);
    }, [initialSettings, initialDates, initialTimes]);

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/settings/event/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(settings),
            });

            const result = await response.json();
            if (result.success) {
                // Refresh the page to get updated data
                router.reload();
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addRegisterDate = async () => {
        if (newDate) {
            setIsLoading(true);

            try {
                const response = await fetch('/settings/event/dates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ date: newDate }),
                });

                const result = await response.json();
                if (result.success) {
                    // Refresh the page to get updated data
                    router.reload();
                }
            } catch (error) {
                console.error('Error adding date:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const addRegisterTime = async () => {
        if (newTime && selectedDateId !== null && newSlots > 0) {
            setIsLoading(true);

            try {
                const response = await fetch('/settings/event/times', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        register_date_id: selectedDateId,
                        time: newTime,
                        available_slots: newSlots
                    }),
                });

                const result = await response.json();
                if (result.success) {
                    // Refresh the page to get updated data
                    router.reload();
                }
            } catch (error) {
                console.error('Error adding time:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleDateActive = async (index: number) => {
        const date = registerDates[index];
        if (!date.id) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/settings/event/dates/${date.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ is_active: !date.is_active }),
            });

            const result = await response.json();
            if (result.success) {
                router.reload();
            }
        } catch (error) {
            console.error('Error updating date:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTimeActive = async (index: number) => {
        const time = registerTimes[index];
        if (!time.id) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/settings/event/times/${time.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ is_active: !time.is_active }),
            });

            const result = await response.json();
            if (result.success) {
                router.reload();
            }
        } catch (error) {
            console.error('Error updating time:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeDate = async (index: number) => {
        const date = registerDates[index];
        if (!date.id) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/settings/event/dates/${date.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.success) {
                router.reload();
            }
        } catch (error) {
            console.error('Error deleting date:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeTime = async (index: number) => {
        const time = registerTimes[index];
        if (!time.id) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/settings/event/times/${time.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.success) {
                router.reload();
            }
        } catch (error) {
            console.error('Error deleting time:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAll = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/settings/event/save-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    settings,
                    registerDates,
                    registerTimes,
                }),
            });

            const result = await response.json();
            if (result.success) {
                router.reload();
            }
        } catch (error) {
            console.error('Error saving all:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout
            title="Event Settings"
            description="Manage event registration settings, dates, and time slots"
        >
            <div className="space-y-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                            Configure basic event information and registration period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSettingsSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input
                                        id="title"
                                        value={settings.title}
                                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                        placeholder="Enter event title"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register_start_date">Registration Start Date</Label>
                                    <Input
                                        id="register_start_date"
                                        type="datetime-local"
                                        value={settings.register_start_date}
                                        onChange={(e) => setSettings({ ...settings, register_start_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register_end_date">Registration End Date</Label>
                                <Input
                                    id="register_end_date"
                                    type="datetime-local"
                                    value={settings.register_end_date}
                                    onChange={(e) => setSettings({ ...settings, register_end_date: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Separator />

                {/* Register Dates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registration Dates</CardTitle>
                        <CardDescription>
                            Add dates when registration will be available
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    placeholder="Select date"
                                />
                                <Button onClick={addRegisterDate} disabled={!newDate || isLoading}>
                                    {isLoading ? 'Adding...' : 'Add Date'}
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {registerDates.map((date, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={date.is_active}
                                                onCheckedChange={() => toggleDateActive(index)}
                                                disabled={isLoading}
                                            />
                                            <span className={date.is_active ? '' : 'line-through text-muted-foreground'}>
                                                {new Date(date.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeDate(index)}
                                            disabled={isLoading}
                                        >
                                            <Icon name="trash" className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Register Times */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registration Time Slots</CardTitle>
                        <CardDescription>
                            Add time slots for each registration date
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <div>
                                    <Label htmlFor="date-select">Select Date</Label>
                                    <select
                                        id="date-select"
                                        className="w-full p-2 border rounded-md"
                                        value={selectedDateId || ''}
                                        onChange={(e) => setSelectedDateId(Number(e.target.value))}
                                    >
                                        <option value="">Choose a date</option>
                                        {registerDates.map((date, index) => (
                                            <option key={index} value={index}>
                                                {new Date(date.date).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="time">Time</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        placeholder="Select time"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="slots">Available Slots</Label>
                                    <Input
                                        id="slots"
                                        type="number"
                                        min="1"
                                        value={newSlots}
                                        onChange={(e) => setNewSlots(Number(e.target.value))}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={addRegisterTime}
                                        disabled={!newTime || selectedDateId === null || newSlots <= 0 || isLoading}
                                        className="w-full"
                                    >
                                        {isLoading ? 'Adding...' : 'Add Time'}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {registerTimes.map((time, index) => {
                                    const date = registerDates[time.register_date_id];
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={time.is_active}
                                                    onCheckedChange={() => toggleTimeActive(index)}
                                                    disabled={isLoading}
                                                />
                                                <span className={time.is_active ? '' : 'line-through text-muted-foreground'}>
                                                    {date ? new Date(date.date).toLocaleDateString() : 'Unknown Date'} - {time.time}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    ({time.available_slots} slots)
                                                </span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeTime(index)}
                                                disabled={isLoading}
                                            >
                                                <Icon name="trash" className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save All Button */}
                <div className="flex justify-end">
                    <Button size="lg" className="px-8" onClick={saveAll} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
