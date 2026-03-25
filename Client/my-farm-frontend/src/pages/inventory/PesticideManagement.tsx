import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellStyle } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import AddFertilizerModal from "./AddFertilizerModal";

import {
    MagnifyingGlassIcon,
    ArchiveBoxIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Fertilizer {
    id: number;
    name: string;
    unit: string;
    supplier: string;
    quantity: number;
    receivedDate: string;
    productionDate: string;
    expiryDate: string;
}

export default function PesticideManagement() {
    const [data, setData] = useState<Fertilizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Fertilizer | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get("/inventory-items/pesticides");
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa?")) return;

        try {
            await axios.delete(`/inventory-items/batches/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item: Fertilizer) => {
        setEditing(item);
        setOpen(true);
    };

    const getStatus = (date: string) => {
        if (!date) return "normal";
        const today = new Date();
        const exp = new Date(date);
        const diff = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);

        if (diff < 0) return "expired";
        if (diff <= 7) return "warning";
        return "normal";
    };

    const filtered = data.filter(
        (f) =>
            f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.supplier || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columnDefs: ColDef<Fertilizer>[] = [
        {
            headerName: "STT",
            valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
            width: 80,
            sortable: true,
        },
        {
            headerName: "Tên phân",
            field: "name",
            flex: 1.5,
            sortable: true,
            cellStyle: { fontWeight: "600" },
        },
        {
            headerName: "Nhà cung cấp",
            field: "supplier",
            flex: 1,
            sortable: true,
        },
        {
            headerName: "Số lượng",
            field: "quantity",
            width: 130,
            sortable: true,
            cellStyle: (params): CellStyle => ({
                color: params.value < 50 ? "#f97316" : "#16a34a",
                fontWeight: "bold",
            }),
        },
        {
            headerName: "Ngày nhập",
            field: "receivedDate",
            width: 140,
            sortable: true,
        },
        {
            headerName: "NSX",
            field: "productionDate",
            width: 140,
            sortable: true,
        },
        {
            headerName: "Hạn sử dụng",
            field: "expiryDate",
            width: 150,
            sortable: true,
            cellStyle: (params): CellStyle => {
                const status = getStatus(params.value);

                if (status === "expired") {
                    return { color: "red", fontWeight: "bold" };
                }
                if (status === "warning") {
                    return { color: "#facc15", fontWeight: "bold" };
                }
                return {};
            },
        },
        {
            headerName: "Hành động",
            field: "id",
            width: 140,
            cellRenderer: (params: { data: Fertilizer }) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleEdit(params.data)}
                        className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => handleDelete(params.data.id)}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8faf7] p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-4xl font-black text-slate-800">
                        🌿 Quản lý <span className="text-green-600">Phân Bón</span>
                    </h1>
                    <p className="text-slate-500">
                        Theo dõi tồn kho và hạn sử dụng
                    </p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-6">
                    <StatCard
                        title="Tổng loại"
                        value={new Set(data.map((x) => x.name)).size.toString()}
                        icon={<ArchiveBoxIcon />}
                    />
                    <StatCard
                        title="Tổng số lượng"
                        value={`${data.reduce((a, b) => a + (b.quantity || 0), 0)} kg`}
                        icon={<ArchiveBoxIcon />}
                    />
                    <StatCard
                        title="Sắp hết hạn"
                        value={
                            data.filter((x) => getStatus(x.expiryDate) === "warning")
                                .length.toString()
                        }
                        icon={<CalendarDaysIcon />}
                    />
                </div>

                {/* SEARCH */}
                <div className="relative w-96 inline-flex gap-2">
                    <MagnifyingGlassIcon className="h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        className="pl-10 pr-4 py-3 w-full bg-white rounded-xl border"
                        placeholder="Tìm kiếm..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button
                        onClick={() => {
                            setEditing(null); // reset edit
                            setOpen(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl"
                    >
                        Thêm
                    </button>

                    <AddFertilizerModal
                        isOpen={open}
                        onClose={() => {
                            setOpen(false);
                            setEditing(null);
                        }}
                        onSuccess={fetchData}
                        category="Pesticide"
                        initialData={editing}
                    />
                </div>

                {/* GRID */}
                <div className="ag-theme-alpine rounded-2xl overflow-hidden shadow" style={{ height: 500 }}>
                    <AgGridReact<Fertilizer>
                        rowData={filtered}
                        columnDefs={columnDefs}
                        pagination
                        animateRows
                        rowHeight={50}
                        theme="legacy"
                    />
                </div>

                {loading && (
                    <p className="text-center text-gray-400">Đang tải dữ liệu...</p>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactElement<{ className?: string }>;
}