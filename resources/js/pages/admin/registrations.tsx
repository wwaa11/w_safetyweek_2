import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Calendar, Clock, Users, ArrowLeft, Building2, Search, Download, X } from 'lucide-react';
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
    department?: string;
    registerType?: string;
}

export default function AdminRegistrations({
    registrations,
    search: initialSearch = '',
    department: initialDepartment = '',
    registerType: initialRegisterType = ''
}: AdminRegistrationsProps) {
    const [search, setSearch] = useState(initialSearch);
    const [filterDepartment, setFilterDepartment] = useState(initialDepartment);
    const [filterRegisterType, setFilterRegisterType] = useState(initialRegisterType);
    const [isExporting, setIsExporting] = useState(false);

    // Get unique departments and register types for filtering
    const departments = Array.from(new Set(
        registrations.flatMap(date =>
            date.times.flatMap(time =>
                time.slots.flatMap(slot =>
                    slot.userSelections.map(selection => selection.department)
                )
            )
        )
    )).sort();

    const registerTypes = Array.from(new Set(
        registrations.flatMap(date =>
            date.times.flatMap(time =>
                time.slots.flatMap(slot =>
                    slot.userSelections.map(selection => selection.register_type)
                )
            )
        )
    )).sort();

    useEffect(() => {
        const handle = setTimeout(() => {
            const params: any = {};
            if (search.trim()) params.q = search.trim();
            if (filterDepartment) params.department = filterDepartment;
            if (filterRegisterType) params.register_type = filterRegisterType;

            router.get(route('admin.registrations'), params, {
                preserveState: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(handle);
    }, [search, filterDepartment, filterRegisterType]);

    const handleDeleteRegistration = (registrationId: number) => {
        if (confirm('Are you sure you want to delete this registration?')) {
            router.post(route('admin.registrations.delete', registrationId));
        }
    };

    const handleBackToDashboard = () => {
        router.visit(route('admin.dashboard'));
    };

    const handleExport = () => {
        setIsExporting(true);
        try {
            // Filter registrations based on current filters
            const filteredRegistrations = registrations.map(date => ({
                ...date,
                times: date.times.map(time => ({
                    ...time,
                    slots: time.slots.map(slot => ({
                        ...slot,
                        userSelections: slot.userSelections.filter(selection => {
                            const matchesSearch = !search.trim() ||
                                selection.name.toLowerCase().includes(search.toLowerCase()) ||
                                selection.userid.toLowerCase().includes(search.toLowerCase());
                            const matchesDepartment = !filterDepartment || selection.department === filterDepartment;
                            const matchesRegisterType = !filterRegisterType || selection.register_type === filterRegisterType;
                            return matchesSearch && matchesDepartment && matchesRegisterType;
                        })
                    }))
                }))
            }));

            // Create CSV content
            const csvContent = generateCSV(filteredRegistrations);

            // Create and download the file
            const bom = '\uFEFF';
            const csvContentWithBom = bom + csvContent;
            const blob = new Blob([csvContentWithBom], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Create filename with filter info
            let filename = `registrations_${new Date().toISOString().split('T')[0]}`;
            if (search.trim() || filterDepartment || filterRegisterType) {
                filename += '_filtered';
            }
            filename += '.csv';

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const generateCSV = (registrations: Registration[]): string => {
        const headers = [
            'Date',
            'Time',
            'Slot Title',
            'User ID',
            'Name',
            'Department',
            'Register Type'
        ];

        const rows = [headers.join(',')];

        registrations.forEach(date => {
            date.times.forEach(time => {
                time.slots.forEach(slot => {
                    if (slot.userSelections.length > 0) {
                        slot.userSelections.forEach(selection => {
                            const row = [
                                `"${date.formatted_date}"`,
                                `"${time.formatted_time}"`,
                                `"${slot.title}"`,
                                `"${selection.userid}"`,
                                `"${selection.name}"`,
                                `"${selection.department}"`,
                                `"${selection.register_type}"`
                            ];
                            rows.push(row.join(','));
                        });
                    } else {
                        // Add empty row for slots with no registrations
                        const row = [
                            `"${date.formatted_date}"`,
                            `"${time.formatted_time}"`,
                            `"${slot.title}"`,
                            '', '', '', ''
                        ];
                        rows.push(row.join(','));
                    }
                });
            });
        });

        return rows.join('\n');
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackToDashboard}
                            className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Search and Filter Card */}
                    <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-lg text-gray-900 dark:text-white">
                                <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span>Search & Filter</span>
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                                Find specific registrations using search and filters
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by user ID or name..."
                                    className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-full"
                                />
                            </div>

                            {/* Filter Controls */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Department
                                    </label>
                                    <select
                                        value={filterDepartment}
                                        onChange={(e) => setFilterDepartment(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-full"
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Register Type
                                    </label>
                                    <select
                                        value={filterRegisterType}
                                        onChange={(e) => setFilterRegisterType(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-full"
                                    >
                                        <option value="">All Types</option>
                                        {registerTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setFilterDepartment('');
                                        setFilterRegisterType('');
                                    }}
                                    className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Clear All Filters</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Export Card */}
                    <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-lg text-gray-900 dark:text-white">
                                <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span>Export Data</span>
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                                Download filtered registration data as CSV file
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white shadow-lg w-full sm:w-auto"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
                                </Button>

                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                    <span className="mr-2">📊</span>
                                    <span>
                                        {search || filterDepartment || filterRegisterType
                                            ? 'Exporting filtered results'
                                            : 'Exporting all registrations'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
