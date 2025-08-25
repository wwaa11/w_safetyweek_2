import React from 'react';
import { router, Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Building2 } from 'lucide-react';
import { EventSettingsProps } from './types';
import { useEventSettings } from './useEventSettings';
import { GeneralSettingsForm } from './components/GeneralSettingsForm';
import { AddDateCard } from './components/AddDateCard';
import { AddTimeCard } from './components/AddTimeCard';
import { AddSlotCard } from './components/AddSlotCard';
import { DatesList } from './components/DatesList';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';

export default function Page(props: EventSettingsProps) {
    const {
        settings,
        setSettings,
        registerDates,
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
        showDeleteDateDialog,
        setShowDeleteDateDialog,
        showDeleteTimeDialog,
        setShowDeleteTimeDialog,
        showDeleteSlotDialog,
        setShowDeleteSlotDialog,
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
    } = useEventSettings(props);

    const { success, error, errors } = props;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Head title="Event Settings - Safety Week" />
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('admin.dashboard'))}
                                className="flex items-center space-x-2 border-2  transition-all duration-200"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Settings</h2>
                        <p className="text-gray-600 dark:text-gray-400">Manage event registration settings, dates, and time slots.</p>
                    </div>

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
                        <GeneralSettingsForm settings={settings} setSettings={setSettings} isLoading={isLoading} errors={errors} onSubmit={handleSettingsSubmit} />

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Registration Dates & Time Slots</span>
                                </CardTitle>
                                <CardDescription>Manage dates and their associated time slots. Each date can have multiple time slots.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <AddDateCard newDate={newDate} setNewDate={setNewDate} isLoading={isLoading} errors={errors} onAdd={addRegisterDate} />
                                    <AddTimeCard
                                        registerDates={registerDates}
                                        selectedDateId={selectedDateId}
                                        setSelectedDateId={setSelectedDateId}
                                        newTime={newTime}
                                        setNewTime={setNewTime}
                                        isLoading={isLoading}
                                        errors={errors}
                                        onAdd={addRegisterTime}
                                    />
                                    <AddSlotCard
                                        registerDates={registerDates}
                                        selectedTimeId={selectedTimeId}
                                        setSelectedTimeId={setSelectedTimeId}
                                        newSlotTitle={newSlotTitle}
                                        setNewSlotTitle={setNewSlotTitle}
                                        newSlotCapacity={newSlotCapacity}
                                        setNewSlotCapacity={setNewSlotCapacity}
                                        isLoading={isLoading}
                                        errors={errors}
                                        onAdd={(massAdd) => addRegisterSlot(massAdd)}
                                    />

                                    <DatesList
                                        registerDates={registerDates}
                                        isLoading={isLoading}
                                        toggleDateActive={toggleDateActive}
                                        confirmDeleteDate={confirmDeleteDate}
                                        toggleTimeActive={toggleTimeActive}
                                        confirmDeleteTime={confirmDeleteTime}
                                        toggleSlotActive={toggleSlotActive}
                                        confirmDeleteSlot={confirmDeleteSlot}
                                        updateTimeValue={updateTimeValue}
                                        updateSlotDetails={updateSlotDetails}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <DeleteConfirmDialog
                            open={showDeleteDateDialog}
                            onOpenChange={setShowDeleteDateDialog}
                            title="Confirm Delete Date"
                            description="Are you sure you want to delete this date? This will also remove all associated time slots and registration slots. This action cannot be undone."
                            confirmLabel="Delete Date"
                            onConfirm={removeDate}
                            isLoading={isLoading}
                        />
                        <DeleteConfirmDialog
                            open={showDeleteTimeDialog}
                            onOpenChange={setShowDeleteTimeDialog}
                            title="Confirm Delete Time"
                            description="Are you sure you want to delete this time slot? This will also remove all associated registration slots. This action cannot be undone."
                            confirmLabel="Delete Time"
                            onConfirm={removeTime}
                            isLoading={isLoading}
                        />
                        <DeleteConfirmDialog
                            open={showDeleteSlotDialog}
                            onOpenChange={setShowDeleteSlotDialog}
                            title="Confirm Delete Slot"
                            description="Are you sure you want to delete this registration slot? This action cannot be undone."
                            confirmLabel="Delete Slot"
                            onConfirm={removeSlot}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}


