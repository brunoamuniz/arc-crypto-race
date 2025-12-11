#!/usr/bin/env python3
"""
Fix billboards by adding the frame structure from original billboards
"""

from PIL import Image
import os
import numpy as np

def extract_frame_mask(original_billboard):
    """Extract frame pixels from original billboard"""
    img_array = np.array(original_billboard)
    width, height = original_billboard.size
    
    # Create mask for frame (edges of the image)
    frame_thickness = 4  # Adjust based on billboard design
    mask = np.zeros((height, width, 4), dtype=np.uint8)
    
    # Mark frame area (edges)
    mask[:frame_thickness, :] = img_array[:frame_thickness, :]  # Top
    mask[-frame_thickness:, :] = img_array[-frame_thickness:, :]  # Bottom
    mask[:, :frame_thickness] = img_array[:, :frame_thickness]  # Left
    mask[:, -frame_thickness:] = img_array[:, -frame_thickness:]  # Right
    
    return Image.fromarray(mask, 'RGBA')

def create_billboard_with_original_frame(content_img, original_billboard):
    """Create billboard by combining new content with original frame"""
    width, height = original_billboard.size
    
    # Analyze original to find frame thickness
    # Check edges to determine frame area
    original_array = np.array(original_billboard)
    
    # Find frame by checking where the border color changes
    # Typically billboards have a darker/metal frame
    frame_thickness = 5  # Default, will adjust based on analysis
    
    # Resize content to fit inside (leaving space for frame)
    content_w = width - (frame_thickness * 2)
    content_h = height - (frame_thickness * 2)
    
    # Resize content to fit
    content_resized = content_img.resize((content_w, content_h), Image.Resampling.LANCZOS)
    
    # Start with original billboard (has the frame structure)
    result = original_billboard.copy()
    
    # Extract frame from original (edges)
    frame_mask = extract_frame_mask(original_billboard)
    
    # Paste new content in the center
    x_offset = frame_thickness
    y_offset = frame_thickness
    result.paste(content_resized, (x_offset, y_offset), content_resized)
    
    # Overlay the frame back on top to ensure it's visible
    result = Image.alpha_composite(result, frame_mask)
    
    return result

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    extracted_dir = os.path.join(script_dir, 'extracted_billboards')
    
    if not os.path.exists(extracted_dir):
        print("Error: extracted_billboards directory not found")
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
            # Try original with frame first, then fallback to extracted
            original_billboard_path = os.path.join(script_dir, f"original_{billboard_name.lower()}_with_frame.png")
            if not os.path.exists(original_billboard_path):
                original_billboard_path = os.path.join(extracted_dir, f"{billboard_name}.png")
            
            if not os.path.exists(original_billboard_path):
                print(f"Warning: Original {billboard_name} not found")
                continue
            
            # Load original billboard (has the frame structure)
            original_billboard = Image.open(original_billboard_path).convert('RGBA')
            
            # Load new content
            new_content = Image.open(image_path).convert('RGBA')
            
            # Get billboard position
            x, y, w, h = {
                'BILLBOARD06': (488, 555, 298, 190),
                'BILLBOARD07': (313, 897, 298, 190),
                'BILLBOARD09': (150, 555, 328, 282)
            }[billboard_name]
            
            print(f"\nProcessing {billboard_name}:")
            print(f"  Original billboard: {original_billboard.size}")
            print(f"  New content: {new_content.size}")
            
            # Create billboard with frame
            billboard_with_frame = create_billboard_with_original_frame(new_content, original_billboard)
            
            # Paste into spritesheet
            spritesheet.paste(billboard_with_frame, (x, y), billboard_with_frame)
            
            print(f"  ✓ Updated {billboard_name}")
        
        # Save spritesheet
        spritesheet.save(spritesheet_path)
        print(f"\n✓ Saved {spritesheet_path}")
    
    print("\n" + "="*60)
    print("✓ All billboards updated with original frame structures!")
    print("="*60)

if __name__ == "__main__":
    main()

