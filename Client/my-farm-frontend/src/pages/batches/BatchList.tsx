import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, type GridApi } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { TableCellsIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import type { Batch } from '../../models/Batch';
import PieCharBatch from '../../components/charts/PieCharBatch';
import ComposedChartBatch from '../../components/charts/ComposedChartBatch';
import { TrashIcon } from 'lucide-react';
import AddBatchModal from '../../components/modals/AddBatchModal';
import { useNavigate } from 'react-router-dom';

const COLORS: Record<string, string> = {
    ACTIVE: '#10b981',
    WARNING: '#f59e0b',
    HARVESTING: '#3b82f6',
    COMPLETED: '#94a3b8',
};

export default function BatchList() {
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [batches, setBatches] = useState<Batch[] | null>()
    const columnDefs = [
        {
            field: 'pBatchId',
            headerName: 'ID',
            width: 80,
            filter: false,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellClass: 'font-mono text-slate-400'
        },
        { field: 'batchName', headerName: 'Tên Lô', flex: 1, filter: true },
        { field: 'processName', headerName: 'Quy trình', flex: 1 },
        { field: 'cropName', headerName: 'Loại Cây', flex: 1 },
        { field: 'variety', headerName: 'Giống', flex: 1 },
        { field: 'areaM2', headerName: 'Diện tích (m²)', width: 130, sortable: true },
        { field: 'startDate', headerName: 'Ngày bắt đầu', width: 150 },
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/planting-batches`)
                setBatches(response.data.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchBatches()
    }, [])
    console.log(batches)

    const handleDelete = async () => {
        if (!gridApi || !batches) return;

        const selectedNodes = gridApi.getSelectedNodes();
        const selectedIds = selectedNodes.map(node => node.data.pBatchId);

        if (selectedIds.length === 0) return;

        if (window.confirm(`Anh có chắc chắn muốn xóa ${selectedIds.length} lô đã chọn không?`)) {
            try {
                await axios.delete('http://localhost:8080/api/planting-batches/bulk-delete', {
                    data: selectedIds,
                    headers: {
                        'X-Role-Id': user.roleId
                    }
                });

                const updatedBatches = batches.filter(
                    batch => !selectedIds.includes(batch.pBatchId)
                );
                setBatches(updatedBatches);

                gridApi.applyTransaction({ remove: selectedNodes.map(n => n.data) });

                setSelectedCount(0);
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("Dạ, có lỗi xảy ra khi xóa trên server, anh kiểm tra lại kết nối nhé!");
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-4 border-b border-slate-100 bg-slate-50/50 p-4">
                {batches && (
                    <>
                        <PieCharBatch batches={batches} />
                        <ComposedChartBatch batches={batches} />
                    </>
                )}
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <TableCellsIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-[11px] text-sm font-bold text-slate-500 uppercase tracking-tighter">
                                Dữ liệu chi tiết lô canh tác
                            </span>

                            <span className="text-[10px] text-xs text-slate-400 italic">
                                (Double click để xem chi tiết)
                            </span>
                        </div>

                        {selectedCount > 0 && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">
                                Đang chọn {selectedCount} dòng
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {user.roleId <= 2 && (
                            <>
                                <button
                                    onClick={handleDelete}
                                    disabled={selectedCount === 0}
                                    className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 text-sm
                                        ${selectedCount > 0
                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-100 active:scale-95'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}
                                    `}
                                >
                                    <TrashIcon className="h-4 w-4 stroke-[2.5px]" />
                                    <span className="text-[11px] font-bold uppercase tracking-tighter">Xóa lô</span>
                                </button>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-100 flex items-center gap-2 active:scale-95 text-sm"
                                >
                                    <PlusIcon className="h-4 w-4 stroke-[3px]" />
                                    <span className="text-[11px] font-bold uppercase tracking-tighter">Tạo lô mới</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="ag-theme-alpine w-full h-full flex-1 border-none overflow-hidden">
                    <AgGridReact
                        rowData={batches}
                        rowSelection="multiple"
                        onGridReady={(params) => setGridApi(params.api)}
                        onSelectionChanged={(event) => {
                            setSelectedCount(event.api.getSelectedRows().length);
                        }}
                        suppressRowClickSelection={false}

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
                        onRowDoubleClicked={(e) => navigate(`/batches/${e.data?.pBatchId}`)}
                    />
                </div>
            </div>

            <AddBatchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Gọi lại hàm fetch danh sách lô để cập nhật bảng sau khi thêm thành công
                    // fetchBatches();
                }}
            />

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