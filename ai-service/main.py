from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from insightface.app import FaceAnalysis
import numpy as np
import cv2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading InsightFace AI model...")

face_app = FaceAnalysis(
    name="buffalo_sc",
    providers=["CPUExecutionProvider"]
)

face_app.prepare(
    ctx_id=0,
    det_size=(640, 640)
)

print("InsightFace AI model loaded successfully!")


@app.get("/")
def home():
    return {
        "message": "AI Face Recognition Service is Running"
    }


@app.post("/detect-faces")
async def detect_faces(file: UploadFile = File(...)):

    image_bytes = await file.read()
    image_array = np.frombuffer(image_bytes, np.uint8)

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        return {
            "success": False,
            "message": "Invalid image"
        }

    faces = face_app.get(image)

    detected_faces = []

    for face in faces:
        detected_faces.append({
            "bbox": face.bbox.tolist(),
            "confidence": float(face.det_score),
            "embedding": face.embedding.tolist(),
            "embedding_length": len(face.embedding)
        })

    return {
        "success": True,
        "faces_detected": len(faces),
        "faces": detected_faces
    }


@app.post("/get-face-embedding")
async def get_face_embedding(file: UploadFile = File(...)):

    image_bytes = await file.read()
    image_array = np.frombuffer(image_bytes, np.uint8)

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        return {
            "success": False,
            "message": "Invalid image"
        }

    faces = face_app.get(image)

    if len(faces) == 0:
        return {
            "success": False,
            "message": "No face detected"
        }

    if len(faces) > 1:
        return {
            "success": False,
            "message": "Multiple faces detected. Please upload a photo with only one face."
        }

    face = faces[0]

    return {
        "success": True,
        "embedding": face.embedding.tolist(),
        "embedding_length": len(face.embedding),
        "confidence": float(face.det_score)
    }