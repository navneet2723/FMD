import os
from PIL import Image, ImageChops, ImageEnhance
import numpy as np

class ImageProcessor:
    @staticmethod
    def convert_to_ela_image(image_path, quality=90):
        """
        Convert image to Error Level Analysis (ELA) format
        """
        temp_filename = f'temp_{os.path.basename(image_path)}'
        try:
            original_image = Image.open(image_path).convert('RGB')
            
            # Save and reopen with specific quality
            original_image.save(temp_filename, 'JPEG', quality=quality)
            temp_image = Image.open(temp_filename)
            
            # Calculate ELA
            ela_image = ImageChops.difference(original_image, temp_image)
            extrema = ela_image.getextrema()
            
            # Log extrema values for debugging
            print(f"Extrema for {image_path}: {extrema}")
            
            if not extrema or not isinstance(extrema, list) or not all(isinstance(ex, tuple) for ex in extrema):
                raise ValueError("Invalid extrema values")
            
            # Scale the difference
            max_diff = max([ex[1] for ex in extrema])
            scale = 255.0 / max_diff if max_diff > 0 else 1
            ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
            
            return ela_image
            
        except Exception as e:
            raise Exception(f"Error processing image {image_path}: {str(e)}")
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)