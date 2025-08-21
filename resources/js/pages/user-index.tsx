/**
 * User Index Page for Safety Week Registration
 * 
 * Required API Endpoints:
 * - POST api.register-slot: Register user for a time slot
 *   Response should include: { success: boolean, slot_info: {...}, slot_selection_id: number }
 * 
 * - GET api.get-slot-selection: Get slot selection by ID
 *   Response should include: { success: boolean, slot_selection: SlotSelection }
 * 
 * Features:
 * - User registration for time slots
 * - Caching of slot selection in localStorage
 * - Auto-loading of previous registration on page load
 * - Support for regular employees and outsource users
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users, CheckCircle, Search, AlertCircle, Info, X, ChevronRight, Smartphone, Monitor, Tablet } from 'lucide-react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Time {
    id: number;
    time: string;
    formatted_time: string;
    total_available_slots: number; // Represents remaining available slots (total capacity - registered count)
}

interface Date {
    id: number;
    date: string;
    formatted_date: string;
    times: Time[];
}

interface SlotSelection {
    id: number;
    userid: string;
    name: string;
    department: string | null;
    register_type: 'regular' | 'outsource';
    time_id: number;
    date_id: number;
    slot_title: string;
    time: string;
    date: string;
    created_at: string;
}

interface SearchResult {
    id: number;
    userid: string;
    name: string;
    department: string | null;
    register_type: 'regular' | 'outsource';
    slot_title: string;
    time: string;
    date: string;
    created_at: string;
}

interface UserIndexProps extends PageProps {
    availableDates: Date[];
    settings: {
        title: string;
        register_start_date: string | null;
        register_end_date: string | null;
        is_registration_open: boolean;
    };
}

export default function UserIndex({ availableDates, settings }: UserIndexProps) {
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [department, setDepartment] = useState('');
    const [registerType, setRegisterType] = useState<'regular' | 'outsource'>('regular');
    const [isUserVerified, setIsUserVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationMessage, setRegistrationMessage] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showNotMeModal, setShowNotMeModal] = useState(false);
    const [userSlotSelection, setUserSlotSelection] = useState<SlotSelection | null>(null);
    const [isCheckingSlot, setIsCheckingSlot] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        if (registerType === 'outsource' && userName.trim()) {
            setUserId(formatOutsourceUserId(userName, department));
        }
    }, [registerType, userName, department]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && (showConfirmModal || showNotMeModal)) {
                setShowConfirmModal(false);
                setShowNotMeModal(false);
            }
        };

        if (showConfirmModal || showNotMeModal) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showConfirmModal, showNotMeModal]);

    // Check for cached slot selection when page loads
    useEffect(() => {
        checkCachedSlotSelection();
    }, []);



    const checkCachedSlotSelection = async () => {
        const cachedSelectionId = localStorage.getItem('user_slot_selection_id');
        if (cachedSelectionId) {
            setIsCheckingSlot(true);
            try {
                // Note: You need to create an API endpoint: api.get-slot-selection
                // This should return the slot selection data by ID
                const response = await axios.get(route('api.get-slot-selection', { id: cachedSelectionId }));
                if (response.data.success && response.data.slot_selection) {
                    setUserSlotSelection(response.data.slot_selection);
                    // Pre-populate form fields
                    setUserId(response.data.slot_selection.userid);
                    setUserName(response.data.slot_selection.name);
                    setDepartment(response.data.slot_selection.department || '');
                    setRegisterType(response.data.slot_selection.register_type);
                    setIsUserVerified(true);
                    setIsConfirmed(true);
                    setRegistrationMessage(`คุณได้ลงทะเบียนแล้วสำหรับ: ${response.data.slot_selection.slot_title} เวลา ${response.data.slot_selection.time} วันที่ ${response.data.slot_selection.date}`);
                } else {
                    // Invalid cached ID, remove it
                    localStorage.removeItem('user_slot_selection_id');
                }
            } catch (error) {
                console.error('Error checking cached slot selection:', error);
                // Remove invalid cached ID
                localStorage.removeItem('user_slot_selection_id');
            } finally {
                setIsCheckingSlot(false);
            }
        }
    };

    const handleNotMeClick = () => {
        setShowNotMeModal(true);
    };

    const clearSlotSelection = () => {
        localStorage.removeItem('user_slot_selection_id');
        setUserSlotSelection(null);
        setRegistrationMessage('');
        setErrorMessage('');
        // Reset form states
        setIsUserVerified(false);
        setIsConfirmed(false);
        setUserId('');
        setUserName('');
        setDepartment('');
        setRegisterType('regular');
        setShowNotMeModal(false);
    };



    const handleSlotSelection = async (dateId: number, timeId: number) => {
        if (!isUserVerified) {
            setErrorMessage('กรุณายืนยันข้อมูลผู้ใช้ของคุณก่อนลงทะเบียนสำหรับช่วงเวลา');
            return;
        }

        if (!userId.trim() || !userName.trim()) {
            setErrorMessage('กรุณาแน่ใจว่ารหัสผู้ใช้และชื่อของคุณถูกกรอกแล้ว');
            return;
        }

        setIsRegistering(true);
        setErrorMessage('');
        setRegistrationMessage('');

        try {
            const finalUserId = registerType === 'outsource' ? formatOutsourceUserId(userName, department) : userId.trim();

            const response = await axios.post(route('api.register-slot'), {
                userid: finalUserId,
                name: userName.trim(),
                department: department.trim() || null,
                register_type: registerType,
                time_id: timeId
            });

            if (response.data.success) {
                const slotInfo = response.data.slot_info;
                const message = `ลงทะเบียนสำเร็จแล้ว! ช่วงเวลา: ${slotInfo.slot_title || 'ไม่ระบุ'} เวลา ${slotInfo.time}`;
                setRegistrationMessage(message);

                // Store the slot selection ID in cache
                if (response.data.slot_selection_id) {
                    localStorage.setItem('user_slot_selection_id', response.data.slot_selection_id.toString());

                    // Update the user slot selection state
                    const newSlotSelection: SlotSelection = {
                        id: response.data.slot_selection_id,
                        userid: finalUserId,
                        name: userName.trim(),
                        department: department.trim() || null,
                        register_type: registerType,
                        time_id: timeId,
                        date_id: dateId,
                        slot_title: slotInfo.slot_title || 'N/A',
                        time: slotInfo.time || 'N/A',
                        date: slotInfo.date || 'N/A',
                        created_at: new Date().toISOString()
                    };
                    setUserSlotSelection(newSlotSelection);

                    // Clear any previous error messages
                    setErrorMessage('');
                }

                // Note: You can implement a refresh function for available dates here
            } else {
                setErrorMessage(response.data.message || 'การลงทะเบียนล้มเหลว');
            }
        } catch (error) {
            console.error('Error registering for slot:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
                    setErrorMessage(errorMessage);
                } else if (error.request) {
                    setErrorMessage('ไม่มีการตอบกลับจากเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่อของคุณ');
                } else {
                    setErrorMessage('การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
                }
            } else {
                setErrorMessage('การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleCheckUser = async () => {
        if (!userId.trim()) {
            setErrorMessage('กรุณากรอกรหัสผู้ใช้');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setIsUserVerified(false);
        setIsConfirmed(false);

        try {
            const response = await axios.post(route('api.getuser'), { user_id: userId.trim() });

            if (response.data.success && response.data.user) {
                // Populate the form fields with user data
                setUserName(response.data.user.name || '');
                setDepartment(response.data.user.department || '');
                setIsUserVerified(true);
                setErrorMessage('');
            } else {
                setErrorMessage(response.data.message || 'ไม่พบผู้ใช้');
                setUserName('');
                setDepartment('');
                setIsUserVerified(false);
                setIsConfirmed(false);
            }
        } catch (error) {
            console.error('Error fetching user:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with error status
                    const errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
                    setErrorMessage(errorMessage);
                } else if (error.request) {
                    // Request was made but no response received
                    setErrorMessage('ไม่มีการตอบกลับจากเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่อของคุณ');
                } else {
                    // Something else happened
                    setErrorMessage('การดึงข้อมูลผู้ใช้ล้มเหลว กรุณาลองใหม่อีกครั้ง');
                }
            } else {
                // Non-Axios error
                setErrorMessage('การดึงข้อมูลผู้ใช้ล้มเหลว กรุณาลองใหม่อีกครั้ง');
            }

            setUserName('');
            setDepartment('');
            setIsUserVerified(false);
            setIsConfirmed(false);
        } finally {
            setIsLoading(false);
        }
    };



    const handleShowOutsourceConfirmModal = () => {
        if (!userName.trim()) {
            setErrorMessage('กรุณากรอกชื่อ-นามสกุลของคุณ');
            return;
        }

        // Format the user ID for outsource users
        const formattedUserId = formatOutsourceUserId(userName, department);
        setUserId(formattedUserId);

        setShowConfirmModal(true);
        setErrorMessage('');
    };

    const formatOutsourceUserId = (name: string, dept: string) => {
        if (!name.trim()) return '';
        // Convert name to lowercase, replace spaces with hyphens, and add outsource- prefix
        const namePart = name.toLowerCase().replace(/\s+/g, '-');
        const deptPart = dept.trim() ? `-${dept.toLowerCase().replace(/\s+/g, '-')}` : '';
        return `outsource-${namePart}${deptPart}`;
    };

    const handleRegisterTypeChange = (type: 'regular' | 'outsource') => {
        setRegisterType(type);
        // Reset states when changing register type
        setIsUserVerified(false);
        setIsConfirmed(false);
        setErrorMessage('');
        setRegistrationMessage('');

        // If switching to outsource, auto-format the user ID
        if (type === 'outsource' && userName.trim()) {
            setUserId(formatOutsourceUserId(userName, department));
        }
    };



    const handleShowConfirmModal = () => {
        if (!userId.trim() || !userName.trim()) {
            setErrorMessage('กรุณาแน่ใจว่ารหัสผู้ใช้และชื่อของคุณถูกกรอกแล้ว');
            return;
        }
        setShowConfirmModal(true);
        setErrorMessage('');
    };

    const handleEditInformation = () => {
        setShowConfirmModal(false);
        setIsConfirmed(false);
        setIsUserVerified(false);
    };

    const handleConfirmInformation = () => {
        setShowConfirmModal(false);
        setIsConfirmed(true);
        setIsUserVerified(true);
        setErrorMessage('');
    };

    const handleSearchRegistrations = async () => {
        if (!searchQuery.trim()) {
            setErrorMessage('กรุณากรอกคำค้นหา');
            return;
        }

        setIsSearching(true);
        setErrorMessage('');
        setSearchResults([]);

        try {
            const response = await axios.post(route('api.search-registrations'), {
                search: searchQuery.trim()
            });

            if (response.data.success) {
                setSearchResults(response.data.registrations);
                setShowSearchResults(true);
                if (response.data.count === 0) {
                    setErrorMessage('ไม่พบการลงทะเบียนที่ตรงกับคำค้นหา');
                }
            } else {
                setErrorMessage(response.data.message || 'การค้นหาล้มเหลว');
            }
        } catch (error) {
            console.error('Error searching registrations:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
                    setErrorMessage(errorMessage);
                } else if (error.request) {
                    setErrorMessage('ไม่มีการตอบกลับจากเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่อของคุณ');
                } else {
                    setErrorMessage('การค้นหาล้มเหลว กรุณาลองใหม่อีกครั้ง');
                }
            } else {
                setErrorMessage('การค้นหาล้มเหลว กรุณาลองใหม่อีกครั้ง');
            }
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
        setErrorMessage('');
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-100 text-gray-900">
            {/* Modern Header with Glassmorphism */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/40 via-emerald-600/40 to-cyan-600/40"></div>
                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                        {/* Hero Section */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white text-sm font-medium mb-6 shadow-lg">
                                <Calendar className="w-4 h-4" />
                                Praram 9 Hospital
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg px-4">
                                {settings.title}
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-white max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed drop-shadow-md px-4">
                                เข้าร่วมกับเราในสัปดาห์แห่งการฝึกอบรมความปลอดภัยที่น่าตื่นเต้น
                                เลือกช่วงเวลาที่คุณต้องการและจองตำแหน่งของคุณวันนี้
                            </p>

                            {/* Registration Status Badge */}
                            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
                                {settings.is_registration_open ? (
                                    <>
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                                        <span className="text-white font-semibold text-base sm:text-lg drop-shadow-md">
                                            เปิดลงทะเบียนแล้ว
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-400 rounded-full shadow-lg"></div>
                                        <span className="text-white font-semibold text-base sm:text-lg drop-shadow-md">
                                            ปิดลงทะเบียนแล้ว
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Registration Period */}
                            {settings.register_start_date && settings.register_end_date && (
                                <div className="mt-4 sm:mt-6 text-white text-xs sm:text-sm drop-shadow-md px-4">
                                    <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
                                        <span className="flex items-center gap-1 sm:gap-2">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">ระยะเวลาลงทะเบียน:</span>
                                            <span className="sm:hidden">ระยะเวลาลงทะเบียน</span>
                                        </span>
                                        <span className="text-center">
                                            {new Date(settings.register_start_date).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })} - {new Date(settings.register_end_date).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12 text-gray-900">

                {/* Search Section */}
                <Card className="mb-8 border-0 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center self-center sm:self-auto">
                                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <CardTitle className="text-xl sm:text-2xl font-bold">ค้นหาการลงทะเบียน</CardTitle>
                                <CardDescription className="text-blue-100 text-sm sm:text-base">
                                    ค้นหาการลงทะเบียนด้วยรหัสผู้ใช้หรือชื่อ
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="กรอกรหัสผู้ใช้หรือชื่อเพื่อค้นหา..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchRegistrations()}
                                    className="text-base py-3 px-4 rounded-xl border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                />
                            </div>
                            <div className="flex gap-2 sm:gap-4">
                                <Button
                                    onClick={handleSearchRegistrations}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isSearching ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5" />
                                    )}
                                    <span className="ml-2 hidden sm:inline">{isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}</span>
                                </Button>
                                {showSearchResults && (
                                    <Button
                                        onClick={clearSearch}
                                        variant="outline"
                                        className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-3 rounded-xl transition-all duration-200"
                                    >
                                        <X className="w-5 h-5" />
                                        <span className="ml-2 hidden sm:inline">ล้าง</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        {showSearchResults && (
                            <div className="space-y-4">
                                {searchResults.length > 0 ? (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                            <h3 className="text-lg font-semibold text-blue-800">
                                                ผลการค้นหา ({searchResults.length} รายการ)
                                            </h3>
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 self-start sm:self-auto">
                                                พบ {searchResults.length} รายการ
                                            </Badge>
                                        </div>
                                        <div className="space-y-4">
                                            {searchResults.map((registration) => (
                                                <div key={registration.id} className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                                        <div>
                                                            <span className="font-medium text-blue-700 text-sm">รหัสผู้ใช้:</span>
                                                            <p className="text-blue-800 mt-1 font-mono bg-blue-50 px-3 py-2 rounded-lg break-all">{registration.userid}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-blue-700 text-sm">ชื่อ-นามสกุล:</span>
                                                            <p className="text-blue-800 mt-1 font-medium">{registration.name}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-blue-700 text-sm">แผนก:</span>
                                                            <p className="text-blue-800 mt-1">{registration.department || 'ไม่ระบุ'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-blue-700 text-sm">ประเภท:</span>
                                                            <p className="text-blue-800 mt-1">
                                                                {registration.register_type === 'regular' ? 'พนักงานประจำ' : 'Outsource'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                                            <div>
                                                                <span className="font-medium text-blue-700 text-sm">กิจกรรม:</span>
                                                                <p className="text-blue-800 mt-1">{registration.slot_title}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-blue-700 text-sm">วันที่:</span>
                                                                <p className="text-blue-800 mt-1">{registration.date}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-blue-700 text-sm">เวลา:</span>
                                                                <p className="text-blue-800 mt-1">{registration.time}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-blue-700 text-sm">ลงทะเบียนเมื่อ:</span>
                                                                <p className="text-blue-800 mt-1 text-sm">
                                                                    {new Date(registration.created_at).toLocaleDateString('th-TH', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center border border-gray-200">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                            ไม่พบผลการค้นหา
                                        </h3>
                                        <p className="text-gray-600">
                                            ไม่พบการลงทะเบียนที่ตรงกับคำค้นหา "{searchQuery}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Registration Status */}
                {isCheckingSlot && (
                    <Card className="mb-8 border-0 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl">
                        <CardContent className="p-8 text-center">
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-teal-700 font-semibold text-lg">กำลังตรวจสอบสถานะการลงทะเบียน...</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {userSlotSelection && (
                    <Card className="mb-8 border-0 bg-gradient-to-br from-emerald-50 to-green-100 shadow-xl rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 sm:p-6 text-white">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center self-center sm:self-auto">
                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h3 className="text-xl sm:text-2xl font-bold">ยืนยันการลงทะเบียนแล้ว</h3>
                                            <p className="text-emerald-100 text-sm sm:text-base">คุณพร้อมสำหรับสัปดาห์ความปลอดภัยแล้ว!</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <Button
                                            onClick={handleNotMeClick}
                                            variant="outline"
                                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200 px-4 sm:px-6 py-2 sm:py-3"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            ไม่ใช่ฉัน
                                        </Button>
                                        <div className="text-emerald-100 text-xs sm:text-sm font-medium text-center sm:text-left">
                                            ต้องการเปลี่ยนแปลง? ติดต่อผู้ดูแลระบบ
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Details */}
                            <div className="p-4 sm:p-6">
                                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                                    <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                            <h4 className="font-semibold text-emerald-800 text-sm sm:text-base">กิจกรรม</h4>
                                        </div>
                                        <p className="text-emerald-700 font-medium text-sm sm:text-base">{userSlotSelection.slot_title}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="w-5 h-5 text-emerald-600" />
                                            <h4 className="font-semibold text-emerald-800 text-sm sm:text-base">วันที่และเวลา</h4>
                                        </div>
                                        <p className="text-emerald-700 font-medium text-sm sm:text-base">{userSlotSelection.date} at {userSlotSelection.time}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Users className="w-5 h-5 text-emerald-600" />
                                            <h4 className="font-semibold text-emerald-800 text-sm sm:text-base">ประเภท</h4>
                                        </div>
                                        <p className="text-emerald-700 font-medium text-sm sm:text-base">
                                            {userSlotSelection.register_type === 'regular' ? 'พนักงานประจำ (Regular Employee)' : 'Outsource'}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Info className="w-5 h-5 text-emerald-600" />
                                            <h4 className="font-semibold text-emerald-800 text-sm sm:text-base">สถานะ</h4>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs sm:text-sm">
                                            ยืนยันแล้ว
                                        </Badge>
                                    </div>
                                </div>

                                {/* Personal Details */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 border border-emerald-200 shadow-sm">
                                    <h4 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
                                        <Users className="w-5 h-5" />
                                        ข้อมูลส่วนตัว
                                    </h4>
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-xs sm:text-sm">
                                        <div>
                                            <span className="font-medium text-emerald-700">รหัสผู้ใช้:</span>
                                            <p className="text-emerald-800 mt-1 font-mono bg-emerald-50 px-2 py-1 rounded break-all">{userSlotSelection.userid}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-emerald-700">ชื่อ-นามสกุล:</span>
                                            <p className="text-emerald-800 mt-1">{userSlotSelection.name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-emerald-700">แผนก:</span>
                                            <p className="text-emerald-800 mt-1">{userSlotSelection.department || 'ไม่ระบุ'}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-emerald-700">ลงทะเบียนเมื่อ:</span>
                                            <p className="text-emerald-800 mt-1">
                                                {new Date(userSlotSelection.created_at).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Registration Closed Warning */}
                {!settings.is_registration_open && (
                    <Card className="mb-8 border-0 bg-gradient-to-br from-red-50 to-pink-100 shadow-xl rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 sm:p-6 text-white text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                                    ปิดลงทะเบียนแล้ว
                                </h3>
                                <p className="text-red-100 text-base sm:text-lg px-2">
                                    การลงทะเบียนสำหรับกิจกรรมนี้ยังไม่เปิดให้บริการ กรุณาตรวจสอบอีกครั้งในช่วงเวลาลงทะเบียน
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Message when user already has a slot but registration is still open */}
                {settings.is_registration_open && userSlotSelection && (
                    <Card className="mb-8 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                                    ลงทะเบียนเสร็จสิ้น
                                </h3>
                                <p className="text-blue-100 text-base sm:text-lg mb-4 sm:mb-6 px-2">
                                    คุณได้ลงทะเบียนเรียบร้อยแล้ว คุณสามารถดูรายละเอียดการลงทะเบียนได้ด้านบน
                                    หากต้องการเปลี่ยนแปลงการลงทะเบียน กรุณาติดต่อทีมสัปดาห์ความปลอดภัย
                                </p>
                                <div className="flex justify-center">
                                    <Button
                                        onClick={handleNotMeClick}
                                        variant="outline"
                                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200 px-4 sm:px-6 py-2 sm:py-3"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">ไม่ใช่ฉัน - ลงทะเบียนใหม่</span>
                                        <span className="sm:hidden">ไม่ใช่ฉัน</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* User Information Form - Only show if registration is open and user doesn't have a slot */}
                {settings.is_registration_open && !userSlotSelection && (
                    <Card className="mb-8 border-0 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden text-gray-900">
                        <CardHeader className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center self-center sm:self-auto">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <CardTitle className="text-2xl sm:text-3xl font-bold">แบบฟอร์มลงทะเบียน</CardTitle>
                                    <CardDescription className="text-teal-100 text-base sm:text-lg">
                                        กรุณากรอกข้อมูลของคุณเพื่อดำเนินการลงทะเบียน
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 lg:p-8 text-gray-900">
                            {/* Register Type Selection */}
                            <div className="mb-6 sm:mb-8">
                                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                                    ประเภทการลงทะเบียน
                                </Label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${registerType === 'regular'
                                        ? 'border-teal-500 bg-teal-50 shadow-lg'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            id="regular"
                                            name="registerType"
                                            value="regular"
                                            checked={registerType === 'regular'}
                                            onChange={(e) => handleRegisterTypeChange(e.target.value as 'regular' | 'outsource')}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 ${registerType === 'regular'
                                                ? 'border-teal-500 bg-teal-500'
                                                : 'border-gray-400'
                                                }`}>
                                                {registerType === 'regular' && (
                                                    <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="regular" className="text-lg font-semibold text-gray-800 cursor-pointer">
                                                    พนักงานประจำ
                                                </Label>
                                                <p className="text-sm text-gray-600">พนักงานบริษัทที่มีรหัสผู้ใช้อยู่แล้ว</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${registerType === 'outsource'
                                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            id="outsource"
                                            name="registerType"
                                            value="outsource"
                                            checked={registerType === 'outsource'}
                                            onChange={(e) => handleRegisterTypeChange(e.target.value as 'regular' | 'outsource')}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 ${registerType === 'outsource'
                                                ? 'border-orange-500 bg-orange-500'
                                                : 'border-gray-400'
                                                }`}>
                                                {registerType === 'outsource' && (
                                                    <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="outsource" className="text-lg font-semibold text-gray-800 cursor-pointer">
                                                    พนักงาน Outsource
                                                </Label>
                                                <p className="text-sm text-gray-600">บุคลากรภายนอก</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {/* User ID Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="userId" className="text-base font-semibold text-gray-800">
                                        รหัสผู้ใช้ {registerType === 'outsource' && <span className="text-orange-600 font-medium">(สร้างอัตโนมัติ)</span>}
                                    </Label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Input
                                            id="userId"
                                            type="text"
                                            placeholder={registerType === 'outsource' ? 'จะสร้างอัตโนมัติจากชื่อ' : 'กรอกรหัสผู้ใช้ของคุณ'}
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="flex-1 text-base py-3 px-4 rounded-xl border-2 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                            disabled={isLoading || registerType === 'outsource'}
                                        />
                                        {registerType === 'regular' && (
                                            <Button
                                                onClick={handleCheckUser}
                                                size="lg"
                                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                                disabled={isLoading || !userId.trim()}
                                            >
                                                {isLoading ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Search className="w-5 h-5" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                    {registerType === 'outsource' && (
                                        <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                                            <Info className="w-4 h-4 inline mr-2" />
                                            รหัสผู้ใช้จะถูกสร้างอัตโนมัติในรูปแบบ: <code className="bg-orange-100 px-2 py-1 rounded">outsource-[name]-[department]</code>
                                        </p>
                                    )}
                                </div>

                                {/* User Name Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="userName" className="text-base font-semibold text-gray-800">
                                        ชื่อ-นามสกุล
                                    </Label>
                                    <Input
                                        id="userName"
                                        type="text"
                                        placeholder="กรอกชื่อ-นามสกุลของคุณ"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="text-base py-3 px-4 rounded-xl border-2 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Department Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="department" className="text-base font-semibold text-gray-800">
                                        แผนก
                                    </Label>
                                    <Input
                                        id="department"
                                        type="text"
                                        placeholder="กรอกแผนกของคุณ"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="text-base py-3 px-4 rounded-xl border-2 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 space-y-4">
                                {/* Confirm Button */}
                                {isUserVerified && registerType === 'regular' && (
                                    <div className="text-center">
                                        <Button
                                            onClick={handleShowConfirmModal}
                                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 sm:px-12 py-4 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                                            disabled={!userId.trim() || !userName.trim()}
                                        >
                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                            ยืนยันข้อมูล
                                        </Button>
                                    </div>
                                )}

                                {/* Outsource Confirm Button */}
                                {registerType === 'outsource' && !isUserVerified && (
                                    <div className="text-center">
                                        <Button
                                            onClick={handleShowOutsourceConfirmModal}
                                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 sm:px-12 py-4 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                                            disabled={!userName.trim()}
                                        >
                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                            ยืนยันข้อมูลพนักงาน Outsource
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Status Messages */}
                            <div className="mt-8 space-y-4">
                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                            <p className="text-red-700 font-medium">
                                                {errorMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Registration Success Message */}
                                {registrationMessage && (
                                    <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-xl shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                                <p className="text-green-700 font-medium">
                                                    {registrationMessage}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setRegistrationMessage('')}
                                                className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Verification Status */}
                                {isUserVerified && registerType === 'regular' && (
                                    <div className="p-4 bg-teal-50 border-l-4 border-teal-500 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
                                            <p className="text-teal-700 font-medium">
                                                ✓ ยืนยันตัวตนผู้ใช้เรียบร้อยแล้ว
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Outsource Verification Status */}
                                {isUserVerified && registerType === 'outsource' && (
                                    <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                            <p className="text-orange-700 font-medium">
                                                ✓ ยืนยันข้อมูลพนักงาน Outsourceเรียบร้อยแล้ว
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Confirmation Status */}
                                {isConfirmed && registerType === 'regular' && (
                                    <div className="p-4 bg-teal-50 border-l-4 border-teal-500 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
                                            <p className="text-teal-700 font-medium">
                                                ✓ ยืนยันข้อมูลเรียบร้อยแล้ว - คุณสามารถลงทะเบียนสำหรับช่วงเวลาได้แล้ว
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Outsource Confirmation Status */}
                                {isConfirmed && registerType === 'outsource' && (
                                    <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                            <p className="text-orange-700 font-medium">
                                                ✓ ยืนยันข้อมูลพนักงาน Outsourceเรียบร้อยแล้ว - คุณสามารถลงทะเบียนสำหรับช่วงเวลาได้แล้ว
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <div
                            className="bg-white rounded-3xl p-0 max-w-lg w-full mx-4 relative shadow-2xl transform transition-all duration-300 ease-out scale-100 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">
                                    ยืนยันข้อมูลของคุณ
                                </h3>
                                <p className="text-teal-100">
                                    กรุณาตรวจสอบรายละเอียดของคุณก่อนดำเนินการ
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl p-6 mb-6">
                                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">รหัสผู้ใช้</span>
                                            <p className="text-gray-900 mt-2 font-mono bg-gray-100 px-3 py-2 rounded-lg">{userId}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">ชื่อ-นามสกุล</span>
                                            <p className="text-gray-900 mt-2 font-medium">{userName}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">แผนก</span>
                                            <p className="text-gray-900 mt-2">{department || 'ไม่ระบุ'}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">ประเภท</span>
                                            <p className="text-gray-900 mt-2">
                                                {registerType === 'regular' ? 'พนักงานประจำ (Regular Employee)' : 'Outsource'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {registerType === 'outsource' && (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <Info className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                            <p className="text-orange-700 text-sm">
                                                <strong>หมายเหตุ:</strong> ในฐานะที่เป็นพนักงาน Outsource รหัสผู้ใช้ของคุณจะถูกสร้างอัตโนมัติจากชื่อและแผนกของคุณ
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleEditInformation}
                                        variant="outline"
                                        className="flex-1 py-3 px-6 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <span className="mr-2">✏️</span>
                                        แก้ไขข้อมูล
                                    </Button>
                                    <Button
                                        onClick={handleConfirmInformation}
                                        className={`flex-1 py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${registerType === 'outsource'
                                            ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                                            : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white'
                                            }`}
                                    >
                                        <CheckCircle className="w-5 h-2" />
                                        ยืนยันและดำเนินการต่อ
                                    </Button>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Not Me Confirmation Modal */}
                {showNotMeModal && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowNotMeModal(false)}
                    >
                        <div
                            className="bg-white rounded-3xl p-0 max-w-lg w-full mx-4 relative shadow-2xl transform transition-all duration-300 ease-out scale-100 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">
                                    ยืนยันการล้างข้อมูล
                                </h3>
                                <p className="text-red-100">
                                    คุณแน่ใจหรือไม่ที่จะล้างข้อมูลการลงทะเบียนปัจจุบัน?
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 mb-6">
                                    <div className="text-center">
                                        <p className="text-red-700 text-lg font-semibold mb-2">
                                            การดำเนินการนี้จะ:
                                        </p>
                                        <ul className="text-red-600 text-sm space-y-2">
                                            <li>• ลบข้อมูลการลงทะเบียนจากอุปกรณ์นี้</li>
                                            <li>• รีเซ็ตฟอร์มการลงทะเบียน</li>
                                            <li>• อนุญาตให้ผู้ใช้อื่นลงทะเบียนได้</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setShowNotMeModal(false)}
                                        variant="outline"
                                        className="flex-1 py-3 px-6 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <span className="mr-2">❌</span>
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        onClick={clearSlotSelection}
                                        className="flex-1 py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                                    >
                                        <X className="w-5 h-5 mr-2" />
                                        ยืนยันการล้างข้อมูล
                                    </Button>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowNotMeModal(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Available Dates - Only show if registration is open */}
                {settings.is_registration_open ? (
                    <div className="space-y-8">
                        {availableDates.length === 0 ? (
                            <Card className="border-0 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden text-gray-900">
                                <CardContent className="p-16 text-center text-gray-900">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Calendar className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-700 mb-4">
                                        ไม่มีวันที่ว่าง
                                    </h3>
                                    <p className="text-gray-600 max-w-lg mx-auto text-lg">
                                        ขณะนี้ไม่มีวันที่ว่างสำหรับการลงทะเบียน
                                        กรุณาตรวจสอบอีกครั้งในภายหลัง
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            availableDates.map((date) => (
                                <Card key={date.id} className="border-0 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden text-gray-900">
                                    <CardHeader className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center self-center sm:self-auto">
                                                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <CardTitle className="text-2xl sm:text-3xl font-bold">{date.formatted_date}</CardTitle>
                                                <CardDescription className="text-teal-100 text-base sm:text-lg">
                                                    {date.times.length} time slot{date.times.length !== 1 ? 's' : ''} available
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6 lg:p-8 text-gray-900">
                                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                            {date.times.map((time) => (
                                                <div
                                                    key={time.id}
                                                    className={`relative bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 hover:shadow-xl ${time.total_available_slots === 0
                                                        ? 'border-gray-200 bg-gray-100'
                                                        : 'border-teal-200 hover:border-teal-400 hover:scale-105'
                                                        }`}
                                                >
                                                    {/* Time Header */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${time.total_available_slots === 0
                                                            ? 'bg-gray-300'
                                                            : 'bg-teal-100'
                                                            }`}>
                                                            <Clock className={`w-6 h-6 ${time.total_available_slots === 0
                                                                ? 'text-gray-500'
                                                                : 'text-teal-600'
                                                                }`} />
                                                        </div>
                                                        <div className="text-center sm:text-left">
                                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                                                {time.formatted_time}
                                                            </h3>
                                                            <p className="text-gray-600 text-sm sm:text-base">
                                                                ช่วงเวลาที่สามารถลงทะเบียนได้
                                                            </p>
                                                        </div>
                                                    </div>


                                                    {/* Register Button or Full Status */}
                                                    {time.total_available_slots === 0 ? (
                                                        <div className="w-full py-4 text-lg font-bold rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center">
                                                            <X className="w-6 h-6 mr-3" />
                                                            เต็มแล้ว
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleSlotSelection(date.id, time.id)}
                                                            className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                            disabled={isRegistering ||
                                                                (registerType === 'regular' ? (!isUserVerified || !isConfirmed) : !isConfirmed)}
                                                        >
                                                            {isRegistering ? (
                                                                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3" />
                                                            ) : (
                                                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                                            )}
                                                            <span className="hidden sm:inline">
                                                                {isRegistering ? 'กำลังลงทะเบียน...' :
                                                                    (registerType === 'regular' ? (!isConfirmed ? 'ยืนยันข้อมูลก่อน' : 'ลงทะเบียนเลย') :
                                                                        (!isConfirmed ? 'ยืนยันข้อมูลพนักงาน Outsource' : 'ลงทะเบียนเลย'))}
                                                            </span>
                                                            <span className="sm:hidden">
                                                                {isRegistering ? 'กำลังลงทะเบียน...' :
                                                                    (registerType === 'regular' ? (!isConfirmed ? 'ยืนยันก่อน' : 'ลงทะเบียน') :
                                                                        (!isConfirmed ? 'ยืนยัน Outsource' : 'ลงทะเบียน'))}
                                                            </span>
                                                        </Button>
                                                    )}
                                                    {/* Warning for Low Availability */}
                                                    {time.total_available_slots <= 5 && time.total_available_slots > 0 && (
                                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                                                            <p className="text-sm text-amber-700 font-semibold">
                                                                ⚠️ เหลือเพียง {time.total_available_slots} ตำแหน่ง!
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Full Slot Message */}
                                                    {time.total_available_slots === 0 && (
                                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                                                            <p className="text-sm text-red-700 font-semibold">
                                                                ❌ ช่วงเวลานี้เต็มแล้ว
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    <Card className="border-0 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden text-gray-900">
                        <CardContent className="p-16 text-center text-gray-900">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center mb-6">
                                <Calendar className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4">
                                การลงทะเบียนปิดอยู่
                            </h3>
                            <p className="text-gray-600 max-w-lg mx-auto text-lg">
                                ระยะเวลาการลงทะเบียนสำหรับกิจกรรมนี้ยังไม่เปิดให้บริการ
                                กรุณาตรวจสอบอีกครั้งในช่วงเวลาการลงทะเบียนที่กำหนด
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

