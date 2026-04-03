import { useEffect, useState } from "react";
import type { StageBase } from "../../models/Stage";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function StageModal({
    isOpen,
    onClose,
    onSave,
    processId,
    totalDays,
    editStage,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (stage: StageBase) => void;
    processId: number;
    totalDays: number;
    editStage?: StageBase | null;
}) {
    const [form, setForm] = useState({ stageName: '', startDay: '', endDay: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editStage) {
            setForm({
                stageName: editStage.stageName,
                startDay: String(editStage.startDay),
                endDay: String(editStage.endDay),
            });
        } else {
            setForm({ stageName: '', startDay: '', endDay: '' });
        }
    }, [editStage, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                stageName: form.stageName,
                startDay: Number(form.startDay),
                endDay: Number(form.endDay),
                processId,
            };

            if (editStage) {
                const res = await axios.put(`http://localhost:8080/api/stages/${editStage.stageId}`, payload);
                onSave(res.data.data);
            } else {
                const res = await axios.post(`http://localhost:8080/api/stages`, payload);
                onSave(res.data.data);
            }
            onClose();
        } catch (err: any) {
            const message = err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-7 py-5 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">
                            {editStage ? 'Chỉnh sửa giai đoạn' : 'Thêm giai đoạn'}
                        </h2>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                            Phạm vi: ngày 1 → {totalDays}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full">
                        <XMarkIcon className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-7 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên giai đoạn</label>
                        <input
                            required type="text"
                            placeholder="VD: Nảy mầm, Ra hoa..."
                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={form.stageName}
                            onChange={e => setForm({ ...form, stageName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ngày bắt đầu</label>
                            <input
                                required type="number" min={1} max={totalDays}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                value={form.startDay}
                                onChange={e => setForm({ ...form, startDay: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ngày kết thúc</label>
                            <input
                                required type="number" min={1} max={totalDays}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                value={form.endDay}
                                onChange={e => setForm({ ...form, endDay: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]">
                            {loading ? 'Đang lưu...' : editStage ? 'Cập nhật' : 'Thêm giai đoạn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}