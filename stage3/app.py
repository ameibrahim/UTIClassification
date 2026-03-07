from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from PIL import Image
import asyncio
import io
import random
from ultralytics import YOLO
from tensorflow.keras.models import load_model
import numpy as np

# Load models once
yolo_model = YOLO("models/celldetector-yolov11.pt")
cnn_model = load_model("models/MULTICLASS_InceptionV3_Round3.keras")

CLASS_NAMES = ["leuko","eryth","mycete","cast","cryst","epith","epithn"]
CNN_SIZE = 224

app = FastAPI()

# Allow frontend access (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job storage
jobs = {}
connections = {}


@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):

    job_id = str(uuid4())

    contents = await image.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    # Replace this with Roboflow detection
    crops = split_image(image)

    jobs[job_id] = {
        "total": len(crops),
        "results": []
    }

    # Run processing in background
    asyncio.create_task(process_crops(job_id, crops))

    return {
        "job_id": job_id,
        "num_crops": len(crops)
    }


@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):

    await websocket.accept()
    connections[job_id] = websocket

    try:
        while True:
            await asyncio.sleep(1)
    except:
        connections.pop(job_id, None)


async def process_crops(job_id, crops):

    websocket = None

    # wait until websocket connects
    while websocket is None:
        websocket = connections.get(job_id)
        await asyncio.sleep(0.1)

    for i, crop in enumerate(crops):

        prediction = classify_crop(crop)

        result = {
            "crop_id": i,
            "prediction": prediction
        }

        jobs[job_id]["results"].append(result)

        await websocket.send_json({
            "type": "prediction",
            "data": result
        })

        await asyncio.sleep(0.5)

    await websocket.send_json({
        "type": "finished"})


def split_image(image):
    """
    Run YOLO detection and return cropped cells
    """

    results = yolo_model(image)

    crops = []

    for result in results:

        boxes = result.boxes.xyxy.cpu().numpy()

        for box in boxes:
            x1, y1, x2, y2 = map(int, box)

            crop = image.crop((x1, y1, x2, y2))
            crops.append(crop)

    return crops


def classify_crop(crop):

    img = crop.resize((CNN_SIZE, CNN_SIZE))
    arr = np.array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)

    preds = cnn_model.predict(arr, verbose=0)

    class_id = int(np.argmax(preds[0]))
    confidence = float(preds[0][class_id])

    return {
        "class": CLASS_NAMES[class_id],
        "confidence": round(confidence, 4)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=7136, reload=True)