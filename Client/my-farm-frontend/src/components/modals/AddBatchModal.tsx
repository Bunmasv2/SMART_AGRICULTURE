import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { CropBase } from '../../models/Crop';
import type { GrowthProcessBase } from '../../models/GrowthProcess';
import { PlusIcon } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface AddBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddBatchModal({ isOpen, onClose, onSuccess }: AddBatchModalProps) {
    const [crops, setCrops] = useState<CropBase[]>([]);
    const [processes, setProcesses] = useState<GrowthProcessBase[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        batchName: '',
        cropId: '',
        processId: '',
        areaM2: '',
        cropCount: '',
        locationCoords: '',
        startDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCrops = async () => {
            if (!isOpen) return;

            try {
                const res = await axios.get('http://localhost:8080/api/crops');
                setCrops(res.data.data);
            } catch (err) {
                console.error("Lỗi lấy danh sách cây:", err);
            }
        };

        fetchCrops();
    }, [isOpen]);

    useEffect(() => {
        const fetchProcesses = async () => {
            if (!formData.cropId) {
                setProcesses([]);
                return;
            }

            try {
                const res = await axios.get(`http://localhost:8080/api/growth-processes?cropId=${formData.cropId}`);
                setProcesses(res.data.data);
            } catch (err) {
                console.error("Lỗi lấy quy trình:", err);
            }
        };

        fetchProcesses();
    }, [formData.cropId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8080/api/planting-batches', {
                ...formData,
                cropId: Number(formData.cropId),
                processId: Number(formData.processId),
                areaM2: Number(formData.areaM2),
                cropCount: Number(formData.cropCount)
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Khởi tạo lô canh tác mới</h2>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Thiết lập thông số cho mùa vụ mới</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <XMarkIcon className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên định danh lô</label>
                            <input
                                required
                                type="text"
                                placeholder="Ví dụ: Lô C1-2026..."
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                value={formData.batchName}
                                onChange={e => setFormData({ ...formData, batchName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Loại cây trồng</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                                value={formData.cropId}
                                onChange={e => setFormData({ ...formData, cropId: e.target.value, processId: '' })}
                            >
                                <option value="">Chọn loại cây...</option>
                                {crops.map(c => <option key={c.cropId} value={c.cropId}>{c.cropName} - {c.variety}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Quy trình áp dụng</label>
                            {formData.cropId && processes.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => navigate("/processes")}
                                    className="w-full px-4 py-2.5 bg-rose-50 border border-dashed border-rose-200 rounded-2xl flex items-center justify-between group hover:bg-rose-100 transition-all"
                                >
                                    <span className="text-[10px] font-bold text-rose-600 uppercase">
                                        Chưa có quy trình
                                    </span>
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm group-hover:text-rose-700">
                                        <PlusIcon className="h-3 w-3 stroke-[3px]" />
                                        <span className="text-[9px] font-black">TẠO MỚI</span>
                                    </div>
                                </button>
                            ) : (
                                <select
                                    required
                                    disabled={!formData.cropId}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none disabled:opacity-50"
                                    value={formData.processId}
                                    onChange={e => setFormData({ ...formData, processId: e.target.value })}
                                >
                                    <option value="">{formData.cropId ? "Chọn quy trình..." : "Chờ chọn cây..."}</option>
                                    {processes.map(p => <option key={p.processId} value={p.processId}>{p.processName}</option>)}
                                </select>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Diện tích (m²)</label>
                            <input
                                required type="number"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700"
                                value={formData.areaM2}
                                onChange={e => setFormData({ ...formData, areaM2: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số lượng cây</label>
                            <input
                                required type="number"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700"
                                value={formData.cropCount}
                                onChange={e => setFormData({ ...formData, cropCount: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ngày xuống giống</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    required type="date"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tọa độ GPS (Tùy chọn)</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text" placeholder="10.123, 106.456"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none"
                                    value={formData.locationCoords}
                                    onChange={e => setFormData({ ...formData, locationCoords: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận tạo lô'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}