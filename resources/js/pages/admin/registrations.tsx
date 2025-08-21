import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Calendar, Clock, Users, ArrowLeft, Building2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Registration {
    id: number;
    date: string;
    formatted_date: string;
    times: Array<{
        id: number;
        time: string;
        formatted_time: string;
        slots: Array<{
            id: number;
            title: string;
            available_slots: number;
            userSelections: Array<{
                id: number;
                userid: string;
                name: string;
                position: string;
                department: string;
                register_type: string;
            }>;
        }>;
    }>;
}

interface AdminRegistrationsProps {
    registrations: Registration[];
    search?: string;
}

export default function AdminRegistrations({ registrations, search: initialSearch = '' }: AdminRegistrationsProps) {
    const [search, setSearch] = useState(initialSearch);

    useEffect(() => {
        const handle = setTimeout(() => {
            const params = search.trim() ? { q: search.trim() } : {};
            router.get(route('admin.registrations'), params, {
                preserveState: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(handle);
    }, [search]);
    const handleDeleteRegistration = (registrationId: number) => {
        if (confirm('Are you sure you want to delete this registration?')) {
            router.delete(route('admin.registrations.delete', registrationId));
        }
    };

    const handleBackToDashboard = () => {
        router.visit(route('admin.dashboard'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Head title="Admin - All Registrations" />

            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Safety Week Management
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Event Management System
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by user ID or name"
                                className="w-64 dark:bg-gray-800 dark:text-white"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { window.location.href = route('admin.registrations.export'); }}
                                className="flex items-center space-x-2 border-2 transition-all duration-200"
                            >
                                <span>Export Excel</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBackToDashboard}
                                className="flex items-center space-x-2 border-2  transition-all duration-200"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Dates</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{registrations.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active event dates
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Time Slots</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {registrations.reduce((total, date) => total + date.times.length, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Available time slots
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {registrations.reduce((total, date) =>
                                        total + date.times.reduce((timeTotal, time) =>
                                            timeTotal + time.slots.reduce((slotTotal, slot) =>
                                                slotTotal + slot.userSelections.length, 0
                                            ), 0
                                        ), 0
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    User registrations
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registrations List */}
                    <div className="space-y-6">
                        {registrations.map((date) => (
                            <Card key={date.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <span>{date.formatted_date}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {date.times.map((time) => (
                                            <div key={time.id} className="border-l-2 border-gray-200 pl-4">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Clock className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-gray-900 ">
                                                        {time.formatted_time}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {time.slots.map((slot) => (
                                                        <div key={slot.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                                        {slot.title}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        Available slots: {slot.available_slots}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="secondary">
                                                                    {slot.userSelections.length} registered
                                                                </Badge>
                                                            </div>

                                                            {slot.userSelections.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {slot.userSelections.map((selection) => (
                                                                        <div key={selection.id} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center space-x-3">
                                                                                    <div className="flex-1">
                                                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                                                            {selection.name}
                                                                                        </p>
                                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                            {selection.position} • {selection.department}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                                            ID: {selection.userid} • Type: {selection.register_type}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <Button
                                                                                variant="destructive"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteRegistration(selection.id)}
                                                                                className="ml-4"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                    No registrations for this slot
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
