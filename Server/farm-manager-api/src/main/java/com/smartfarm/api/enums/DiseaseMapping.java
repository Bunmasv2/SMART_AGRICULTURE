package com.smartfarm.api.enums;

import lombok.Getter;

/**
 * Enum mapping từ disease_class sang soil_condition và care_recommendation
 */
@Getter
public enum DiseaseMapping {
    ANTHRACNOSE(
            "Anthracnose",
            "Đất: Ẩm ướt, bí khí.",
            "Gợi ý: Giảm tưới, phun thuốc nấm."
    ),
    BACTERIAL_BLIGHT(
            "Bacterial Blight",
            "Đất: Quá ẩm, đọng nước.",
            "Gợi ý: Cải thiện thoát nước, cắt lá bệnh."
    ),
    CITRUS_CANKER(
            "Citrus Canker",
            "Đất: Thừa đạm, ẩm ướt.",
            "Gợi ý: Dừng bón đạm (N), thêm Kali."
    ),
    CURL_VIRUS(
            "Curl Virus",
            "Đất: Có kiến/rệp/tuyến trùng.",
            "Gợi ý: Diệt côn trùng trong đất, bẫy rầy."
    ),
    DEFICIENCY_LEAF(
            "Deficiency Leaf",
            "Đất: Thiếu vi lượng (Mg, Fe) hoặc NPK.",
            "Gợi ý: Bón bổ sung phân NPK/vi lượng, đo lại pH."
    ),
    DRY_LEAF(
            "Dry Leaf",
            "Đất: Quá khô cằn.",
            "Gợi ý: Tăng cường tưới nước, che phủ gốc."
    ),
    HEALTHY_LEAF(
            "Healthy Leaf",
            "Đất: Dinh dưỡng ổn định.",
            "Gợi ý: Duy trì chế độ hiện tại."
    ),
    SOOTY_MOULD(
            "Sooty Mould",
            "Đất: Môi trường có rệp/kiến.",
            "Gợi ý: Phun thuốc trị rệp sáp, dọn cỏ quanh gốc."
    ),
    SPIDER_MITES(
            "Spider Mites",
            "Đất: Khô, nhiệt độ môi trường nóng.",
            "Gợi ý: Giữ ẩm đất, phun sương lên lá."
    );

    private final String diseaseClass;
    private final String soilCondition;
    private final String careRecommendation;

    DiseaseMapping(String diseaseClass, String soilCondition, String careRecommendation) {
        this.diseaseClass = diseaseClass;
        this.soilCondition = soilCondition;
        this.careRecommendation = careRecommendation;
    }

    /**
     * Tìm mapping dựa trên disease_class từ Python API
     */
    public static DiseaseMapping fromDiseaseClass(String diseaseClass) {
        for (DiseaseMapping mapping : values()) {
            if (mapping.diseaseClass.equalsIgnoreCase(diseaseClass)) {
                return mapping;
            }
        }
        // Nếu không tìm thấy, trả về HEALTHY_LEAF mặc định
        return HEALTHY_LEAF;
    }
}
