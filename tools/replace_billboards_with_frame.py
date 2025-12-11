#!/usr/bin/env python3
"""
Replace billboards but preserve the billboard frame/structure
Extracts the frame from original billboards and applies it to new images
"""

from PIL import Image
import os

# Billboard positions and dimensions
BILLBOARDS = {
    'BILLBOARD06': (488, 555, 298, 190),
    'BILLBOARD07': (313, 897, 298, 190),
    'BILLBOARD09': (150, 555, 328, 282)
}

def extract_frame_from_billboard(billboard_img):
    """Extract the frame/border from a billboard image"""
    # The frame is typically at the edges
    # We'll create a mask to identify the frame area
    width, height = billboard_img.size
    
    # Create a new image for the frame
    frame = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    frame_pixels = frame.load()
    billboard_pixels = billboard_img.load()
    
    # Frame thickness (typically 2-5 pixels)
    frame_thickness = 3
    
    # Extract frame from edges
    for y in range(height):
        for x in range(width):
            # Check if pixel is on the border
            if (x < frame_thickness or x >= width - frame_thickness or 
                y < frame_thickness or y >= height - frame_thickness):
                # This is part of the frame
                frame_pixels[x, y] = billboard_pixels[x, y]
    
    return frame

def create_billboard_with_frame(content_img, original_billboard_img):
    """Create a billboard by combining new content with original frame"""
    width, height = content_img.size
    
    # Resize content to fit inside frame (leave space for frame)
    frame_thickness = 3
    content_area_w = width - (frame_thickness * 2)
    content_area_h = height - (frame_thickness * 2)
    
    # Resize content to fit
    content_resized = content_img.resize((content_area_w, content_area_h), Image.Resampling.LANCZOS)
    
    # Create final billboard
    final = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    # Paste content in the center
    x_offset = frame_thickness
    y_offset = frame_thickness
    final.paste(content_resized, (x_offset, y_offset), content_resized)
    
    # Extract and paste frame from original
    frame = extract_frame_from_billboard(original_billboard_img)
    final = Image.alpha_composite(final, frame)
    
    return final

def update_billboard_with_frame(spritesheet_path, new_image_path, billboard_name, original_spritesheet_path):
    """Update a billboard preserving the frame structure"""
    if billboard_name not in BILLBOARDS:
        print(f"Error: {billboard_name} not found")
        return False
    
    # Open spritesheet
    spritesheet = Image.open(spritesheet_path).convert('RGBA')
    original_spritesheet = Image.open(original_spritesheet_path).convert('RGBA')
    
    # Open new image
    new_img = Image.open(new_image_path).convert('RGBA')
    x, y, w, h = BILLBOARDS[billboard_name]
    
    # Extract original billboard to get frame
    original_billboard = original_spritesheet.crop((x, y, x + w, y + h))
    
    print(f"Processing {billboard_name}:")
    print(f"  Target size: {w}x{h}")
    print(f"  New image: {new_img.size[0]}x{new_img.size[1]}")
    
    # Create billboard with frame
    billboard_with_frame = create_billboard_with_frame(new_img, original_billboard)
    
    # Paste into spritesheet
    spritesheet.paste(billboard_with_frame, (x, y), billboard_with_frame)
    
    # Save
    spritesheet.save(spritesheet_path)
    print(f"  ✓ Updated {spritesheet_path}")
    return True

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # We need a backup of the original spritesheet with the billboard frames
    # Let's use the extracted billboards if available, or extract from current
    original_spritesheet_path = os.path.join(project_root, 'game', 'assets', 'sprites.png')
    
    # First, let's extract the original billboard structures before we modify
    # We'll create a backup or use extracted billboards
    extracted_dir = os.path.join(script_dir, 'extracted_billboards')
    
    if not os.path.exists(extracted_dir):
        print("Error: extracted_billboards directory not found")
        print("Please run the extraction script first or restore original sprites.png")
        return
    
    # Map images to billboards
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
    
    # We need to restore the original billboard frames first
    # Let's check if we have a backup or need to extract from git
    print("Note: This script needs the original billboard frames.")
    print("If the frames are missing, you may need to restore from git or backup.")
    print()
    
    # For now, let's try a different approach: use the extracted billboards
    # and manually extract just the frame edges
    for spritesheet_path in spritesheet_paths:
        if not os.path.exists(spritesheet_path):
            print(f"Warning: {spritesheet_path} not found, skipping")
            continue
        
        print(f"\n{'='*60}")
        print(f"Processing: {os.path.basename(spritesheet_path)}")
        print(f"{'='*60}")
        
        # Load original billboard structures from extracted folder
        for image_file, billboard_name in mappings:
            image_path = os.path.join(script_dir, image_file)
            original_billboard_path = os.path.join(extracted_dir, f"{billboard_name}.png")
            
            if not os.path.exists(original_billboard_path):
                print(f"Warning: Original {billboard_name} not found in extracted_billboards")
                continue
            
            # Use the extracted original as reference for frame
            update_billboard_with_frame(
                spritesheet_path, 
                image_path, 
                billboard_name,
                original_billboard_path  # Use extracted billboard as frame reference
            )
            print()
    
    print("✓ All billboards updated with frames!")
    print("\nNote: If frames don't look right, you may need to restore")
    print("the original sprites.png from git to get the proper frame structure.")

if __name__ == "__main__":
    main()

