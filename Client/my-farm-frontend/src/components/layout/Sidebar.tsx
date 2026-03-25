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
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const navigate = useNavigate()
   const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },

    { name: 'Batches', path: '/batches', icon: MapIcon },

    { name: 'Processes', path: '/processes', icon: DocumentChartBarIcon },

    {
        name: 'Inventory',
        path: '/inventory',
        icon: ArchiveBoxIcon,
        children: [
            { name: 'Seed Inventory', path: '/inventory' },
            { name: 'Fertilizers', path: '/fertilizers' },
            { name: 'Pesticides', path: '/pesticides' },
        ]
    },

    {
        name: 'Tasks & Calendar',
        path: '/tasks',
        icon: CalendarDaysIcon,
        children: [
            { name: 'Tasks', path: '/tasks' },
            { name: 'Calendar', path: '/calendar' },
        ]
    },

    { name: 'AI Assistant', path: '/ai-assistant', icon: SparklesIcon },

    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
];
    return (
        <aside className={`flex flex-col h-full bg-white border-r border-gray-100 ${className}`}>
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const hasChildren = item.children;

                    const isChildActive = hasChildren &&
                        item.children.some(child => location.pathname === child.path);

                    const isActive =
                        location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path)) ||
                        isChildActive;

                    const isOpen = openMenu === item.name || isChildActive;

                    return (
                        <div key={item.name}>
                            {/* MENU CHA */}
                            <div
                                onClick={() => {
                                    if (hasChildren) {
                                        setOpenMenu(isOpen ? null : item.name);
                                    } else {
                                        navigate(`/${item.path}`)
                                    }
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-green-50 text-[#2c9b4e] font-semibold'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#2c9b4e]'
                                }`}
                            >
                                <item.icon
                                    className={`h-6 w-6 transition ${
                                        isActive
                                            ? 'text-[#2c9b4e]'
                                            : 'text-gray-400 group-hover:text-[#2c9b4e]'
                                    }`}
                                />
                                <span>{item.name}</span>
                            </div>

                            {/* SUB MENU */}
                            {hasChildren && (
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${
                                        isOpen ? 'max-h-40 mt-1' : 'max-h-0'
                                    }`}
                                >
                                    <div className="space-y-1 border-l border-gray-200 pl-2 ml-4">
                                        {item.children.map((child) => {
                                            const isActive = location.pathname === child.path;

                                            return (
                                                <Link
                                                    key={child.name}
                                                    to={child.path}
                                                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                                        isActive
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