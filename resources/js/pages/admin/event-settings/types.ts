export interface Setting {
    id?: number;
    title: string;
    register_start_date: string;
    register_end_date: string;
}

export interface RegisterSlot {
    id?: number;
    register_time_id: number;
    title: string;
    available_slots: number;
    is_active: boolean;
}

export interface RegisterTime {
    id?: number;
    register_date_id: number;
    time?: string; // Keep for backward compatibility
    start_time?: string;
    end_time?: string;
    is_active: boolean;
    slots?: RegisterSlot[];
}

export interface RegisterDate {
    id?: number;
    date: string;
    is_active: boolean;
    times?: RegisterTime[];
}

export interface EventSettingsProps {
    settings?: Setting;
    registerDates: RegisterDate[];
    success?: string;
    error?: string;
    errors?: Record<string, string>;
}


