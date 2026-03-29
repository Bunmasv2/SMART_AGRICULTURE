import type { DiseaseDetail } from '../models/Disease';

export const DISEASE_DICTIONARY: Record<string, DiseaseDetail> = {
  Anthracnose: {
    id: 'Anthracnose',
    nameVN: 'Bệnh thán thư',
    leafCondition: 'Lá xuất hiện đốm nâu lõm, viền đốm sẫm màu và lan rộng nhanh trong điều kiện ẩm.',
    soilCondition: 'Đất thoát nước kém, ẩm độ cao kéo dài làm tăng áp lực nấm bệnh trong vườn.',
    symptoms:
      'Trên phiến lá hình thành các đốm tròn đến bất định màu nâu đen, mô lá lõm nhẹ; khi nặng có thể gây cháy lá cục bộ, rụng lá non và giảm khả năng quang hợp.',
    causes:
      'Tác nhân chính là nấm Colletotrichum spp., phát triển mạnh khi mưa nhiều, tán cây rậm và thông thoáng kém.',
    management: {
      cultural:
        'Tỉa cành tạo tán thông thoáng, thu gom lá bệnh đem tiêu hủy, vệ sinh dụng cụ cắt tỉa và hạn chế tưới phun làm ướt tán vào chiều muộn.',
      chemical:
        'Ưu tiên phun thuốc gốc đồng theo nguyên tắc 4 đúng, luân phiên hoạt chất để hạn chế hiện tượng kháng thuốc và tăng hiệu quả phòng trừ.',
    },
  },
  'Bacterial Blight': {
    id: 'Bacterial Blight',
    nameVN: 'Bệnh bạc lá (cháy lá vi khuẩn)',
    leafCondition: 'Lá có vết sũng nước ban đầu, sau đó khô cháy từ mép hoặc chóp lá.',
    soilCondition: 'Đất quá ẩm, úng cục bộ hoặc hệ thống rãnh thoát nước kém làm bệnh bùng phát mạnh.',
    symptoms:
      'Vết bệnh lúc đầu màu xanh sẫm dạng ướt, nhanh chóng chuyển nâu; mô lá giòn và cháy khô, có thể liên kết thành mảng lớn làm suy giảm diện tích lá hữu hiệu.',
    causes:
      'Do vi khuẩn Xanthomonas spp. gây ra; lây lan qua nước mưa bắn, gió mạnh, dụng cụ canh tác và vết thương cơ giới trên lá.',
    management: {
      cultural:
        'Cải thiện thoát nước, tránh tưới quá ẩm, giảm mật độ tán lá, không thao tác khi lá còn ướt và loại bỏ tàn dư nhiễm bệnh trong ruộng.',
      chemical:
        'Sử dụng kháng sinh nông nghiệp và chế phẩm được phép theo khuyến cáo địa phương; phối hợp chất hỗ trợ bám dính để tăng hiệu lực trên bề mặt lá.',
    },
  },
  'Citrus Canker': {
    id: 'Citrus Canker',
    nameVN: 'Bệnh loét',
    leafCondition: 'Vết loét nhô cao, sần sùi như sùi bọt, xung quanh có quầng vàng đặc trưng.',
    soilCondition: 'Đất mất cân đối dinh dưỡng, đặc biệt bón thừa đạm, làm mô non mẫn cảm hơn với tác nhân gây bệnh.',
    symptoms:
      'Các nốt loét tròn, bề mặt thô ráp xuất hiện ở cả hai mặt lá; khi nặng gây vàng lá, rụng lá non và giảm sức sinh trưởng của cây.',
    causes:
      'Do vi khuẩn Xanthomonas citri xâm nhiễm qua khí khổng và vết thương, lan truyền mạnh trong điều kiện mưa gió và mật độ tán dày.',
    management: {
      cultural:
        'Cắt bỏ cành, lá nhiễm nặng; vệ sinh vườn thường xuyên; tránh bón thừa đạm (N) và tăng cường cân đối dinh dưỡng để nâng sức chống chịu.',
      chemical:
        'Áp dụng thuốc bảo vệ thực vật phù hợp đối tượng vi khuẩn theo hướng dẫn kỹ thuật và luân phiên nhóm hoạt chất để duy trì hiệu quả.',
    },
  },
  'Curl Virus': {
    id: 'Curl Virus',
    nameVN: 'Bệnh xoăn lá do virus',
    leafCondition: 'Lá nhăn nheo, biến dạng, phiến lá co nhỏ và phát triển không đồng đều.',
    soilCondition: 'Đất dinh dưỡng mất cân đối làm cây suy yếu, tạo điều kiện triệu chứng virus biểu hiện rõ hơn.',
    symptoms:
      'Đọt non chùn lại, lá xoăn cụm, mặt lá gồ ghề; cây giảm tăng trưởng, khả năng ra lộc và nuôi trái suy giảm đáng kể khi nhiễm nặng.',
    causes:
      'Virus lây truyền chủ yếu qua côn trùng chích hút như rầy và rệp; có thể lan rộng nhanh nếu quần thể môi giới không được kiểm soát.',
    management: {
      cultural:
        'Nhổ bỏ và tiêu hủy cây bệnh nặng, quản lý cỏ dại ký chủ phụ, dùng cây giống sạch bệnh và duy trì dinh dưỡng cân đối để giảm stress cho cây.',
      chemical:
        'Phun thuốc kiểm soát rầy, rệp theo ngưỡng phòng trừ nhằm cắt nguồn lây virus, kết hợp dầu khoáng hoặc chế phẩm phù hợp để tăng hiệu quả.',
    },
  },
  'Deficiency Leaf': {
    id: 'Deficiency Leaf',
    nameVN: 'Lá thiếu dinh dưỡng',
    leafCondition: 'Lá vàng gân xanh hoặc vàng đều toàn phiến tùy nguyên tố thiếu hụt.',
    soilCondition: 'Đất bạc màu, nghèo hữu cơ, thiếu vi lượng (Mg, Fe) hoặc mất cân đối NPK kéo dài.',
    symptoms:
      'Màu lá nhạt dần, sinh trưởng chậm, lá mỏng và dễ rụng; một số trường hợp biểu hiện vàng giữa gân, cháy mép hoặc xuất hiện sắc tố bất thường.',
    causes:
      'Cây không được cung cấp đầy đủ dinh dưỡng thiết yếu do đất suy kiệt, pH bất lợi, bộ rễ hoạt động yếu hoặc quy trình bón phân chưa hợp lý.',
    management: {
      cultural:
        'Cải tạo đất bằng hữu cơ hoai mục, bổ sung vật liệu giữ ẩm, quản lý pH phù hợp và điều chỉnh lịch bón theo giai đoạn sinh trưởng của cây.',
      chemical:
        'Bón bổ sung NPK cân đối và vi lượng thiếu hụt; có thể kết hợp phân bón lá chứa Mg, Fe để phục hồi nhanh màu lá và hoạt động quang hợp.',
    },
  },
  'Dry Leaf': {
    id: 'Dry Leaf',
    nameVN: 'Lá khô (cháy nắng)',
    leafCondition: 'Mép lá khô xám, mô lá giòn, dễ nứt gãy khi thời tiết nắng nóng kéo dài.',
    soilCondition: 'Đất thiếu ẩm kéo dài, tầng canh tác khô cứng hoặc bộ rễ suy giảm khả năng hút nước.',
    symptoms:
      'Lá mất độ bóng, cuốn nhẹ hoặc quăn mép, xuất hiện vùng cháy khô từ rìa vào trong; cây giảm sức sống và dễ phát sinh rụng lá sinh lý.',
    causes:
      'Thiếu nước trầm trọng kết hợp nắng gắt, gió khô nóng hoặc rễ bị tổn thương do úng trước đó, tuyến trùng hay canh tác không phù hợp.',
    management: {
      cultural:
        'Tăng cường tưới đúng thời điểm, phủ gốc giữ ẩm bằng vật liệu hữu cơ, che nắng tạm thời cho cây non và phục hồi hệ rễ bằng chăm sóc đất hợp lý.',
      chemical:
        'Ưu tiên chế phẩm chống sốc và phân bón lá giàu kali, canxi theo khuyến cáo; hạn chế lạm dụng thuốc hóa học khi cây đang mất nước nặng.',
    },
  },
  'Healthy Leaf': {
    id: 'Healthy Leaf',
    nameVN: 'Lá khỏe mạnh',
    leafCondition: 'Lá xanh tốt, dày vừa phải, bề mặt bóng mượt, gân lá rõ và phân bố màu đồng đều.',
    soilCondition: 'Đất tơi xốp, giàu hữu cơ, thoát nước tốt nhưng vẫn giữ ẩm hợp lý, dinh dưỡng cân đối.',
    symptoms:
      'Không ghi nhận triệu chứng bệnh lý; tán lá phát triển đồng đều, khả năng quang hợp tốt và phản ánh trạng thái sinh trưởng ổn định của cây.',
    causes:
      'Cây được chăm sóc đúng quy trình: nước tưới, dinh dưỡng, vệ sinh đồng ruộng và quản lý dịch hại ở mức chủ động.',
    management: {
      cultural:
        'Tiếp tục duy trì quy trình chăm sóc hiện tại, theo dõi định kỳ để phát hiện sớm bất thường và giữ vườn luôn thông thoáng, sạch bệnh.',
      chemical:
        'Không cần can thiệp hóa học đặc hiệu khi lá khỏe; chỉ sử dụng chế phẩm phòng ngừa theo lịch hợp lý và đúng hướng dẫn kỹ thuật.',
    },
  },
  'Sooty Mould': {
    id: 'Sooty Mould',
    nameVN: 'Bệnh muội đen',
    leafCondition: 'Mặt lá phủ mảng đen như nhọ nồi, cản trở quang hợp và làm giảm độ bóng tự nhiên của lá.',
    soilCondition: 'Đất bón thừa đạm và tán cây rậm tạo vi khí hậu thuận lợi cho côn trùng chích hút phát triển.',
    symptoms:
      'Lớp nấm đen bám trên bề mặt lá, cành non hoặc quả; có thể lau bớt bằng tay nhưng tái xuất hiện nhanh nếu chưa xử lý nguồn mật ngọt do rệp tiết ra.',
    causes:
      'Nấm Capnodium spp. phát triển trên dịch tiết mật của rệp sáp, rệp mềm hoặc nhện; bản thân nấm muội đen thường là hệ quả của côn trùng gây hại.',
    management: {
      cultural:
        'Tỉa tán cho thông thoáng, rửa lá để giảm lớp muội đen, cắt bỏ bộ phận nhiễm nặng và quản lý cỏ dại, kiến môi giới trong vườn.',
      chemical:
        'Ưu tiên phun thuốc trị rệp sáp và nhóm côn trùng chích hút liên quan; kết hợp dầu khoáng hoặc chất bám dính để tăng hiệu quả làm sạch bề mặt lá.',
    },
  },
  'Spider Mites': {
    id: 'Spider Mites',
    nameVN: 'Nhện đỏ',
    leafCondition: 'Lá có nhiều chấm li ti vàng hoặc trắng, mất dần màu xanh; mặt dưới lá có tơ nhện mỏng.',
    soilCondition: 'Đất và không khí khô nóng kéo dài làm cây stress, tạo điều kiện quần thể nhện đỏ gia tăng nhanh.',
    symptoms:
      'Lá xỉn màu, lốm đốm bạc, giảm quang hợp; khi mật số cao có thể gây cháy lá, rụng lá sớm và ảnh hưởng rõ đến năng suất cây trồng.',
    causes:
      'Nhện đỏ chích hút dịch bào trên lá, phát triển mạnh trong điều kiện nhiệt độ cao, ẩm không khí thấp và ít mưa rửa trôi.',
    management: {
      cultural:
        'Phun nước áp lực phù hợp lên hai mặt lá để hạ mật số, duy trì ẩm độ vườn hợp lý, tỉa cành vệ sinh và theo dõi mật độ hại thường xuyên.',
      chemical:
        'Sử dụng thuốc đặc trị nhện theo nguyên tắc luân phiên hoạt chất, phun kỹ mặt dưới lá và tuân thủ thời gian cách ly theo quy định.',
    },
  },
};

