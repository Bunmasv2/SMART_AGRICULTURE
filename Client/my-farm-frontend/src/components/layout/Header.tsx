import { BellIcon, UserCircleIcon, MagnifyingGlassIcon, ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <header className="w-full h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 z-20 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-2 w-56">
                <img src="/logo-agrikon.png" alt="Agrikon" className="h-8" />
                <span className="text-2xl font-bold text-[#2c9b4e]">Agrikon</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl px-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#2c9b4e] focus:ring-1 focus:ring-[#2c9b4e] transition-colors"
                    />
                </div>
            </div>

            {/* Actions: Notification Center & Profile */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-500 hover:text-[#2c9b4e] transition-colors">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-1">
                            <span className="text-[10px] text-gray-400 leading-none">Xin chào,</span>
                            <span className="text-sm font-semibold text-gray-700 leading-tight">{user.fullName}</span>
                        </div>
                        <div className="relative group">
                            <UserCircleIcon className="h-8 w-8 text-[#2c9b4e] cursor-pointer" />
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 transition-colors rounded-lg"
                                >
                                    <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-[#2c9b4e] transition-colors">
                        <UserCircleIcon className="h-8 w-8" />
                        <span className="text-sm font-medium">Đăng nhập</span>
                    </Link>
                )}
            </div>
        </header>
    );
}