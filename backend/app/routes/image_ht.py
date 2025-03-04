from fastapi import APIRouter, UploadFile, File, HTTPException
from ..service.image_ht_processing import preprocess_image
from tensorflow.keras.models import load_model
import numpy as np
import os

# Path to the model
MODEL_PATH = "C:/Users/91829/Desktop/EMAN-ON/image.keras"

# Load the model during initialization
try:
    model = load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Predict the class of an uploaded image."""
    try:
        # Validate the file type
        if not file.content_type.startswith("image"):
            raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

        # Save the uploaded file locally
        temp_image_path = "uploaded_image.jpg"
        with open(temp_image_path, "wb") as temp_file:
            temp_file.write(await file.read())

        # Preprocess the image
        processed_image = preprocess_image(temp_image_path)

        # Make predictions
        predictions = model.predict(processed_image)
        predicted_class = int(np.argmax(predictions, axis=1)[0])
        confidence = float(predictions[0][predicted_class]) * 100  # Confidence in percentage

        # Map predicted class to label
        class_labels = {0: "Fake", 1: "Real"}
        predicted_label = class_labels.get(predicted_class, "Unknown")

        # Clean up temporary files
        os.remove(temp_image_path)
        if os.path.exists("temp_ela.jpg"):
            os.remove("temp_ela.jpg")
        if os.path.exists("temp_ela.png"):
            os.remove("temp_ela.png")

        # Return only prediction and confidence
        return {
            "prediction": predicted_label,
            "confidence": f"{confidence:.2f}%"  # Format confidence with two decimals
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during prediction: {str(e)}")
