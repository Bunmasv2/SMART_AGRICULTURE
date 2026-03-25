import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, type GridApi } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { PlusIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { TrashIcon, LeafIcon, ClockIcon, ListTreeIcon } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface GrowthProcessRow {
    processId: number;
    processName: string;
    cropName: string;
    variety: string;
    totalDays: number;
    stageCount?: number;
}

interface CropBase {
    cropId: number;
    cropName: string;
    variety: string;
}

/* ── Add Modal ──────────────────────────────────────────────── */
function AddProcessModal({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [crops, setCrops] = useState<CropBase[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ processName: '', cropId: '', totalDays: '' });

    useEffect(() => {
        if (!isOpen) return;
        axios.get('http://localhost:8080/api/crops')
            .then(r => setCrops(r.data.data))
            .catch(console.error);
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8080/api/growth-processes', {
                processName: form.processName,
                cropId: Number(form.cropId),
                totalDays: Number(form.totalDays),
            });
            onSuccess();
            onClose();
            setForm({ processName: '', cropId: '', totalDays: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tạo quy trình mới</h2>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Định nghĩa chu trình sinh trưởng</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <XMarkIcon className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tên quy trình</label>
                        <input
                            required
                            type="text"
                            placeholder="VD: Quy trình trồng lúa vụ Đông..."
                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={form.processName}
                            onChange={e => setForm({ ...form, processName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Loại cây trồng</label>
                        <select
                            required
                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
                            value={form.cropId}
                            onChange={e => setForm({ ...form, cropId: e.target.value })}
                        >
                            <option value="">Chọn loại cây...</option>
                            {crops.map(c => (
                                <option key={c.cropId} value={c.cropId}>{c.cropName} — {c.variety}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tổng số ngày</label>
                        <input
                            required
                            type="number"
                            min={1}
                            placeholder="VD: 120"
                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={form.totalDays}
                            onChange={e => setForm({ ...form, totalDays: e.target.value })}
                        />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function GrowthProcessList() {
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    const [processes, setProcesses] = useState<GrowthProcessRow[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchProcesses = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/growth-processes');
            setProcesses(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/growth-processes');
                setProcesses(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProcesses()
    }, []);

    const handleDelete = async () => {
        if (!gridApi) return;
        const selectedNodes = gridApi.getSelectedNodes();
        const ids = selectedNodes.map(n => n.data.processId);
        if (ids.length === 0) return;

        if (!window.confirm(`Xác nhận xóa ${ids.length} quy trình đã chọn?`)) return;

        try {
            await axios.delete('http://localhost:8080/api/growth-processes/bulk-delete', { data: ids });
            setProcesses(prev => prev.filter(p => !ids.includes(p.processId)));
            gridApi.applyTransaction({ remove: selectedNodes.map(n => n.data) });
            setSelectedCount(0);
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi xóa, vui lòng thử lại!');
        }
    };

    const columnDefs = [
        {
            field: 'processId',
            headerName: 'ID',
            width: 80,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellClass: 'font-mono text-slate-400 text-xs',
        },
        {
            field: 'processName',
            headerName: 'Tên quy trình',
            flex: 2,
            filter: true,
            cellRenderer: (p: { value: string }) => (
                <span className="font-bold text-slate-700">{p.value}</span>
            ),
        },
        {
            field: 'cropName',
            headerName: 'Loại cây',
            flex: 1,
            cellRenderer: (p: { value: string }) => (
                <span className="flex items-center gap-1.5">
                    <LeafIcon className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-slate-600 text-sm">{p.value}</span>
                </span>
            ),
        },
        { field: 'variety', headerName: 'Giống', flex: 1 },
        {
            field: 'totalDays',
            headerName: 'Tổng ngày',
            width: 130,
            sortable: true,
            cellRenderer: (p: { value: number }) => (
                <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5 text-blue-400" />
                    <span className="font-bold text-slate-700">{p.value}</span>
                    <span className="text-slate-400 text-xs">ngày</span>
                </span>
            ),
        },
        {
            field: 'stageCount',
            headerName: 'Số giai đoạn',
            width: 130,
            cellRenderer: (p: { value?: number }) => (
                <span className="flex items-center gap-1.5">
                    <ListTreeIcon className="h-3.5 w-3.5 text-violet-400" />
                    <span className="font-bold text-slate-700">{p.value ?? '—'}</span>
                </span>
            ),
        },
        {
            headerName: '',
            width: 60,
            sortable: false,
            filter: false,
            cellRenderer: () => (
                <span className="flex items-center justify-center h-full">
                    <ChevronRightIcon className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Toolbar */}
            <div className="flex-none px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <LeafIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-[13px] font-black text-slate-800 uppercase tracking-tight leading-none">
                            Quy trình sinh trưởng
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                            Quản lý toàn bộ quy trình canh tác
                        </p>
                    </div>
                    {selectedCount > 0 && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold">
                            Đang chọn {selectedCount} dòng
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={selectedCount === 0}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm
                            ${selectedCount > 0
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-100 active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                    >
                        <TrashIcon className="h-4 w-4 stroke-[2.5px]" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">Xóa quy trình</span>
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-100 flex items-center gap-2 active:scale-95"
                    >
                        <PlusIcon className="h-4 w-4 stroke-[3px]" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">Tạo quy trình</span>
                    </button>
                </div>
            </div>

            {/* Hint */}
            <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 italic">
                    Double click vào hàng để xem chi tiết & quản lý các giai đoạn
                </span>
            </div>

            {/* Grid */}
            <div className="flex-1 min-h-0 ag-theme-alpine">
                <AgGridReact
                    rowData={processes}
                    columnDefs={columnDefs as never}
                    rowSelection="multiple"
                    suppressRowClickSelection={false}
                    onGridReady={p => setGridApi(p.api)}
                    onSelectionChanged={e => setSelectedCount(e.api.getSelectedRows().length)}
                    defaultColDef={{
                        sortable: true,
                        resizable: true,
                        filter: true,
                        headerClass: 'bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold',
                    }}
                    headerHeight={48}
                    rowHeight={52}
                    animateRows
                    pagination
                    paginationPageSize={20}
                    rowClass="group cursor-pointer"
                    onRowDoubleClicked={e => navigate(`/processes/${e.data?.processId}`)}
                />
            </div>

            <AddProcessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProcesses}
            />

            <style>{`
                .ag-theme-alpine {
                    --ag-border-color: #f1f5f9;
                    --ag-header-background-color: #f8fafc;
                    width: 100%; height: 100%;
                }
                .ag-root-wrapper { border: none !important; }
            `}</style>
        </div>
    );
}
