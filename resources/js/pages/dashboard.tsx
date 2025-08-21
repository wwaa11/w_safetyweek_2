import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, Clock, Users, Settings, LogOut, Shield } from 'lucide-react';
import { router } from '@inertiajs/react';

interface DashboardProps {
    auth: {
        user: {
            name: string;
            user_id: string;
            department?: string;
            position?: string;
            role: string;
        };
    };
    stats: {
        totalDates: number;
        totalTimeSlots: number;
        totalSlots: number;
        totalRegistrations: number;
        upcomingSessions: number;
    };
}

export default function Dashboard({ auth, stats }: DashboardProps) {
    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head title="Dashboard - Safety Week" />

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Safety Week Management
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {auth.user.department} • {auth.user.position}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    {auth.user.role ? auth.user.role.toUpperCase() : 'USER'}
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="flex items-center space-x-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Button>
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
                            Welcome back, {auth.user.name}!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your Safety Week events and registrations from your dashboard.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Dates</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalDates}</div>
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
                                <div className="text-2xl font-bold">{stats.totalTimeSlots}</div>
                                <p className="text-xs text-muted-foreground">
                                    Available time slots
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalSlots}</div>
                                <p className="text-xs text-muted-foreground">
                                    Available registration slots
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Registrations</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                                <p className="text-xs text-muted-foreground">
                                    User registrations
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                                <p className="text-xs text-muted-foreground">
                                    Next 7 days
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Event Settings</span>
                                </CardTitle>
                                <CardDescription>
                                    Configure event registration settings, dates, and time slots.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <a href={route('admin.settings')}>
                                        Manage Settings
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>All Registrations</span>
                                </CardTitle>
                                <CardDescription>
                                    View all user registrations, dates, time slots, and manage registrations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <a href={route('admin.registrations')}>
                                        View Registrations
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Event Calendar</span>
                                </CardTitle>
                                <CardDescription>
                                    View and manage upcoming Safety Week events and schedules.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full" disabled>
                                    Coming Soon
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Your latest actions and system updates.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                Successfully logged in
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Just now
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                Dashboard accessed
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Just now
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
