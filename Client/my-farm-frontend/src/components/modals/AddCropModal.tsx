import React, { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

const WEATHER_CODE_OPTIONS = [
    { value: 0, label: 'Trời quang' },
    { value: 3, label: 'Nhiều mây' },
    { value: 9, label: 'Sương mù nhẹ' },
    { value: 19, label: 'Mưa phùn' },
    { value: 29, label: 'Mưa rào' },
    { value: 39, label: 'Tuyết' },
    { value: 49, label: 'Sương mù' },
    { value: 59, label: 'Mưa phùn' },
    { value: 69, label: 'Mưa vừa đến to' },
    { value: 79, label: 'Tuyết' },
    { value: 84, label: 'Mưa rào' },
    { value: 94, label: 'Tuyết rào' },
    { value: 95, label: 'Giông bão' }
];

interface AddCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddCropModal({ isOpen, onClose, onSuccess }: AddCropModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cropName: '',
        variety: '',
        description: '',
        rainProbabilityThreshold: 70,
        highTempThreshold: 30.0,
        lowTempThreshold: 15.0,
        strongWindThreshold: 40.0,
        highHumidityThreshold: 90,
        stormWeatherCode: 95
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8080/api/crops', formData);
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                cropName: '', variety: '', description: '',
                rainProbabilityThreshold: 70, highTempThreshold: 30.0,
                lowTempThreshold: 15.0, strongWindThreshold: 40.0,
                highHumidityThreshold: 90, stormWeatherCode: 95
            });
        } catch (error) {
            console.error("Lỗi thêm cây trồng", error);
            alert("Đã có lỗi xảy ra. Hãy chắc chắn bạn đã chạy query mysql ALTER TABLE.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Thêm giống cây trồng mới</h2>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Thiết lập cấu hình và ngưỡng nhiệt độ</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <XMarkIcon className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-5 mb-4">
                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên giống cây (*)</label>
                            <input
                                required
                                type="text"
                                placeholder="VD: Chanh Bông Tím"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700"
                                value={formData.cropName}
                                onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Phân loại (Variety)</label>
                            <input
                                type="text"
                                placeholder="VD: Citrus Macrophylla"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700"
                                value={formData.variety}
                                onChange={e => setFormData({ ...formData, variety: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mô tả đặc tính</label>
                            <textarea
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700 resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Ngưỡng thời tiết cảnh báo (Tùy chỉnh)</h3>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cảnh báo nhiệt độ cao (°C)</label>
                            <input
                                type="number" step="0.1"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700"
                                value={formData.highTempThreshold}
                                onChange={e => setFormData({ ...formData, highTempThreshold: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cảnh báo nhiệt độ thấp (°C)</label>
                            <input
                                type="number" step="0.1"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700"
                                value={formData.lowTempThreshold}
                                onChange={e => setFormData({ ...formData, lowTempThreshold: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Xác suất Cảnh báo mưa (%)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700"
                                value={formData.rainProbabilityThreshold}
                                onChange={e => setFormData({ ...formData, rainProbabilityThreshold: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cảnh báo Gió mạnh (km/h)</label>
                            <input
                                type="number" step="0.1"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700"
                                value={formData.strongWindThreshold}
                                onChange={e => setFormData({ ...formData, strongWindThreshold: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Độ ẩm tối đa (%)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700"
                                value={formData.highHumidityThreshold}
                                onChange={e => setFormData({ ...formData, highHumidityThreshold: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cảnh báo từ mức thời tiết</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                                value={formData.stormWeatherCode}
                                onChange={e => setFormData({ ...formData, stormWeatherCode: Number(e.target.value) })}
                            >
                                {WEATHER_CODE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
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
                            {loading ? 'Đang xử lý...' : 'Xác nhận lập cây'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
