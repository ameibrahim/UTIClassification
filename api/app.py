from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from starlette.middleware.base import BaseHTTPMiddleware
import os
from pathlib import Path
from typing import Optional

from prediction import (
    load_image_from_file,
    load_image_from_url,
    predict_with_model_file,
)

UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", "./data/uploads"))
MODELS_DIR  = Path(os.getenv("MODELS_DIR",  "./data/models"))

# Configure logging
logging.basicConfig(level=logging.INFO)  # Set to DEBUG for more verbosity
logger = logging.getLogger(__name__)

# Create FastAPI instance
application = FastAPI()

# Set up CORS
application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify your domain here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging Middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        logger.info(f"Request: {request.method} {request.url}")
        response = await call_next(request)
        logger.info(f"Response: {response.status_code}")
        return response

application.add_middleware(LoggingMiddleware)

@application.get("/predict/")
async def get_results(
    modelInputFeatureSize: int,
    modelFilename: str,
    imageName: Optional[str] = None,
    imageUrl: Optional[str] = None,
):
    
    ### This api takes in a modelfilename so that you can
    ##  generically call in the UNU and UTI model types
    #   It returns the classnames in number format

    ### The imageName works-ish, but you will need to setup
    ##  dockers shared volumes and remove the ./ on lines 15 & 16
    #   this will let you have these files in both places.

    ### The recommended route is to share an imageURL
    ##  The frontend exposes the api/uploads route for images
    #   It then gets the domain name and joins it.


    if not imageName and not imageUrl:
        raise HTTPException(
            status_code=400,
            detail="Either imageName or imageUrl must be provided.",
        )

    try:
        if imageUrl:
            logger.info("Fetching image from URL: %s", imageUrl)
            img = load_image_from_url(imageUrl)
        else:
            assert imageName is not None
            image_path = UPLOADS_DIR / imageName
            logger.info("Loading image from path: %s", image_path)
            img = load_image_from_file(image_path)

        model_path = MODELS_DIR / modelFilename
        logger.info("Using model file: %s", model_path)
        result = predict_with_model_file(img, model_path, modelInputFeatureSize)

        return {"classification": result}

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as e:
        logger.error("Error occurred while processing: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(application, host="0.0.0.0", port=7135)
