import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Fertilizer {
    id: number;
    itemId: number;
    name: string;
    unit: string;
    supplier: string;
    quantity: number;
    receivedDate: string;
    productionDate: string;
    expiryDate: string;
}

interface ContractRequest {
    itemId: number;
    supplier: string;
    contractContent: string;
    signature: string;
}

interface Props {
    item: Fertilizer;
    onClose: () => void;
}

export default function ContractModal({ item, onClose }: Props) {
    const sigRef = useRef<SignatureCanvas | null>(null);
    const [loading, setLoading] = useState(false);
    const [signatureImage, setSignatureImage] = useState<string | null>(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    // Nội dung hợp đồng đầy đủ hơn
    const contractContent = `
        HỢP ĐỒNG CUNG CẤP VẬT TƯ NÔNG NGHIỆP
        Số: ${new Date().getTime()}/HĐ-NN
        
        1. THÔNG TIN BÊN GIAO: ${item.supplier}
        2. THÔNG TIN BÊN NHẬN: Nông trại XYZ
        3. THÔNG TIN SẢN PHẨM:
           - Tên: ${item.name}
           - Số lượng: ${item.quantity} ${item.unit}
           - Ngày nhập: ${item.receivedDate}
           - Hạn sử dụng: ${item.expiryDate}
        
        4. ĐIỀU KHOẢN CHUNG:
           - Bên cung cấp cam kết hàng đúng chất lượng, nguồn gốc rõ ràng.
           - Bên nhận kiểm tra số lượng và quy cách khi nhận hàng.
           - Mọi tranh chấp sẽ được giải quyết dựa trên quy định của pháp luật hiện hành.
    `;

    const handleSubmit = async () => {
        if (!sigRef.current || sigRef.current.isEmpty()) {
            alert("Vui lòng ký xác nhận trước khi lưu!");
            return;
        }

        const signature = sigRef.current.toDataURL();
        const payload: ContractRequest = {
            itemId: item.itemId || item.id,
            supplier: item.supplier,
            contractContent,
            signature,
        };

        try {
            setLoading(true);
            await axios.post("/contracts", payload);
            alert("Đã lưu hợp đồng thành công!");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu hợp đồng!");
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = async () => {
        if (!signatureImage) {
            alert("Vui lòng ký trước khi xuất PDF!");
            return;
        }

        const element = document.getElementById("contract-to-print");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            const img = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(img, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`Hop_Dong_${item.id}.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
        }
    };

    const clearSignature = () => {
        sigRef.current?.clear();
        setSignatureImage(null);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl h-[95vh] shadow-2xl flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-slate-800">📜 Soạn thảo Hợp đồng</h2>
                    <button onClick={onClose} className="text-3xl leading-none text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-100">

                    {/* KHU VỰC HIỂN THỊ HỢP ĐỒNG ĐỂ IN */}
                    <div
                        id="contract-to-print"
                        className="bg-white shadow-sm mx-auto p-12 text-slate-900"
                        style={{
                            width: "210mm",
                            minHeight: "297mm",
                            fontFamily: "'Times New Roman', serif",
                            lineHeight: "1.6",
                            fontSize: "13pt"
                        }}
                    >
                        <div className="text-center">
                            <h2 className="font-bold uppercase mb-0">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                            <p className="font-bold mb-0 text-lg">Độc lập - Tự do - Hạnh phúc</p>
                            <div className="w-48 h-[1px] bg-black mx-auto mt-2 mb-8"></div>
                        </div>

                        <h3 className="text-center font-bold text-2xl mb-10 uppercase">HỢP ĐỒNG CUNG CẤP PHÂN BÓN</h3>

                        <div className="space-y-4">
                            <p><strong>Bên A (Nhà cung cấp):</strong> {item.supplier}</p>
                            <p><strong>Bên B (Bên nhận):</strong> Nông trại XYZ (Hệ thống Quản lý)</p>

                            <p className="font-bold underline mt-4 italic">Điều 1: Nội dung hàng hóa</p>
                            <ul className="list-disc pl-8">
                                <li>Tên vật tư: {item.name}</li>
                                <li>Số lượng: {item.quantity} {item.unit}</li>
                                <li>Ngày bàn giao: {item.receivedDate}</li>
                                <li>Hạn sử dụng: {item.expiryDate}</li>
                            </ul>

                            <p className="font-bold underline mt-4 italic">Điều 2: Cam kết chất lượng</p>
                            <p>Bên A cam kết cung cấp sản phẩm đúng tiêu chuẩn ngành nông nghiệp, còn nguyên bao bì và thời hạn sử dụng. Bên B có quyền từ chối nhận hàng nếu phát hiện hư hỏng.</p>

                            <p className="font-bold underline mt-4 italic">Điều 3: Thanh toán</p>
                            <p>Giá trị hợp đồng được căn cứ trên đơn giá thỏa thuận tại thời điểm nhập hàng. Thanh toán bằng tiền mặt hoặc chuyển khoản ngay sau khi ký biên bản giao nhận.</p>
                        </div>

                        {/* SIGNATURE SECTION - Tối ưu hóa để không bị lệch */}
                        <div className="mt-16 w-full">
                            <table className="w-full text-center border-none">
                                <tbody>
                                    <tr>
                                        <td className="w-1/2 align-top pt-4">
                                            <p className="font-bold uppercase">Đại diện Bên A</p>
                                            <p className="text-sm italic mb-10">(Ký và ghi rõ họ tên)</p>
                                            <div className="h-24"></div>
                                            {/* <p className="font-bold mt-4">{item.supplier}</p> */}
                                        </td>
                                        <td className="w-1/2 align-top pt-4">
                                            <p className="font-bold uppercase">Đại diện Bên B</p>
                                            <p className="text-sm italic mb-2">(Ký và ghi rõ họ tên)</p>

                                            <div className="h-24 flex items-center justify-center border border-dashed border-transparent">
                                                {signatureImage && (
                                                    <img
                                                        src={signatureImage}
                                                        alt="signature"
                                                        className="max-h-24 object-contain"
                                                    />
                                                )}
                                            </div>
                                            {/* <p className="font-bold mt-4 text-blue-800">Quản lý kho: Đạt</p> */}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* KHU VỰC KÝ (Chỉ dùng để tương tác, không in vào PDF) */}
                    <div className="max-w-[210mm] mx-auto bg-white p-6 rounded-xl border-2 border-green-200">
                        <div className="flex justify-between items-center mb-3">
                            <label className="font-bold text-green-700 flex items-center gap-2">
                                <span className="text-xl">🖋️</span> Mời bạn ký vào khung dưới đây:
                            </label>
                            <button
                                onClick={clearSignature}
                                className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                            >
                                Xóa chữ ký làm lại
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-lg overflow-hidden border-2 border-slate-200">
                            <SignatureCanvas
                                ref={sigRef}
                                penColor="blue"
                                onEnd={() => {
                                    const dataUrl = sigRef.current?.toDataURL();
                                    setSignatureImage(dataUrl || null);
                                }}
                                canvasProps={{
                                    className: "w-full h-40 cursor-crosshair",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-6 border-t flex justify-end gap-4 bg-white">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Đóng
                    </button>

                    <button
                        onClick={exportPDF}
                        className="px-6 py-2.5 font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all flex items-center gap-2"
                    >
                        <span>📥</span> Xuất PDF
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 disabled:bg-gray-400 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            "Đang xử lý..."
                        ) : (
                            <>
                                <span>✅</span> Xác nhận & Lưu
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}