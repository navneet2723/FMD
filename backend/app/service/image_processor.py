from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

def predict_single_image(img_path, model, target_size=(256, 256)):
    """
    Function to predict a single image using the trained model.
    
    Parameters:
        img_path (str): Path to the image.
        model: Trained Keras model.
        target_size (tuple): Image target size for the model.

    Returns:
        predicted_class (str): Predicted class label ("real" or "fake").
        real_confidence (float): Confidence for the "real" class.
        fake_confidence (float): Confidence for the "fake" class.
    """
    # Load and preprocess the image
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img) / 255.0  # Normalize
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    
    # Make a prediction
    prediction = model.predict(img_array)
    
    # Confidence values
    real_confidence = float(prediction[0][0] * 100)  # Confidence for "real"
    fake_confidence = float((1 - prediction[0][0]) * 100)  # Confidence for "fake"
    
    # Determine the class based on confidence
    predicted_class = "real" if prediction[0][0] > 0.5 else "fake"
    
    return predicted_class, real_confidence, fake_confidence