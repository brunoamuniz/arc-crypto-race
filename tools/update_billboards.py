#!/usr/bin/env python3
"""
Script to update billboards in the spritesheet
Replaces: LiquidPlanner, Code inComplete, CityofRedmond
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

def extract_billboard(spritesheet_path, billboard_name, output_path):
    """Extract a billboard from the spritesheet for inspection"""
    img = Image.open(spritesheet_path)
    x, y, w, h = BILLBOARDS[billboard_name]
    billboard = img.crop((x, y, x + w, y + h))
    billboard.save(output_path)
    print(f"Extracted {billboard_name} to {output_path}")

def update_billboard(spritesheet_path, new_image_path, billboard_name, output_path):
    """Replace a billboard in the spritesheet with a new image"""
    # Open spritesheet
    spritesheet = Image.open(spritesheet_path).convert('RGBA')
    
    # Open and resize new image
    new_img = Image.open(new_image_path).convert('RGBA')
    x, y, w, h = BILLBOARDS[billboard_name]
    
    # Resize new image to fit billboard dimensions
    new_img_resized = new_img.resize((w, h), Image.Resampling.LANCZOS)
    
    # Paste into spritesheet
    spritesheet.paste(new_img_resized, (x, y), new_img_resized)
    
    # Save
    spritesheet.save(output_path)
    print(f"Updated {billboard_name} in {output_path}")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Extract billboard: python update_billboards.py extract BILLBOARD_NAME")
        print("  Update billboard: python update_billboards.py update BILLBOARD_NAME new_image.png")
        print("\nAvailable billboards:")
        for name in BILLBOARDS.keys():
            print(f"  - {name}")
        return
    
    command = sys.argv[1]
    spritesheet_path = "../game/assets/sprites.png"
    
    if command == "extract":
        if len(sys.argv) < 3:
            print("Usage: python update_billboards.py extract BILLBOARD_NAME")
            return
        billboard_name = sys.argv[2]
        if billboard_name not in BILLBOARDS:
            print(f"Error: {billboard_name} not found")
            return
        output_path = f"extracted_{billboard_name.lower()}.png"
        extract_billboard(spritesheet_path, billboard_name, output_path)
    
    elif command == "update":
        if len(sys.argv) < 4:
            print("Usage: python update_billboards.py update BILLBOARD_NAME new_image.png")
            return
        billboard_name = sys.argv[2]
        new_image_path = sys.argv[3]
        if billboard_name not in BILLBOARDS:
            print(f"Error: {billboard_name} not found")
            return
        if not os.path.exists(new_image_path):
            print(f"Error: {new_image_path} not found")
            return
        output_path = spritesheet_path
        update_billboard(spritesheet_path, new_image_path, billboard_name, output_path)
        # Also update the public version
        public_path = "../public/game/assets/images/sprites.png"
        if os.path.exists(public_path):
            update_billboard(public_path, new_image_path, billboard_name, public_path)
            print(f"Also updated {public_path}")
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()

