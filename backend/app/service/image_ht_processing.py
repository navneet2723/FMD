from PIL import Image, ImageChops, ImageEnhance
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np

def convert_to_ela_image(path, quality=90):
    """Convert an image to its Error Level Analysis (ELA) representation."""
    temp_filename = 'temp_ela.jpg'
    ela_filename = 'temp_ela.png'

    image = Image.open(path).convert('RGB')
    image.save(temp_filename, 'JPEG', quality=quality)
    temp_image = Image.open(temp_filename)

    ela_image = ImageChops.difference(image, temp_image)
    max_diff = max([
        extrema[1] for extrema in ela_image.getextrema()
    ]) or 1

    scale = 255.0 / max_diff
    ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)

    ela_image.save(ela_filename)
    return ela_image

def preprocess_image(image_path, target_size=(128, 128)):
    """Load and preprocess an image for the model."""
    ela_image = convert_to_ela_image(image_path)
    ela_image = ela_image.resize(target_size)
    image_array = img_to_array(ela_image) / 255.0  # Normalize the image
    return np.expand_dims(image_array, axis=0)  # Add batch dimension
