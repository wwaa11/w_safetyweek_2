import { type ReactNode } from 'react';

interface UserLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function UserLayout({ children, title, description, ...props }: UserLayoutProps) {
    return (
        <div className="min-h-screen bg-background" {...props}>
            {/* User layout header can be added here */}
            {title && (
                <div className="border-b bg-card">
                    <div className="container mx-auto px-4 py-6">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Main content area */}
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
