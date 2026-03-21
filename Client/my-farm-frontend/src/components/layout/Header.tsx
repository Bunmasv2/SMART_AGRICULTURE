import { BellIcon, UserCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Header() {
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
                    {/* Chấm đỏ cảnh báo/thông báo */}
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-[#2c9b4e]">
                    <UserCircleIcon className="h-8 w-8" />
                </button>
            </div>
        </header>
    );
}