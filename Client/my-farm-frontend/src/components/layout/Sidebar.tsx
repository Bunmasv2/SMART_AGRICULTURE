import {
    HomeIcon,
    MapIcon,
    DocumentChartBarIcon,
    ArchiveBoxIcon,
    CalendarDaysIcon,
    SparklesIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
    const location = useLocation();

    // Nhóm các route lại để Sidebar gọn gàng hơn
    const menuItems = [
        { name: 'Dashboard', path: '/', icon: HomeIcon },
        { name: 'Lô trồng', path: '/lo-trong', icon: MapIcon },
        { name: 'Quy trình', path: '/quy-trinh', icon: DocumentChartBarIcon },
        { name: 'Kho vật tư', path: '/kho-vat-tu', icon: ArchiveBoxIcon },
        { name: 'Công việc & Lịch', path: '/cong-viec', icon: CalendarDaysIcon },
        { name: 'Trợ lý AI', path: '/ai-assistant', icon: SparklesIcon },
        { name: 'Hệ thống', path: '/he-thong', icon: Cog6ToothIcon },
    ];

    return (
        <aside className={`flex flex-col h-full bg-white border-r border-gray-100 ${className}`}>
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-green-50 text-[#2c9b4e] font-semibold'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2c9b4e]'
                                }`}
                        >
                            <item.icon className={`h-6 w-6 ${isActive ? 'text-[#2c9b4e]' : 'text-gray-400'}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}