#!/usr/bin/env python3
"""
Replace BILLBOARD06, BILLBOARD07, and BILLBOARD09 with new images
Images will be resized/cropped to fit the billboard dimensions
"""

from PIL import Image
import os

# Billboard positions and dimensions
BILLBOARDS = {
    'BILLBOARD06': (488, 555, 298, 190),
    'BILLBOARD07': (313, 897, 298, 190),
    'BILLBOARD09': (150, 555, 328, 282)
}

def resize_and_fit(image, target_width, target_height):
    """Resize image to fit target dimensions, maintaining aspect ratio and centering"""
    img_width, img_height = image.size
    target_ratio = target_width / target_height
    img_ratio = img_width / img_height
    
    if img_ratio > target_ratio:
        # Image is wider - fit to width
        new_width = target_width
        new_height = int(target_width / img_ratio)
    else:
        # Image is taller - fit to height
        new_height = target_height
        new_width = int(target_height * img_ratio)
    
    # Resize image
    resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Create new image with target size and transparent background
    result = Image.new('RGBA', (target_width, target_height), (0, 0, 0, 0))
    
    # Center the resized image
    x_offset = (target_width - new_width) // 2
    y_offset = (target_height - new_height) // 2
    result.paste(resized, (x_offset, y_offset), resized)
    
    return result

def update_billboard(spritesheet_path, new_image_path, billboard_name):
    """Update a billboard in the spritesheet"""
    if billboard_name not in BILLBOARDS:
        print(f"Error: {billboard_name} not found")
        return False
    
    # Open spritesheet
    spritesheet = Image.open(spritesheet_path).convert('RGBA')
    
    # Open new image
    new_img = Image.open(new_image_path).convert('RGBA')
    x, y, w, h = BILLBOARDS[billboard_name]
    
    print(f"Processing {billboard_name}:")
    print(f"  Target size: {w}x{h}")
    print(f"  Original image: {new_img.size[0]}x{new_img.size[1]}")
    
    # Resize and fit image
    new_img_fitted = resize_and_fit(new_img, w, h)
    
    # Paste into spritesheet
    spritesheet.paste(new_img_fitted, (x, y), new_img_fitted)
    
    # Save
    spritesheet.save(spritesheet_path)
    print(f"  ✓ Updated {spritesheet_path}")
    return True

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Map images to billboards
    # Based on the images: invopay, faucet, arc
    # We'll map them to the 3 billboards
    mappings = [
        ('invopay.png', 'BILLBOARD06'),
        ('faucet.png', 'BILLBOARD07'),
        ('arc.png', 'BILLBOARD09')
    ]
    
    spritesheet_paths = [
        os.path.join(project_root, 'game', 'assets', 'sprites.png'),
        os.path.join(project_root, 'public', 'game', 'assets', 'images', 'sprites.png')
    ]
    
    # Check if images exist
    for image_file, billboard_name in mappings:
        image_path = os.path.join(script_dir, image_file)
        if not os.path.exists(image_path):
            print(f"Error: Image not found: {image_path}")
            return
    
    # Update both spritesheet files
    for spritesheet_path in spritesheet_paths:
        if not os.path.exists(spritesheet_path):
            print(f"Warning: {spritesheet_path} not found, skipping")
            continue
        
        print(f"\n{'='*60}")
        print(f"Processing: {os.path.basename(spritesheet_path)}")
        print(f"{'='*60}")
        
        for image_file, billboard_name in mappings:
            image_path = os.path.join(script_dir, image_file)
            update_billboard(spritesheet_path, image_path, billboard_name)
            print()
    
    print("✓ All billboards updated successfully!")
    print("\nUpdated billboards:")
    print("  - BILLBOARD06 (298x190): invopay.png")
    print("  - BILLBOARD07 (298x190): faucet.png")
    print("  - BILLBOARD09 (328x282): arc.png")
    print("\nRemember to test the game to see the changes!")

if __name__ == "__main__":
    main()

