from PIL import Image
import os

banners = [
    ('favicon/Simba banner.jpeg', 'favicon/simba-banner1.jpg'),
    ('favicon/Simba banner 2.jpeg', 'favicon/simba-banner2.jpg'),
]

for old_path, new_path in banners:
    if os.path.exists(old_path):
        print(f"Compressing {old_path}...")
        
        # Open and compress
        img = Image.open(old_path)
        original_size = os.path.getsize(old_path)
        
        # Save as compressed JPEG with lower quality
        img.save(new_path, 'JPEG', quality=70, optimize=True)
        
        new_size = os.path.getsize(new_path)
        reduction = ((original_size - new_size) / original_size) * 100
        
        print(f"  Original: {original_size:,} bytes ({original_size//1024}KB)")
        print(f"  Compressed: {new_size:,} bytes ({new_size//1024}KB)")
        print(f"  Reduction: {reduction:.1f}%\n")

print("✓ Banners optimized and renamed!")
