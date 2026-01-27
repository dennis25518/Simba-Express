from PIL import Image
import os

# Define banner files
banners = [
    'favicon/banner1.png',
    'favicon/banner2.webp',
    'favicon/banner3.webp'
]

for banner_path in banners:
    if os.path.exists(banner_path):
        print(f"Compressing {banner_path}...")
        
        # Open image
        img = Image.open(banner_path)
        
        # Get original size
        original_size = os.path.getsize(banner_path)
        
        # Compress and save
        if banner_path.endswith('.png'):
            img.save(banner_path, 'PNG', optimize=True, quality=85)
        elif banner_path.endswith('.webp'):
            img.save(banner_path, 'WEBP', quality=80)
        
        # Get compressed size
        compressed_size = os.path.getsize(banner_path)
        reduction = ((original_size - compressed_size) / original_size) * 100
        
        print(f"  Original: {original_size:,} bytes")
        print(f"  Compressed: {compressed_size:,} bytes")
        print(f"  Reduction: {reduction:.1f}%\n")
    else:
        print(f"File not found: {banner_path}")

print("✓ All banners compressed successfully!")
