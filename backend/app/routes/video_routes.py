from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from tempfile import NamedTemporaryFile
import os

from ..service.video_processor import VideoProcessor

# Path to the pre-trained model
MODEL_PATH = f'C:/Users/91829/Desktop/EMAN-ON/models/video.pt'

# Initialize the VideoProcessor
try:
    video_processor = VideoProcessor(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to initialize VideoProcessor: {e}")

router = APIRouter()

@router.post("/predict-video")
async def predict_video(video: UploadFile):
    """
    Endpoint to classify a video as REAL or FAKE
    :param video: Uploaded video file
    :return: JSON with classification result and confidence
    """
    # Validate file type
    if not video.content_type.startswith("video"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a video.")
    
    try:
        # Read file contents
        contents = await video.read()
        
        # Save the video to a temporary file
        with NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
            temp_file.write(contents)
            temp_video_path = temp_file.name
        
        # Perform prediction
        result, confidence, frame_predictions = video_processor.predict_video(temp_video_path)
        print(result, confidence, frame_predictions)
        
        # Clean up the temporary file
        os.remove(temp_video_path)
        
        # Return the result as JSON
        return JSONResponse(
            content={
                "result": result,
                "confidence": confidence,
                # "frame_predictions": frame_predictions  # Commented out to reduce response size
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during prediction: {str(e)}")