import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, type GridApi } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import { TableCellsIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { TrashIcon } from 'lucide-react';
import type { CropBase } from '../../models/Crop';
import AddCropModal from '../../components/modals/AddCropModal';
import EditCropModal from '../../components/modals/EditCropModal';

export default function CropList() {
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    const [crops, setCrops] = useState<CropBase[] | null>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCrop, setEditingCrop] = useState<CropBase | null>(null);

    const columnDefs = [
        {
            field: 'cropId',
            headerName: 'ID',
            width: 80,
            filter: true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellClass: 'font-mono text-slate-400'
        },
        { field: 'cropName', headerName: 'Tên giống cây', flex: 1, filter: true },
        { field: 'variety', headerName: 'Phân loại', flex: 1, filter: true },
        { field: 'description', headerName: 'Mô tả', flex: 2 },
        { field: 'highTempThreshold', headerName: 'Nhiệt độ tối đa (°C)', width: 140, filter: 'agNumberColumnFilter' },
        { field: 'lowTempThreshold', headerName: 'Nhiệt độ tối thiểu (°C)', width: 140, filter: 'agNumberColumnFilter' },
        { field: 'rainProbabilityThreshold', headerName: 'Khả năng mưa (%)', width: 160, filter: 'agNumberColumnFilter' }
    ];

    const fetchCrops = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/crops`);
            setCrops(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCrops();
    }, []);

    const handleDelete = async () => {
        if (!gridApi || !crops) return;

        const selectedNodes = gridApi.getSelectedNodes();
        const selectedIds = selectedNodes.map(node => node.data.cropId);

        if (selectedIds.length === 0) return;

        if (window.confirm(`Anh có chắc chắn muốn xóa ${selectedIds.length} cây đã chọn không?`)) {
            try {
                // Giả lập hoặc gọi thật dựa trên backend API delete crop (Nếu không có bulk delete, dùng Promise.all)
                await Promise.all(selectedIds.map(id => axios.delete(`http://localhost:8080/api/crops/${id}`)));

                const updatedCrops = crops.filter(
                    crop => !selectedIds.includes(crop.cropId)
                );
                setCrops(updatedCrops);
                gridApi.applyTransaction({ remove: selectedNodes.map(n => n.data) });
                setSelectedCount(0);
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("Dạ, có lỗi xảy ra khi xóa trên server (có thể do ràng buộc khóa ngoại), anh kiểm tra lại kết nối nhé!");
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f8faf7]">
            <div className="flex-1 flex flex-col min-h-0 bg-white m-4 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <TableCellsIcon className="h-5 w-5 text-emerald-600" />
                                <span className="text-base font-black text-slate-800 uppercase tracking-tight">
                                    Quản lý Danh mục Cây trồng
                                </span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium ml-7 mt-0.5">
                                Danh sách các loại cây và cấu hình cảnh báo nhiệt độ
                            </span>
                        </div>

                        {selectedCount > 0 && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-widest ml-4">
                                Đã chọn {selectedCount} dòng
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={selectedCount === 0}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-[11px] uppercase tracking-widest
                                ${selectedCount > 0
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600  active:scale-95'
                                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'}
                            `}
                        >
                            <TrashIcon className="h-4 w-4 stroke-[2.5px]" />
                            <span>Xóa mục</span>
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#2c9b4e] hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-green-200 flex items-center gap-2 active:scale-95 text-[11px] uppercase tracking-widest"
                        >
                            <PlusIcon className="h-4 w-4 stroke-[3px]" />
                            <span>Thêm giống cây</span>
                        </button>
                    </div>
                </div>

                <div className="ag-theme-alpine w-full h-full flex-1 border-none bg-white">
                    <AgGridReact
                        rowData={crops}
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
                            headerClass: 'bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-none'
                        }}
                        rowStyle={{ borderBottom: '1px solid #f1f5f9' }}
                        headerHeight={52}
                        rowHeight={56}
                        animateRows={true}
                        pagination={true}
                        paginationPageSize={20}
                        onRowDoubleClicked={(e) => {
                            if (e.data) {
                                setEditingCrop(e.data);
                            }
                        }}
                    />
                </div>
            </div>

            <AddCropModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchCrops();
                }}
            />

            <EditCropModal
                isOpen={!!editingCrop}
                crop={editingCrop}
                onClose={() => setEditingCrop(null)}
                onSuccess={() => {
                    fetchCrops();
                }}
            />

            <style>{`
                .ag-theme-alpine {
                    --ag-border-color: #f1f5f9;
                    --ag-header-background-color: #f8fafc;
                    --ag-border-radius: 0px;
                    --ag-row-hover-color: #f0fdf4;
                    font-family: inherit;
                }
                .ag-root-wrapper { border: none !important; }
                .ag-header { border-bottom: 2px solid #f1f5f9 !important; }
                .ag-cell { display: flex; align-items: center; color: #475569; font-size: 13px; font-weight: 500; }
                .ag-checkbox-input-wrapper.ag-checked::after { color: #059669 !important; }
            `}</style>
        </div>
    );
}
