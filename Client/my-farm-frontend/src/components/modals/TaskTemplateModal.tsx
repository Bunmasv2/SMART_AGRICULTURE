import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ClipboardListIcon, ClockIcon, SaveIcon } from 'lucide-react';
import type { TaskTemplate } from '../../models/Task';

interface TaskTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    stageId: number | null;
    editTask: TaskTemplate | null; 
}

export default function TaskTemplateModal({ isOpen, onClose, onSave, stageId, editTask }: TaskTemplateModalProps) {
    const [taskName, setTaskName] = useState('');
    const [offsetDay, setOffsetDay] = useState(0);
    const [loading, setLoading] = useState(false);

    // Điền dữ liệu nếu là chế độ Edit
    useEffect(() => {
        if (editTask) {
            setTaskName(editTask.taskName);
            setOffsetDay(editTask.offsetDay);
        } else {
            setTaskName('');
            setOffsetDay(0);
        }
    }, [editTask, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stageId) return;

        setLoading(true);
        const payload = {
            taskName,
            offsetDay,
            stageId
        };

        try {
            if (editTask) {
                await axios.put(`http://localhost:8080/api/task-templates/${editTask.taskTmpId}`, payload);
            } else {
                await axios.post(`http://localhost:8080/api/task-templates`, payload);
            }
            onSave(); 
            onClose();
        } catch (error) {
            console.error("Lỗi lưu Task Template:", error);
            alert("Không thể lưu công việc mẫu!");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                            <ClipboardListIcon className="h-5 w-5" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">
                            {editTask ? 'Sửa công việc' : 'Thêm công việc'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                        <XMarkIcon className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Tên công việc */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Tên công việc</label>
                        <input
                            required
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="VD: Tưới nước, Làm cỏ..."
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold"
                        />
                    </div>

                    {/* Ngày thực hiện (Offset) */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" /> Ngày thứ bao nhiêu trong giai đoạn?
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                required
                                value={offsetDay}
                                onChange={(e) => setOffsetDay(parseInt(e.target.value))}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Ngày</span>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-400 italic leading-relaxed">
                            * Ví dụ: Nhập 0 để làm ngay ngày đầu tiên của giai đoạn.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <SaveIcon className="h-4 w-4" />
                            )}
                            {editTask ? 'Cập nhật' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}