const DISEASE_IMAGE_STORAGE_KEY = 'smart-agriculture:disease-images';
const HISTORY_IMAGE_STORAGE_KEY = 'smart-agriculture:history-images';
const COMPRESS_MAX_DIMENSION = 1280;
const COMPRESS_OUTPUT_QUALITY = 0.72;
const COMPRESS_OUTPUT_FORMAT = 'image/webp';

type DiseaseImageStorage = Record<string, string>;
type HistoryImageStorage = Record<string, string>;

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readDiseaseImageStorage(): DiseaseImageStorage {
  if (!canUseLocalStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(DISEASE_IMAGE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as DiseaseImageStorage;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function readHistoryImageStorage(): HistoryImageStorage {
  if (!canUseLocalStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_IMAGE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as HistoryImageStorage;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeDiseaseImageStorage(images: DiseaseImageStorage): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(DISEASE_IMAGE_STORAGE_KEY, JSON.stringify(images));
  } catch {
    // Bỏ qua nếu localStorage bị chặn hoặc đầy dung lượng.
  }
}

function writeHistoryImageStorage(images: HistoryImageStorage): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(HISTORY_IMAGE_STORAGE_KEY, JSON.stringify(images));
  } catch {
    // Bỏ qua nếu localStorage bị chặn hoặc đầy dung lượng.
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('Không thể chuyển ảnh sang định dạng hiển thị.'));
    };
    reader.onerror = () => {
      reject(new Error('Không thể đọc file ảnh đã upload.'));
    };
    reader.readAsDataURL(file);
  });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể tải ảnh để nén trước khi lưu.'));
    };

    image.src = objectUrl;
  });
}

