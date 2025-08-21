import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EventSettingsProps, Setting } from '../types';
import { Settings } from 'lucide-react';

interface Props {
    settings: Setting;
    setSettings: (s: Setting) => void;
    isLoading: boolean;
    errors?: EventSettingsProps['errors'];
    onSubmit: (e: React.FormEvent) => void;
}

export function GeneralSettingsForm({ settings, setSettings, isLoading, errors, onSubmit }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <span>General Settings</span>
                </CardTitle>
                <CardDescription>
                    Configure basic event information and registration period
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3 lg:col-span-2">
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
                                onChange={(e) => setSettings({ ...settings, register_start_date: e.target.value })}
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
                        <div className="space-y-3">
                            <Label htmlFor="register_end_date" className="text-sm font-medium">
                                Registration End Date
                            </Label>
                            <Input
                                id="register_end_date"
                                type="date"
                                value={settings.register_end_date || ''}
                                onChange={(e) => setSettings({ ...settings, register_end_date: e.target.value })}
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
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}


