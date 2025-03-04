import torch
import torch.nn as nn
from torchvision import transforms
import cv2
from collections import Counter
from .deepfake_detector import DeepfakeDetector

class VideoProcessor:
    def __init__(self, model_path, device='cuda'):
        # Model and device setup
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        
        # Preprocessing transform
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # Load the model
        self.model = DeepfakeDetector().to(self.device)
        state_dict = torch.load(model_path, map_location=self.device)
        
        # Handle potential prefix in state dict keys
        new_state_dict = {}
        for key, value in state_dict.items():
            new_key = key.replace('model.', '').replace('module.', '')
            new_state_dict[new_key] = value
        
        self.model.load_state_dict(new_state_dict, strict=False)
        self.model.eval()

    def extract_frames(self, video_path, max_frames=100):
        """Extract frames from video"""
        vidObj = cv2.VideoCapture(video_path)
        frames = []
        frame_count = 0
        
        while frame_count < max_frames:
            success, frame = vidObj.read()
            if not success:
                break
            
            # Convert BGR to RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Apply transformations
            transformed_frame = self.transform(frame)
            frames.append(transformed_frame)
            
            frame_count += 1
        
        vidObj.release()
        
        # Pad frames if needed
        if len(frames) < max_frames:
            # Repeat the last frame to match expected sequence length
            frames += [frames[-1]] * (max_frames - len(frames))
        
        return torch.stack(frames)

    def predict_video(self, video_path):
        """Predict deepfake probability for video"""
        # Extract frames
        frames = self.extract_frames(video_path)
        
        # Batch prediction
        frame_predictions = []
        
        with torch.no_grad():
            for frame in frames:
                # Add batch dimension
                input_frame = frame.unsqueeze(0).to(self.device)
                
                # Get model output
                output = self.model(input_frame)
                
                # Get probabilities
                probabilities = torch.nn.functional.softmax(output, dim=1)
                
                # Get predicted class
                _, predicted = torch.max(probabilities, 1)
                
                frame_predictions.append(predicted.item())
        
        # Majority voting for final prediction
        final_prediction = Counter(frame_predictions).most_common(1)[0][0]
        
        # Calculate confidence
        confidence = len([p for p in frame_predictions if p == final_prediction]) / len(frame_predictions) * 100
        
        # Interpret results
        result = "REAL" if final_prediction == 1 else "FAKE"
        
        return result, confidence, frame_predictions