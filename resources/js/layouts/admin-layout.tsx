import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    sidebar?: ReactNode;
    header?: ReactNode;
}

export default function AdminLayout({
    children,
    title,
    description,
    sidebar,
    header,
    ...props
}: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-background" {...props}>
            {/* Admin header */}
            {header || (
                <header className="border-b bg-card">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                {title && (
                                    <h1 className="text-xl font-semibold">{title}</h1>
                                )}
                                {description && (
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                )}
                            </div>
                            {/* Admin header actions can be added here */}
                        </div>
                    </div>
                </header>
            )}

            <div className="flex">
                {/* Admin sidebar */}
                {sidebar && (
                    <aside className="w-64 border-r bg-card min-h-screen">
                        <div className="p-4">
                            {sidebar}
                        </div>
                    </aside>
                )}

                {/* Main content area */}
                <main className="flex-1">
                    <div className="container mx-auto px-4 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
