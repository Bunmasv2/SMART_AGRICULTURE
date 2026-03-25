import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    MagnifyingGlassIcon,
    CalendarDaysIcon,
    ArchiveBoxIcon,
    ChevronDownIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface Crop {
    cropId: number;
    cropName: string;
}

interface SeedBatch {
    batchInvId?: number;
    itemId?: number;
    itemName: string;
    cropId?: number;
    cropName?: string;
    supplier: string;
    quantity: number | '';
    expiryDate: string;
    productionDate: string;
    receivedDate?: string;
    minThreshold?: number;
}

export default function Inventory() {
    const [seeds, setSeeds] = useState<SeedBatch[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeed, setEditingSeed] = useState<SeedBatch | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'attention'>('all');

    // Form State
    const [formData, setFormData] = useState<SeedBatch>({
        itemName: '',
        supplier: '',
        quantity: 0,
        expiryDate: '',
        productionDate: '',
        cropId: undefined,
        minThreshold: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [seedsRes, cropsRes] = await Promise.all([
                axios.get(`/inventory-batches?category=SEED`),
                axios.get(`/crops`)
            ]);
            setSeeds(seedsRes.data.data || []);
            setCrops(cropsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (seed: SeedBatch | null = null) => {
        if (seed) {
            setEditingSeed(seed);
            setFormData({ ...seed });
        } else {
            setEditingSeed(null);
            setFormData({
                itemName: '',
                supplier: '',
                quantity: 0,
                expiryDate: '',
                productionDate: '',
                cropId: crops.length > 0 ? crops[0].cropId : undefined,
                minThreshold: 10 // Default threshold
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSeed(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Convert empty strings back to 0 for submission
            const submissionData = {
                ...formData,
                quantity: formData.quantity === '' ? 0 : formData.quantity
            };

            if (editingSeed) {
                await axios.put(`/inventory-batches/${editingSeed.batchInvId}`, submissionData);
            } else {
                const itemRes = await axios.post(`/inventory-items`, {
                    itemName: formData.itemName,
                    category: 'SEED',
                    unit: 'kg',
                    cropId: formData.cropId,
                    minThreshold: formData.minThreshold
                });
                
                const newItem = itemRes.data.data;

                await axios.post(`/inventory-batches`, {
                    ...submissionData,
                    itemId: newItem.itemId
                });
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving seed:', error);
            alert('Có lỗi xảy ra khi lưu thông tin.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hạt giống này?')) {
            try {
                await axios.delete(`/inventory-batches/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting seed:', error);
            }
        }
    };

    const filteredSeeds = seeds.filter(seed => {
        const matchesSearch = seed.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              seed.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterType === 'attention') {
            return matchesSearch && (isExpired(seed.expiryDate) || isNearExpiry(seed.expiryDate) || isLowStock(seed.quantity, seed.minThreshold));
        }
        
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#f8faf7] p-4 md:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-500 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-green-700">Inventory Management</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-800">
                            Quản lý <span className="text-[#2c9b4e]">Hạt Giống</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Theo dõi tồn kho, tỷ lệ nảy mầm và thời hạn sử dụng</p>
                    </div>
                    
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-[#2c9b4e] hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-green-100 flex items-center gap-3 active:scale-95 group"
                    >
                        <PlusIcon className="h-5 w-5 stroke-[3]" />
                        <span>Thêm Hạt Giống</span>
                    </button>
                </header>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Tổng chủng loại" 
                        value={new Set(seeds.map(s => s.itemName)).size.toString()} 
                        icon={<ArchiveBoxIcon />} 
                        color="green" 
                    />
                    <StatCard 
                        title="Tổng tồn kho" 
                        value={`${seeds.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0)} kg`} 
                        icon={<ArchiveBoxIcon />} 
                        color="blue" 
                    />
                    <StatCard 
                        title="Hạt giống cần chú ý" 
                        value={seeds.filter(s => 
                            isExpired(s.expiryDate) || 
                            isNearExpiry(s.expiryDate) || 
                            isLowStock(s.quantity, s.minThreshold)
                        ).length.toString()} 
                        icon={<PlusIcon />} 
                        color="red"
                        onClick={() => setFilterType('attention')}
                        isActive={filterType === 'attention'}
                    />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Search and Filters */}
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm tên hạt giống, nhà cung cấp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            {filterType === 'attention' && (
                                <button 
                                    onClick={() => setFilterType('all')}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-all animate-in slide-in-from-right-4"
                                >
                                    <span>Đang xem: Cần chú ý</span>
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                            <div className="flex gap-2">
                                 {/* Optional filter buttons could go here */}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Tên hạt giống</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Cây trồng</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Nhà cung cấp</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Ngày sản xuất</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Hạn sử dụng</th>
                                     <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Số lượng</th>
                                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-medium">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : filteredSeeds.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-medium">Không tìm thấy hạt giống nào.</td>
                                    </tr>
                                ) : filteredSeeds.map((seed) => (
                                    <tr key={seed.batchInvId} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-800">{seed.itemName}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                                                {seed.cropName || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">{seed.supplier}</td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                                                {seed.productionDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className={`flex items-center gap-2 font-bold ${isExpired(seed.expiryDate) ? 'text-red-500' : isNearExpiry(seed.expiryDate) ? 'text-orange-500' : 'text-slate-600'}`}>
                                                    <CalendarDaysIcon className="h-4 w-4 opacity-50" />
                                                    {seed.expiryDate}
                                                </div>
                                                {isExpired(seed.expiryDate) && (
                                                    <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-md border border-red-100">Đã hết hạn</span>
                                                )}
                                                {isNearExpiry(seed.expiryDate) && (
                                                    <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-md border border-orange-100">Sắp hết hạn</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="space-y-1">
                                                <p className={`font-black ${isLowStock(seed.quantity, seed.minThreshold) ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {seed.quantity} <span className="text-[10px] text-slate-400 font-bold uppercase">kg</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold italic">
                                                    Ngưỡng: {seed.minThreshold || 0} kg
                                                </p>
                                                {isLowStock(seed.quantity, seed.minThreshold) && (
                                                    <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-md border border-red-100">Bổ sung ngay</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleOpenModal(seed)}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => seed.batchInvId && handleDelete(seed.batchInvId)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">
                                    {editingSeed ? 'Cập Nhật' : 'Thêm'} <span className="text-[#2c9b4e]">Hạt Giống</span>
                                </h2>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Thông tin chi tiết lô hạt</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-2xl transition-all">
                                <XMarkIcon className="h-6 w-6 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tên hạt giống</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="VD: Chanh Không Hạt F1"
                                        value={formData.itemName}
                                        onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Cây trồng tương ứng</label>
                                    <div className="relative">
                                        <select 
                                            required
                                            value={formData.cropId}
                                            onChange={(e) => setFormData({...formData, cropId: Number(e.target.value)})}
                                            className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            {crops.map(crop => (
                                                <option key={crop.cropId} value={crop.cropId}>{crop.cropName}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nhà cung cấp</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="VD: Vinaseed Group"
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Số lượng tồn kho (kg)</label>
                                    <input 
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setFormData({...formData, quantity: ''});
                                                return;
                                            }
                                            const num = parseFloat(val);
                                            setFormData({...formData, quantity: isNaN(num) ? 0 : Math.max(0, num)});
                                        }}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Ngày sản xuất</label>
                                    <input 
                                        required
                                        type="date"
                                        value={formData.productionDate}
                                        onChange={(e) => setFormData({...formData, productionDate: e.target.value})}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Hạn sử dụng</label>
                                    <input 
                                        required
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 font-bold text-slate-700"
                                     />
                                 </div>
                                 <div className="space-y-2 md:col-span-2">
                                     <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Ngưỡng báo động (kg)</label>
                                     <input 
                                         required
                                         type="number"
                                         step="0.01"
                                         min="0"
                                         placeholder="Cảnh báo khi dưới mức này"
                                         value={formData.minThreshold}
                                         onChange={(e) => setFormData({...formData, minThreshold: Number(e.target.value)})}
                                         className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 font-bold text-slate-700"
                                     />
                                 </div>
                             </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-95"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-4 bg-[#2c9b4e] hover:bg-green-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-green-100 active:scale-95"
                                >
                                    Lưu Thông Tin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactElement<{ className?: string }>;
    color: 'green' | 'blue' | 'indigo' | 'red';
    onClick?: () => void;
    isActive?: boolean;
}

function StatCard({ title, value, icon, color, onClick, isActive }: StatCardProps) {
    const colors = {
        green: "bg-green-50 text-green-600 border-green-100 shadow-green-50",
        blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-50",
        red: "bg-red-50 text-red-600 border-red-100 shadow-red-50",
    };

    return (
        <div 
            onClick={onClick}
            className={`
                bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-6 
                transition-all duration-300
                ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 active:scale-95' : ''}
                ${isActive ? 'ring-2 ring-red-500 ring-offset-2 border-red-200' : ''}
            `}
        >
            <div className={`p-4 rounded-3xl ${colors[color]} border shadow-lg`}>
                {React.cloneElement(icon, { className: "h-8 w-8 stroke-[1.5]" })}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function isExpired(dateStr: string | undefined) {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return expiry < now;
}

function isNearExpiry(dateStr: string | undefined) {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    thirtyDaysFromNow.setHours(0, 0, 0, 0);
    
    return expiry >= now && expiry <= thirtyDaysFromNow;
}

function isLowStock(quantity: number | '', threshold: number | undefined) {
    if (quantity === '' || threshold === undefined || threshold <= 0) return false;
    return quantity <= threshold;
}
