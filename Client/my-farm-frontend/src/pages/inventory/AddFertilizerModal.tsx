import React, { useEffect, useState } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category: string;
    initialData?: Fertilizer | null;
}

interface FormData {
    name: string;
    unit: string;
    supplier: string;
    quantity: number;
    receivedDate: string;
    productionDate: string;
    expiryDate: string;
}

export default function AddFertilizerModal({
    isOpen,
    onClose,
    onSuccess,
    category,
    initialData,
}: Props) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        unit: "kg",
        supplier: "",
        quantity: 0,
        receivedDate: "",
        productionDate: "",
        expiryDate: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                unit: initialData.unit || "kg",
                supplier: initialData.supplier || "",
                quantity: initialData.quantity || 0,
                receivedDate: initialData.receivedDate || "",
                productionDate: initialData.productionDate || "",
                expiryDate: initialData.expiryDate || "",
            });
        } else {
            setFormData({
                name: "",
                unit: "kg",
                supplier: "",
                quantity: 0,
                receivedDate: "",
                productionDate: "",
                expiryDate: "",
            });
        }
    }, [initialData]);

    if (!isOpen) return null;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (initialData) {
                await axios.put(`/inventory-items/batches/${initialData.id}`, {
                    ...formData,
                    category,
                });
            } else {
                await axios.post("/inventory-items/add", {
                    ...formData,
                    category,
                });
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu dữ liệu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">
                        {initialData ? "Sửa" : "Thêm"} {category === "Fertilizer" ? "Phân bón" : "Thuốc"}
                    </h2>
                    <button onClick={onClose}>
                        <XMarkIcon className="h-6 text-gray-500" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <input
                        required
                        placeholder="Tên"
                        className="w-full border p-3 rounded-xl"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />

                    <input
                        placeholder="Đơn vị"
                        className="w-full border p-3 rounded-xl"
                        value={formData.unit}
                        onChange={(e) =>
                            setFormData({ ...formData, unit: e.target.value })
                        }
                    />

                    <input
                        placeholder="Nhà cung cấp"
                        className="w-full border p-3 rounded-xl"
                        value={formData.supplier}
                        onChange={(e) =>
                            setFormData({ ...formData, supplier: e.target.value })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Số lượng"
                        className="w-full border p-3 rounded-xl"
                        value={formData.quantity}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                quantity: Number(e.target.value),
                            })
                        }
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            className="border p-3 rounded-xl"
                            value={formData.receivedDate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    receivedDate: e.target.value,
                                })
                            }
                        />

                        <input
                            type="date"
                            className="border p-3 rounded-xl"
                            value={formData.productionDate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    productionDate: e.target.value,
                                })
                            }
                        />

                        <input
                            type="date"
                            className="col-span-2 border p-3 rounded-xl"
                            value={formData.expiryDate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    expiryDate: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 py-3 rounded-xl"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white py-3 rounded-xl"
                        >
                            {loading ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}