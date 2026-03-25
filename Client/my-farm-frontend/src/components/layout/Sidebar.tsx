import {
    HomeIcon,
    MapIcon,
    DocumentChartBarIcon,
    ArchiveBoxIcon,
    CalendarDaysIcon,
    SparklesIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Nhóm các route lại để Sidebar gọn gàng hơn
    const menuItems = [
        { name: 'Dashboard', path: '/', icon: HomeIcon },
        { name: 'Lô trồng', path: '/lo-trong', icon: MapIcon },
        { name: 'Quy trình', path: '/quy-trinh', icon: DocumentChartBarIcon },
        {
            name: 'Kho vật tư',
            path: '/kho-vat-tu',
            icon: ArchiveBoxIcon,
            children: [
                { name: 'Kho hạt giống', path: '/inventory' },
                { name: 'Kho phân bón', path: '/fertilizers' },
                { name: 'Kho thuốc BVTV', path: '/pesticides' },
            ]
        },
        { name: 'Công việc & Lịch', path: '/cong-viec', icon: CalendarDaysIcon },
        { name: 'Trợ lý AI', path: '/ai-assistant', icon: SparklesIcon },
        { name: 'Hệ thống', path: '/he-thong', icon: Cog6ToothIcon },
    ];

    return (
        <aside className={`flex flex-col h-full bg-white border-r border-gray-100 ${className}`}>
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    const hasChildren = item.children;

                    return (
                        <div key={item.name}>
                            {/* MENU CHA */}
                            <div
                                onClick={() => {
                                    if (hasChildren) {
                                        setOpenMenu(openMenu === item.name ? null : item.name);
                                    }
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${isActive
                                    ? 'bg-green-50 text-[#2c9b4e] font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#2c9b4e]'
                                    }`}
                            >
                                <item.icon className={`h-6 w-6 transition ${isActive ? 'text-[#2c9b4e]' : 'text-gray-400 group-hover:text-[#2c9b4e]'}`} />
                                <span>{item.name}</span>
                            </div>

                            {/* SUB MENU */}
                            {hasChildren && (
                                <div
                                    className={` overflow-hidden transition-all duration-300 ${openMenu === item.name ? 'max-h-40 mt-1' : 'max-h-0'
                                        }`}
                                >
                                    <div className="space-y-1 border-l border-gray-200 pl-1">
                                        {item.children.map((child) => {
                                            const isChildActive = location.pathname === child.path;

                                            return (
                                                <Link
                                                    key={child.name}
                                                    to={child.path}
                                                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isChildActive
                                                        ? 'bg-green-100 text-[#2c9b4e] font-medium shadow-sm'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#2c9b4e] hover:translate-x-1'
                                                        }`}
                                                >
                                                    {child.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}