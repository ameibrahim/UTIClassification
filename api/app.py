from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import logging
from starlette.middleware.base import BaseHTTPMiddleware
import os
from pathlib import Path
from typing import Optional
from io import BytesIO
from PIL import Image

from prediction import (
    load_image_from_url,       # keep if you still want URL fallback
    predict_with_model_file,
)

MODELS_DIR  = Path(os.getenv("MODELS_DIR",  "./models"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

application = FastAPI()

application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        logger.info("Request: %s %s", request.method, request.url)
        response = await call_next(request)
        logger.info("Response: %s", response.status_code)
        return response

application.add_middleware(LoggingMiddleware)

def _pil_from_upload(upload: UploadFile) -> Image.Image:
    # Basic content-type guard (optional)
    if upload.content_type and not upload.content_type.startswith("image/"):
        raise ValueError(f"Uploaded file is not an image (content-type={upload.content_type})")
    # Read into memory and decode with PIL
    data = upload.file.read()  # UploadFile.file is a SpooledTemporaryFile
    if not data:
        raise ValueError("Uploaded image is empty.")
    try:
        img = Image.open(BytesIO(data))
        img.load()  # force read to catch truncated files early
        return img
    except Exception as exc:
        raise ValueError(f"Unable to decode uploaded image: {exc}") from exc

@application.post("/predict/")
async def post_results(
    modelInputFeatureSize: int = Form(...),
    modelFilename: str = Form(...),
    image: Optional[UploadFile] = File(None),     # form-data file field: "image"
    imageUrl: Optional[str] = Form(None),         # optional: still allow URL in form-data
):
    """
    Accepts multipart/form-data:
      - modelInputFeatureSize: int (Form)
      - modelFilename: str (Form)
      - image: file (File)   <-- preferred path
      - imageUrl: str (Form) <-- optional fallback
    Returns numeric class prediction(s).
    """

    if image is None and not imageUrl:
        raise HTTPException(
            status_code=400,
            detail="Provide an image file (form-data 'image') or an imageUrl (form field).",
        )

    try:
        # Load the image
        if image is not None:
            logger.info("Loading image from uploaded file: %s", image.filename)
            img = _pil_from_upload(image)
        else:
            logger.info("Fetching image from URL: %s", imageUrl)
            img = load_image_from_url(imageUrl)  # your existing helper

        # Resolve model
        model_path = MODELS_DIR / modelFilename
        logger.info("Using model file: %s", model_path)

        # Run prediction
        result = predict_with_model_file(img, model_path, modelInputFeatureSize)
        return {"classification": result}

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Error occurred while processing: %s", exc)
        raise HTTPException(status_code=500, detail="Internal server error") from exc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(application, host="0.0.0.0", port=7135)
