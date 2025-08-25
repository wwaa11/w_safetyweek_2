import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, Clock, Users, Settings, LogOut, Shield, TrendingUp, Activity, BarChart3 } from 'lucide-react';
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
        totalAvailableSlots: number;
        totalCapacity: number;
        upcomingSessions: number;
    };
}

export default function Dashboard({ auth, stats }: DashboardProps) {
    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Head title="Dashboard - Safety Week" />

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
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {auth.user.department} • {auth.user.position}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                                        {auth.user.role ? auth.user.role.toUpperCase() : 'USER'}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="flex items-center space-x-2 border-2 border-red-200 hover:text-red-600 dark:border-red-800  text-red-600 dark:text-red-400 transition-all duration-200"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Welcome Section */}
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                    Welcome back, {auth.user.name}!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                    Here's what's happening with your Safety Week events today.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:scale-105">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Dates</CardTitle>
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalDates}</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Active event dates
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-3">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{ width: `${Math.min((stats.totalDates / 10) * 100, 100)}%` }}></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:scale-105">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time Slots</CardTitle>
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalTimeSlots}</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Available time slots
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-3">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-1 rounded-full" style={{ width: `${Math.min((stats.totalTimeSlots / 20) * 100, 100)}%` }}></div>
                                </div>
                            </CardContent>
                        </Card>



                        <Card className={`group hover:shadow-xl transition-all duration-300 border-0 backdrop-blur-sm shadow-lg hover:scale-105 ${stats.totalAvailableSlots === 0 ? 'bg-red-50/70 dark:bg-red-900/20' :
                            stats.totalAvailableSlots <= 10 ? 'bg-amber-50/70 dark:bg-amber-900/20' :
                                'bg-white/70 dark:bg-gray-800/70'
                            }`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className={`text-sm font-semibold ${stats.totalAvailableSlots === 0 ? 'text-red-700 dark:text-red-300' :
                                    stats.totalAvailableSlots <= 10 ? 'text-amber-700 dark:text-amber-300' :
                                        'text-gray-700 dark:text-gray-300'
                                    }`}>Available Slots</CardTitle>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow ${stats.totalAvailableSlots === 0 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                    stats.totalAvailableSlots <= 10 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                        'bg-gradient-to-r from-teal-500 to-cyan-600'
                                    }`}>
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalAvailableSlots}</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Remaining slots
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    <span>Total Capacity</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {stats.totalCapacity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>Fill rate</span>
                                    <span className="font-semibold">
                                        {stats.totalCapacity > 0 ? Math.round(((stats.totalCapacity - stats.totalAvailableSlots) / stats.totalCapacity) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-3">
                                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 h-1 rounded-full" style={{ width: `${Math.min((stats.totalAvailableSlots / Math.max(stats.totalCapacity, 1)) * 100, 100)}%` }}></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:scale-105">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Registrations</CardTitle>
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalRegistrations}</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Active registrations
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-3">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-600 h-1 rounded-full" style={{ width: `${Math.min((stats.totalRegistrations / 50) * 100, 100)}%` }}></div>
                                </div>
                            </CardContent>
                        </Card>


                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-gray-800/80 dark:to-blue-900/20 backdrop-blur-sm shadow-xl hover:scale-105">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                        <Settings className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                            Event Settings
                                        </CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400 font-medium">
                                            Configure event registration settings, dates, and time slots.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                    asChild
                                >
                                    <a href={route('admin.settings')}>
                                        <Settings className="h-5 w-5 mr-2" />
                                        Manage Settings
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white/80 to-green-50/50 dark:from-gray-800/80 dark:to-green-900/20 backdrop-blur-sm shadow-xl hover:scale-105">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                            All Registrations
                                        </CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400 font-medium">
                                            View all user registrations, dates, time slots, and manage registrations.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                    asChild
                                >
                                    <a href={route('admin.registrations')}>
                                        <BarChart3 className="h-5 w-5 mr-2" />
                                        View Registrations
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
