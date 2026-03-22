import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { PresentationChartBarIcon, TableCellsIcon, PlusIcon } from '@heroicons/react/24/outline';

import BatchDetail from './BatchDetail';
import { ChartPieIcon } from 'lucide-react';

const MOCK_BATCHES = [
    { p_batch_id: 1, batch_name: "Lô C1-2026", crop_name: "Chanh Không Hạt", variety: "Giống California", area_m2: 500, start_date: "2026-01-10", status: "ACTIVE" },
    { p_batch_id: 2, batch_name: "Lô C2-2026", crop_name: "Chanh Bông Tím", variety: "Giống địa phương", area_m2: 350, start_date: "2025-12-15", status: "WARNING" },
    { p_batch_id: 3, batch_name: "Lô T5-2025", crop_name: "Chanh Giấy", variety: "Giống F1", area_m2: 420, start_date: "2025-11-20", status: "HARVESTING" },
    { p_batch_id: 4, batch_name: "Lô C3-2026", crop_name: "Chanh Không Hạt", variety: "Giống California", area_m2: 600, start_date: "2026-02-01", status: "COMPLETED" },
];

const COLORS: Record<string, string> = {
    ACTIVE: '#10b981',
    WARNING: '#f59e0b',
    HARVESTING: '#3b82f6',
    COMPLETED: '#94a3b8',
};

export default function BatchList() {
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

    const statusData = useMemo(() => {
        const counts = MOCK_BATCHES.reduce((acc: Record<string, number>, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
    }, []);

    const columnDefs = [
        { field: 'p_batch_id', headerName: 'ID', width: 80 },
        { field: 'batch_name', headerName: 'Tên Lô', flex: 1, filter: true },
        { field: 'crop_name', headerName: 'Loại Cây', flex: 1 },
        { field: 'variety', headerName: 'Giống', flex: 1 },
        { field: 'area_m2', headerName: 'Diện tích (m²)', width: 130, sortable: true },
        { field: 'start_date', headerName: 'Ngày bắt đầu', width: 150 },
        {
            field: 'status', headerName: 'Trạng thái', width: 150,
            cellRenderer: (p: { value: string }) => (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border"
                    style={{ backgroundColor: `${COLORS[p.value]}15`, color: COLORS[p.value], borderColor: `${COLORS[p.value]}30` }}>
                    {p.value}
                </span>
            )
        },
    ];

    if (selectedBatchId !== null) {
        return <BatchDetail batchId={selectedBatchId} onBack={() => setSelectedBatchId(null)} />;
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white z-10">
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">QUẢN LÝ LÔ TRỒNG</h1>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Hệ thống giám sát nông nghiệp</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-100 flex items-center gap-2 active:scale-95 text-sm">
                    <PlusIcon className="h-4 w-4 stroke-[3px]" /> Tạo Lô Mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
                <div className="p-6 h-64 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <ChartPieIcon className="h-4 w-4 text-emerald-600" />
                        <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Trạng thái vận hành</h3>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value">
                                    {statusData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name]} stroke="none" />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 h-64 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <PresentationChartBarIcon className="h-4 w-4 text-blue-600" />
                        <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Quy mô diện tích (m²)</h3>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_BATCHES}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="batch_name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="area_m2" fill="#059669" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                        <TableCellsIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Dữ liệu chi tiết lô canh tác</span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic">Nhấp đúp chuột để mở chi tiết</span>
                </div>

                <div className="ag-theme-alpine w-full h-full flex-1 border-none overflow-hidden">
                    <AgGridReact
                        rowData={MOCK_BATCHES}
                        columnDefs={columnDefs as never}
                        defaultColDef={{
                            sortable: true,
                            resizable: true,
                            filter: true,
                            headerClass: 'bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold'
                        }}
                        headerHeight={48}
                        rowHeight={52}
                        animateRows={true}
                        pagination={true}
                        paginationPageSize={20}
                        onRowClicked={(e) => setSelectedBatchId(e.data ? e.data.p_batch_id : 1)}
                    />
                </div>
            </div>

            <style>{`
                .ag-theme-alpine {
                    --ag-border-color: #f1f5f9;
                    --ag-header-background-color: #f8fafc;
                    --ag-border-radius: 0px;
                }
                .ag-root-wrapper { border: none !important; }
            `}</style>
        </div>
    );
}