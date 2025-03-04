import tensorflow as tf

try:
    model = tf.keras.models.load_model('C:/Users/91829/OneDrive/Desktop/image.keras')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed to load model: {e}")
