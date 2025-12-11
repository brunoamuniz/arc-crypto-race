#!/usr/bin/env python3
"""
Add billboard frame structure to images
Creates a pixel-art style frame around the content
"""

from PIL import Image, ImageDraw
import os

def create_pixel_art_frame(width, height, frame_color=(180, 160, 120, 255), frame_thickness=6):
    """Create a pixel-art style billboard frame"""
    # Create frame image
    frame = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    
    # Outer border (darker)
    outer_color = tuple(max(0, c - 40) for c in frame_color[:3]) + (255,)
    
    # Draw frame borders with pixel-art style
    # Top border
    draw.rectangle([0, 0, width-1, frame_thickness-1], fill=outer_color)
    draw.rectangle([0, frame_thickness, width-1, frame_thickness*2-1], fill=frame_color)
    
    # Bottom border
    draw.rectangle([0, height-frame_thickness, width-1, height-1], fill=outer_color)
    draw.rectangle([0, height-frame_thickness*2, width-1, height-frame_thickness-1], fill=frame_color)
    
    # Left border
    draw.rectangle([0, 0, frame_thickness-1, height-1], fill=outer_color)
    draw.rectangle([frame_thickness, 0, frame_thickness*2-1, height-1], fill=frame_color)
    
    # Right border
    draw.rectangle([width-frame_thickness, 0, width-1, height-1], fill=outer_color)
    draw.rectangle([width-frame_thickness*2, 0, width-frame_thickness-1, height-1], fill=frame_color)
    
    # Corner highlights (lighter)
    highlight_color = tuple(min(255, c + 30) for c in frame_color[:3]) + (255,)
    corner_size = 3
    
    # Top-left corner highlight
    draw.rectangle([0, 0, corner_size-1, corner_size-1], fill=highlight_color)
    # Top-right corner highlight
    draw.rectangle([width-corner_size, 0, width-1, corner_size-1], fill=highlight_color)
    # Bottom-left corner highlight
    draw.rectangle([0, height-corner_size, corner_size-1, height-1], fill=highlight_color)
    # Bottom-right corner highlight
    draw.rectangle([width-corner_size, height-corner_size, width-1, height-1], fill=highlight_color)
    
    return frame

def create_billboard_with_frame(content_img, width, height):
    """Create a billboard by adding frame around content"""
    # Resize content to fit inside frame
    frame_thickness = 6
    content_w = width - (frame_thickness * 2)
    content_h = height - (frame_thickness * 2)
    
    # Resize content
    content_resized = content_img.resize((content_w, content_h), Image.Resampling.LANCZOS)
    
    # Create frame
    frame = create_pixel_art_frame(width, height)
    
    # Create final billboard
    result = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    # Paste frame
    result = Image.alpha_composite(result, frame)
    
    # Paste content in center
    x_offset = frame_thickness
    y_offset = frame_thickness
    result.paste(content_resized, (x_offset, y_offset), content_resized)
    
    return result

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Map images to billboards with their dimensions
    mappings = [
        ('invopay.png', 'BILLBOARD06', 298, 190),
        ('faucet.png', 'BILLBOARD07', 298, 190),
        ('arc.png', 'BILLBOARD09', 328, 282)
    ]
    
    spritesheet_paths = [
        os.path.join(project_root, 'game', 'assets', 'sprites.png'),
        os.path.join(project_root, 'public', 'game', 'assets', 'images', 'sprites.png')
    ]
    
    # Billboard positions
    positions = {
        'BILLBOARD06': (488, 555),
        'BILLBOARD07': (313, 897),
        'BILLBOARD09': (150, 555)
    }
    
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
        
        for image_file, billboard_name, w, h in mappings:
            image_path = os.path.join(script_dir, image_file)
            
            if not os.path.exists(image_path):
                print(f"Error: Image not found: {image_path}")
                continue
            
            # Load new content
            new_content = Image.open(image_path).convert('RGBA')
            
            # Get billboard position
            x, y = positions[billboard_name]
            
            print(f"\nProcessing {billboard_name}:")
            print(f"  Content size: {new_content.size}")
            print(f"  Target size: {w}x{h}")
            
            # Create billboard with frame
            billboard_with_frame = create_billboard_with_frame(new_content, w, h)
            
            # Paste into spritesheet
            spritesheet.paste(billboard_with_frame, (x, y), billboard_with_frame)
            
            print(f"  ✓ Updated {billboard_name} with frame")
        
        # Save spritesheet
        spritesheet.save(spritesheet_path)
        print(f"\n✓ Saved {spritesheet_path}")
    
    print("\n" + "="*60)
    print("✓ All billboards updated with pixel-art frames!")
    print("="*60)

if __name__ == "__main__":
    main()

