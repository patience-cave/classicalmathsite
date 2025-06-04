import os
from PIL import Image

# Define source and destination directory
SOURCE_DIR = '.'
QUALITY = 80  # Adjust for desired balance of quality and compression (0-100)

# Supported input image formats
SUPPORTED_FORMATS = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff')

def convert_to_webp(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')  # Ensure compatibility

        webp_path = os.path.splitext(image_path)[0] + '.webp'

        img.save(webp_path, 'webp', quality=QUALITY, method=6)  # method=6 is the highest compression
        print(f"Converted: {image_path} -> {webp_path}")
    except Exception as e:
        print(f"Failed to convert {image_path}: {e}")

def process_images(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(SUPPORTED_FORMATS):
                full_path = os.path.join(root, file)
                convert_to_webp(full_path)

if __name__ == '__main__':
    process_images(SOURCE_DIR)
