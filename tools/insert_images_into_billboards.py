#!/usr/bin/env python3
"""
Insert new images INSIDE existing billboard structures
Preserves the original billboard frame and structure
"""

from PIL import Image
import os
import numpy as np

def find_content_area(original_billboard):
    """Find the inner content area of a billboard by detecting frame edges"""
    img_array = np.array(original_billboard)
    height, width = img_array.shape[:2]
    
    # Sample pixels from edges to detect frame
    # Check top edge
    top_edge = img_array[0, :]
    # Check bottom edge
    bottom_edge = img_array[-1, :]
    # Check left edge
    left_edge = img_array[:, 0]
    # Check right edge
    right_edge = img_array[:, -1]
    
    # Find frame thickness by detecting where content starts
    # Look for non-transparent or non-black pixels
    frame_thickness = 5  # Default, will adjust
    
    # Try to detect frame by checking if edges are similar (frame color)
    # and finding where it changes to content
    for i in range(min(20, height // 2)):
        # Check if this row/column is part of frame (similar to edge)
        if i < height - 1:
            top_similar = np.allclose(img_array[i, :], top_edge, atol=30)
            if not top_similar:
                frame_thickness = max(frame_thickness, i)
                break
    
    # Ensure minimum frame
    frame_thickness = max(5, min(frame_thickness, 10))
    
    return frame_thickness

def insert_content_into_billboard(content_img, original_billboard):
    """Insert new content inside original billboard structure"""
    width, height = original_billboard.size
    
    # Detect frame thickness
    frame_thickness = find_content_area(original_billboard)
    
    # Calculate content area (inside frame)
    content_w = width - (frame_thickness * 2)
    content_h = height - (frame_thickness * 2)
    
    print(f"  Frame thickness detected: {frame_thickness}px")
    print(f"  Content area: {content_w}x{content_h}")
    
    # Resize content to fit inside
    content_resized = content_img.resize((content_w, content_h), Image.Resampling.LANCZOS)
    
    # Start with original billboard (has the frame structure)
    result = original_billboard.copy()
    
    # Create mask for content area only
    # We'll paste content in the center, preserving the frame
    x_offset = frame_thickness
    y_offset = frame_thickness
    
    # Paste new content inside the frame
    result.paste(content_resized, (x_offset, y_offset), content_resized)
    
    return result

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    extracted_dir = os.path.join(script_dir, 'extracted_billboards')
    
    if not os.path.exists(extracted_dir):
        print("Error: extracted_billboards directory not found")
        print("Extracting billboards from current spritesheet...")
        # Extract from current spritesheet
        spritesheet = Image.open(os.path.join(project_root, 'game', 'assets', 'sprites.png'))
        os.makedirs(extracted_dir, exist_ok=True)
        
        billboards_to_extract = {
            'BILLBOARD05': (5, 897, 298, 190),  # Use this as reference (not modified)
            'BILLBOARD06': (488, 555, 298, 190),
            'BILLBOARD07': (313, 897, 298, 190),
            'BILLBOARD09': (150, 555, 328, 282)
        }
        
        for name, (x, y, w, h) in billboards_to_extract.items():
            billboard = spritesheet.crop((x, y, x + w, y + h))
            billboard.save(os.path.join(extracted_dir, f"{name}.png"))
            print(f"Extracted {name}")
    
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
    
    # Billboard positions
    positions = {
        'BILLBOARD06': (488, 555, 298, 190),
        'BILLBOARD07': (313, 897, 298, 190),
        'BILLBOARD09': (150, 555, 328, 282)
    }
    
    # Use BILLBOARD05 as reference for frame structure (same size as 06 and 07)
    reference_billboard05 = Image.open(os.path.join(extracted_dir, 'BILLBOARD05.png')).convert('RGBA')
    reference_billboard09 = Image.open(os.path.join(extracted_dir, 'BILLBOARD09.png')).convert('RGBA')
    
    # Process each spritesheet
    for spritesheet_path in spritesheet_paths:
        if not os.path.exists(spritesheet_path):
            print(f"Warning: {spritesheet_path} not found, skipping")
            continue
        
        print(f"\n{'='*60}")
        print(f"Processing: {os.path.basename(spritesheet_path)}")
        print(f"{'='*60}")
        
        # Open spritesheet
        spritesheet = Image.open(spritesheet_path).convert('RGBA')
        
        for image_file, billboard_name in mappings:
            image_path = os.path.join(script_dir, image_file)
            
            if not os.path.exists(image_path):
                print(f"Error: Image not found: {image_path}")
                continue
            
            # Load new content
            new_content = Image.open(image_path).convert('RGBA')
            
            # Get billboard position
            x, y, w, h = positions[billboard_name]
            
            # Use appropriate reference billboard
            if billboard_name == 'BILLBOARD09':
                reference_billboard = reference_billboard09
            else:
                reference_billboard = reference_billboard05
            
            print(f"\nProcessing {billboard_name}:")
            print(f"  New content: {new_content.size}")
            print(f"  Billboard size: {w}x{h}")
            
            # Insert content into billboard structure
            billboard_with_content = insert_content_into_billboard(new_content, reference_billboard)
            
            # Paste into spritesheet
            spritesheet.paste(billboard_with_content, (x, y), billboard_with_content)
            
            print(f"  ✓ Inserted content into {billboard_name}")
        
        # Save spritesheet
        spritesheet.save(spritesheet_path)
        print(f"\n✓ Saved {spritesheet_path}")
    
    print("\n" + "="*60)
    print("✓ All images inserted into billboard structures!")
    print("="*60)

if __name__ == "__main__":
    main()

