import os
import sys
from PIL import Image
import uuid

def slice_image(image_path, output_dir, rows, cols, prefix):
    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return

    img_width, img_height = img.size
    cell_width = img_width // cols
    cell_height = img_height // rows

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"Slicing {image_path} ({img_width}x{img_height}) into {rows}x{cols} grid...")
    
    count = 0
    for r in range(rows):
        for c in range(cols):
            left = c * cell_width
            upper = r * cell_height
            right = left + cell_width
            lower = upper + cell_height
            
            # Crop
            cell_img = img.crop((left, upper, right, lower))
            
            # Generate filename
            # Use row_col index or just sequential
            # For this project, we might renamed them manually or mapped later, 
            # but for now let's make them predictable.
            filename = f"{prefix}_{r}_{c}.png"
            output_path = os.path.join(output_dir, filename)
            
            cell_img.save(output_path)
            print(f"Saved {output_path}")
            count += 1

    print(f"Done! Created {count} assets in {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python slice_assets.py <image_path> <output_dir> <rows> <cols> <prefix>")
        sys.exit(1)

    image_path = sys.argv[1]
    output_dir = sys.argv[2]
    rows = int(sys.argv[3])
    cols = int(sys.argv[4])
    prefix = sys.argv[5]

    slice_image(image_path, output_dir, rows, cols, prefix)
