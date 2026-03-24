from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

# 1. Load model AI lúc khởi động server
MODEL_PATH = "model_la_chanh.keras"
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✓ Load model thành công!")
except Exception as e:
    print(f"✗ Lỗi load model: {e}")
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
    Xử lý ảnh: RGB, resize (224,224), normalize, add batch dimension
    """
    # Đọc ảnh bằng Pillow
    image = Image.open(BytesIO(file_data))

    # Chuyển sang hệ màu RGB
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Resize về kích thước chuẩn (224, 224)
    image = image.resize((224, 224))

    # Chuyển thành numpy array
    img_array = np.array(image, dtype=np.float32)


    # Thêm batch dimension: (224, 224, 3) -> (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array

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
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File không phải là ảnh")

        # Đọc nội dung file ảnh
        image_bytes = await file.read()

        # Tiền xử lý ảnh
        processed_image = preprocess_image(image_bytes)

        # Dự đoán bằng model AI
        predictions = model.predict(processed_image, verbose=0)

        # Lấy kết quả có confidence cao nhất
        predicted_index = np.argmax(predictions[0])
        disease_class = CLASS_NAMES[predicted_index]
        confidence = float(predictions[0][predicted_index])
        
        if confidence < 0.50:
            return {
                "status": "error",
                "message": "Đây có thể không phải là lá chanh hoặc ảnh quá mờ, vui lòng thử lại."
            }

        # Trả về JSON
        return {
            "status": "success",
            "disease_class": disease_class,
            "confidence": round(confidence, 4)  # 0.9876
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