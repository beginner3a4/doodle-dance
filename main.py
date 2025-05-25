import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import base64
import io

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

mp_pose = mp.solutions.pose
pose_detector = mp_pose.Pose(static_image_mode=False)  # persistent pose detector

def make_doodle(img):
    h, w, _ = img.shape
    out = np.zeros_like(img)
    r = pose_detector.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    if r.pose_landmarks:
        for c in mp_pose.POSE_CONNECTIONS:
            a = r.pose_landmarks.landmark[c[0]]
            b = r.pose_landmarks.landmark[c[1]]
            x1, y1 = int(a.x * w), int(a.y * h)
            x2, y2 = int(b.x * w), int(b.y * h)
            cv2.line(out, (x1, y1), (x2, y2), (0,150,255), 18)
            cv2.line(out, (x1, y1), (x2, y2), (255,255,255), 6)
        for lm in r.pose_landmarks.landmark:
            x, y = int(lm.x * w), int(lm.y * h)
            cv2.circle(out, (x, y), 12, (0,255,255), -1)
            cv2.circle(out, (x, y), 6, (255,255,255), -1)
    return out

@app.get("/")
async def index():
    return FileResponse("static/index.html")

@app.post("/predict")
async def predict(request: Request):
    d = await request.json()
    img_data = d['image'].split(',')[1]
    img_bytes = base64.b64decode(img_data)
    arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    doodle_img = make_doodle(frame)
    _, buf = cv2.imencode('.jpg', doodle_img)
    return StreamingResponse(io.BytesIO(buf.tobytes()), media_type="image/jpeg")
