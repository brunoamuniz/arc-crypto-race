#!/usr/bin/env python3
"""
Integrate new billboard images into the spritesheet
Usage: python integrate_billboards.py image1.png BILLBOARD_NAME1 image2.png BILLBOARD_NAME2 image3.png BILLBOARD_NAME3
"""

from PIL import Image
import sys
import os

# Billboard positions and dimensions
BILLBOARDS = {
    'BILLBOARD01': (625, 375, 300, 170),
    'BILLBOARD02': (245, 1262, 215, 220),
    'BILLBOARD03': (5, 1262, 230, 220),
    'BILLBOARD04': (1205, 310, 268, 170),
    'BILLBOARD05': (5, 897, 298, 190),
    'BILLBOARD06': (488, 555, 298, 190),
    'BILLBOARD07': (313, 897, 298, 190),
    'BILLBOARD08': (230, 5, 385, 265),
    'BILLBOARD09': (150, 555, 328, 282)
}

def update_spritesheet(spritesheet_path, new_image_path, billboard_name):
    """Update a billboard in the spritesheet"""
    if billboard_name not in BILLBOARDS:
        print(f"Error: {billboard_name} not found. Available: {list(BILLBOARDS.keys())}")
        return False
    
    # Open spritesheet
    spritesheet = Image.open(spritesheet_path).convert('RGBA')
    
    # Open and resize new image
    new_img = Image.open(new_image_path).convert('RGBA')
    x, y, w, h = BILLBOARDS[billboard_name]
    
    print(f"Updating {billboard_name} at ({x}, {y}) with size {w}x{h}")
    print(f"  Original image size: {new_img.size}")
    
    # Resize new image to fit billboard dimensions (maintain aspect ratio, center crop)
    new_img_resized = new_img.resize((w, h), Image.Resampling.LANCZOS)
    
    # Paste into spritesheet
    spritesheet.paste(new_img_resized, (x, y), new_img_resized)
    
    # Save
    spritesheet.save(spritesheet_path)
    print(f"  ✓ Updated {spritesheet_path}")
    return True

def main():
    if len(sys.argv) < 7:
        print("Usage: python integrate_billboards.py <image1> <billboard1> <image2> <billboard2> <image3> <billboard3>")
        print("\nExample:")
        print("  python integrate_billboards.py invopay.png BILLBOARD01 arc.png BILLBOARD02 faucet.png BILLBOARD03")
        print("\nAvailable billboards:")
        for name, (x, y, w, h) in BILLBOARDS.items():
            print(f"  {name}: {w}x{h} at ({x}, {y})")
        return
    
    # Get base directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    spritesheet_paths = [
        os.path.join(project_root, 'game', 'assets', 'sprites.png'),
        os.path.join(project_root, 'public', 'game', 'assets', 'images', 'sprites.png')
    ]
    
    # Process 3 billboards
    updates = []
    for i in range(1, 7, 2):
        image_path = sys.argv[i]
        billboard_name = sys.argv[i + 1]
        
        # Check if image exists
        if not os.path.exists(image_path):
            # Try relative to tools directory
            image_path = os.path.join(script_dir, image_path)
            if not os.path.exists(image_path):
                print(f"Error: Image not found: {sys.argv[i]}")
                return
        
        updates.append((image_path, billboard_name))
    
    # Update both spritesheet files
    for spritesheet_path in spritesheet_paths:
        if not os.path.exists(spritesheet_path):
            print(f"Warning: {spritesheet_path} not found, skipping")
            continue
        
        print(f"\nProcessing {spritesheet_path}...")
        for image_path, billboard_name in updates:
            update_spritesheet(spritesheet_path, image_path, billboard_name)
    
    print("\n✓ All billboards updated successfully!")
    print("  Remember to test the game to see the changes.")

if __name__ == "__main__":
    main()

