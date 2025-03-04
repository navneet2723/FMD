from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from tempfile import NamedTemporaryFile
import os
from tensorflow.keras.models import load_model

from ..service.image_processor import predict_single_image

# Path to the pre-trained model
MODEL_PATH = "C:/Users/91829/Desktop/EMAN-ON/models/image.keras"

# Initialize the model
try:
    model = load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load the model: {e}")

router = APIRouter()

@router.post("/predict-image")
async def predict_image(file: UploadFile):
    """
    Endpoint to predict if an image is real or fake.
    :param file: Uploaded image file.
    :return: JSON response with predicted class and confidence scores.
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

        # Read file contents
        contents = await file.read()
        
        # Save uploaded file to a temporary file
        with NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(contents)
            img_path = temp_file.name

        # Predict using the model
        predicted_class, real_confidence, fake_confidence = predict_single_image(img_path, model)

        # Remove the temporary file after prediction
        os.remove(img_path)

        # Return the result
        return JSONResponse(content={
            "predicted_class": predicted_class,
            "real_confidence": real_confidence,
            "fake_confidence": fake_confidence
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")