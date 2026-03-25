from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import numpy as np
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageOps
import tensorflow as tf

app = FastAPI()

# 1. Load model AI lúc khởi động server
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model_la_chanh.keras"

# IMPORTANT:
# Model đã được train với preprocess_input nằm trong graph:
# inputs -> mobilenet_v2.preprocess_input(inputs) -> base_model -> ...
# Vì vậy inference KHÔNG được preprocess_input thêm lần nữa bên ngoài.
EXTERNAL_PREPROCESS_INPUT = False

# Giới hạn kích thước file upload để tránh request quá lớn
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10MB
try:
    model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)
    print(f"Load model thành công: {MODEL_PATH}")
except Exception as e:
    print(f"Lỗi load model tại {MODEL_PATH}: {e}")
    model = None

# 2. Danh sách 9 classes theo đúng thứ tự
CLASS_NAMES = [
    "Anthracnose", "Bacterial Blight", "Citrus Canker",
    "Curl Virus", "Deficiency Leaf", "Dry Leaf",
    "Healthy Leaf", "Sooty Mould", "Spider Mites"
]

# Hàm tiền xử lý ảnh
def preprocess_image(file_data):
    """
    Xử lý ảnh theo đúng pipeline train:
    - Sửa orientation theo EXIF
    - Chuyển RGB
    - Resize về 224x224
    - Add batch dimension

    Lưu ý:
    Model đã chứa preprocess_input() trong graph, nên mặc định
    không preprocess_input ở đây để tránh double-preprocess.
    """
    image = Image.open(BytesIO(file_data))
    image = ImageOps.exif_transpose(image)

    if image.mode != "RGB":
        image = image.convert("RGB")

    resample = Image.Resampling.BILINEAR if hasattr(Image, "Resampling") else Image.BILINEAR
    image = image.resize((224, 224), resample=resample)

    img_array = np.asarray(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    if EXTERNAL_PREPROCESS_INPUT:
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

    return img_array


def get_top_predictions(pred_vector, top_k=3):
    """Trả về top-k class để debug và quan sát độ tự tin của model."""
    top_k = min(top_k, len(CLASS_NAMES))
    top_indices = np.argsort(pred_vector)[::-1][:top_k]
    return [
        {
            "class": CLASS_NAMES[int(idx)],
            "confidence": round(float(pred_vector[int(idx)]), 4),
        }
        for idx in top_indices
    ]

# 3. Endpoint POST /api/predict-leaf
@app.post("/api/predict-leaf")
async def predict_leaf(file: UploadFile = File(...)):
    """
    Nhận file ảnh lá cây chanh, trả về kết quả phân tích bệnh
    """
    try:
        # Kiểm tra model đã load chưa
        if model is None:
            raise HTTPException(status_code=500, detail="Model chưa được load")

        # Kiểm tra file có phải ảnh không
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File không phải là ảnh")

        # Đọc nội dung file ảnh
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="File ảnh rỗng")
        if len(image_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="File ảnh vượt quá 10MB")

        # Tiền xử lý ảnh
        processed_image = preprocess_image(image_bytes)

        # Dự đoán bằng model AI
        predictions = model.predict(processed_image, verbose=0)
        if predictions is None or len(predictions) == 0:
            raise HTTPException(status_code=500, detail="Model không trả về kết quả dự đoán")

        pred_vector = predictions[0]
        if pred_vector.shape[0] != len(CLASS_NAMES):
            raise HTTPException(
                status_code=500,
                detail=f"Số class của model ({pred_vector.shape[0]}) không khớp CLASS_NAMES ({len(CLASS_NAMES)})",
            )

        # Lấy kết quả có confidence cao nhất
        predicted_index = int(np.argmax(pred_vector))
        disease_class = CLASS_NAMES[predicted_index]
        confidence = float(pred_vector[predicted_index])
        top_predictions = get_top_predictions(pred_vector, top_k=3)
        
        if confidence < 0.50:
            return {
                "status": "error",
                "message": "Đây có thể không phải là lá chanh hoặc ảnh quá mờ, vui lòng thử lại.",
                "top_predictions": top_predictions,
            }

        # Trả về JSON
        return {
            "status": "success",
            "disease_class": disease_class,
            "confidence": round(confidence, 4),
            "predicted_index": predicted_index,
            "top_predictions": top_predictions,
        }

    except HTTPException:
        raise
    except Exception as e:
        return {
            "status": "error",
            "message": f"Lỗi xử lý ảnh: {str(e)}"
        }

# Chạy server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)