function getResizeDimensions(width: number, height: number): { width: number; height: number } {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= COMPRESS_MAX_DIMENSION) {
    return { width, height };
  }

  const scale = COMPRESS_MAX_DIMENSION / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function resizeAndCompressImage(file: File): Promise<string> {
  if (typeof document === 'undefined') {
    return fileToDataUrl(file);
  }

  const image = await loadImageElement(file);
  const resized = getResizeDimensions(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = resized.width;
  canvas.height = resized.height;

  const context = canvas.getContext('2d');
  if (!context) {
    return fileToDataUrl(file);
  }

  context.drawImage(image, 0, 0, resized.width, resized.height);

  try {
    return canvas.toDataURL(COMPRESS_OUTPUT_FORMAT, COMPRESS_OUTPUT_QUALITY);
  } catch {
    return canvas.toDataURL('image/jpeg', COMPRESS_OUTPUT_QUALITY);
  }
}

export async function saveUploadedDiseaseImage(diseaseId: string, imageFile: File): Promise<void> {
  const normalizedDiseaseId = diseaseId.trim();
  if (!normalizedDiseaseId) {
    return;
  }

  const imageDataUrl = await resizeAndCompressImage(imageFile);
  const savedImages = readDiseaseImageStorage();
  savedImages[normalizedDiseaseId] = imageDataUrl;
  writeDiseaseImageStorage(savedImages);
}

export async function saveUploadedHistoryImage(historyId: string, imageFile: File): Promise<void> {
  const normalizedHistoryId = historyId.trim();
  if (!normalizedHistoryId) {
    return;
  }

  const imageDataUrl = await resizeAndCompressImage(imageFile);
  const savedImages = readHistoryImageStorage();
  savedImages[normalizedHistoryId] = imageDataUrl;
  writeHistoryImageStorage(savedImages);
}

export function getHistoryImageUrl(historyId: string | null): string | null {
  if (!historyId) {
    return null;
  }

  const savedImages = readHistoryImageStorage();
  const uploadedImageUrl = savedImages[historyId];

  if (typeof uploadedImageUrl === 'string' && uploadedImageUrl.length > 0) {
    return uploadedImageUrl;
  }

  return null;
}

export function getDiseaseImageUrl(diseaseId: string | null): string | null {
  if (!diseaseId) {
    return null;
  }

  const savedImages = readDiseaseImageStorage();
  const uploadedImageUrl = savedImages[diseaseId];

  if (typeof uploadedImageUrl === 'string' && uploadedImageUrl.length > 0) {
    return uploadedImageUrl;
  }

  return DISEASE_DICTIONARY[diseaseId]?.imageUrl ?? null;
}

export function getDiseaseDetailById(diseaseId: string | null): DiseaseDetail | null {
  if (!diseaseId) {
    return null;
  }

  const baseDetail = DISEASE_DICTIONARY[diseaseId];
  if (!baseDetail) {
    return null;
  }

  const resolvedImageUrl = getDiseaseImageUrl(diseaseId);
  if (!resolvedImageUrl || resolvedImageUrl === baseDetail.imageUrl) {
    return baseDetail;
  }

  return {
    ...baseDetail,
    imageUrl: resolvedImageUrl,
  };
}
