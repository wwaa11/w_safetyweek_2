import { useState } from 'react';
import axios from 'axios';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head } from '@inertiajs/react';
import { LoaderCircle, User, Lock, Building2, UserCheck } from 'lucide-react';

interface LoginProps {
    status?: string;
    errors?: Record<string, string>;
}

export default function Login({ status, errors: initialErrors }: LoginProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userid: '',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>(initialErrors || {});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.post(route('login.store'), formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            // Handle successful login
            if (response.data.status === 1) {
                // Redirect to the URL provided by the backend
                if (response.data.redirect) {
                    window.location.href = response.data.redirect;
                } else {
                    // Fallback to dashboard if no redirect URL provided
                    window.location.href = route('dashboard');
                }
            } else {
                // Handle unsuccessful login
                if (response.data.errors) {
                    setErrors(response.data.errors);
                } else {
                    setErrors({ general: response.data.message || 'Login failed' });
                }
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: 'An error occurred during login. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <Head title="Login - Safety Week" />

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to your Safety Week account
                    </p>
                </div>

                {/* Login Card */}
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                            Sign In
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Status Message */}
                        {status && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-700 dark:text-green-400 text-center">
                                    {status}
                                </p>
                            </div>
                        )}

                        {/* General Error Message */}
                        {errors.general && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-700 dark:text-red-400 text-center">
                                    {errors.general}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* User ID Field */}
                            <div className="space-y-2">
                                <Label htmlFor="userid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    User ID
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="userid"
                                        name="userid"
                                        type="text"
                                        required
                                        autoFocus
                                        value={formData.userid}
                                        onChange={handleInputChange}
                                        className="pl-10 h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your User ID"
                                        autoComplete="username"
                                    />
                                </div>
                                <InputError message={errors.userid} />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="pl-10 h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-medium rounded-lg transition-colors duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © 2024 Safety Week. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
