import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
    UsersIcon,
    ShieldCheckIcon,
    UserIcon,
    IdentificationIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:8080/api';

interface UserDto {
    userId: number;
    fullName: string;
    email: string;
    roleId?: number;
    roleName?: string;
}

const ROLES = [
    { id: 1, name: 'Super Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Worker' }
];

export default function UserManagement() {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchUsers = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/users`);
            setUsers(res.data.data || []);
        } catch (err) {
            console.error('Fetch users error', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: number, roleId: number) => {
        setUpdatingUserId(userId);
        try {
            await axios.patch(`${API_BASE}/users/${userId}/role?roleId=${roleId}`, null, {
                headers: {
                    'X-Role-Id': currentUser.roleId
                }
            });
            setToast({ message: 'Cập nhật vai trò thành công!', type: 'success' });
            fetchUsers();
        } catch (err: any) {
            console.error('Update role error', err);
            setToast({
                message: err.response?.data?.message || 'Không có quyền cập nhật hoặc lỗi server.',
                type: 'error'
            });
        } finally {
            setUpdatingUserId(null);
            setTimeout(() => setToast(null), 3000);
        }
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <UsersIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Quản lý người dùng</h1>
                        <p className="text-sm text-slate-500 font-medium italic">Thay đổi vai trò và phân quyền (Admin Only)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm font-bold">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Total: {users.length} Users
                </div>
            </div>

            {/* Notification Toast */}
            {toast && (
                <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl transition-all animate-in slide-in-from-right-full ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationCircleIcon className="h-6 w-6" />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Họ & Tên</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Vai Trò Hiện Tại</th>
                                <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.userId} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700">{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-slate-500 font-medium text-sm">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.roleId === 1 ? 'bg-orange-100 text-orange-600' :
                                            user.roleId === 2 ? 'bg-blue-100 text-blue-600' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                            {user.roleId === 1 && <ShieldCheckIcon className="h-3 w-3" />}
                                            {user.roleId === 2 && <IdentificationIcon className="h-3 w-3" />}
                                            {user.roleId === 3 && <UserIcon className="h-3 w-3" />}
                                            {user.roleName || 'Chưa phân quyền'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="relative inline-block text-left group/dropdown">
                                            <div className="flex items-center justify-end gap-2">
                                                {updatingUserId === user.userId ? (
                                                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-emerald-600 mr-4"></div>
                                                ) : (
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        {ROLES.map(role => (
                                                            <button
                                                                key={role.id}
                                                                onClick={() => handleRoleChange(user.userId, role.id)}
                                                                disabled={user.roleId === role.id || currentUser.userId === user.userId}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${user.roleId === role.id
                                                                    ? 'bg-slate-100 text-slate-400 cursor-default'
                                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-600 active:scale-95'
                                                                    } ${currentUser.userId === user.userId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {role.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warning footnote */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-medium">
                <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                <span>Bạn không thể tự thay đổi vai trò của chính mình để tránh lỗi mất quyền truy cập. Các thay đổi sẽ có hiệu lực ngay lập tức cho người dùng đó.</span>
            </div>
        </div>
    );
}
