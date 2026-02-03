import os
import sys
from PIL import Image

def slice_and_transparent(image_path, output_dir, rows, cols, prefix):
    try:
        img = Image.open(image_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return

    img_width, img_height = img.size
    cell_width = img_width // cols
    cell_height = img_height // rows

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"Processing {image_path} ({img_width}x{img_height}) into {rows}x{cols} grid...")
    
    count = 0
    for r in range(rows):
        for c in range(cols):
            left = c * cell_width
            upper = r * cell_height
            right = left + cell_width
            lower = upper + cell_height
            
            # Crop
            cell = img.crop((left, upper, right, lower))
            
            # Remove Black Background (Simple Chroma Key)
            datas = cell.getdata()
            new_data = []
            for item in datas:
                # If pixel is very dark (black), make it transparent
                if item[0] < 30 and item[1] < 30 and item[2] < 30:
                    new_data.append((0, 0, 0, 0))
                else:
                    new_data.append(item)
            
            cell.putdata(new_data)
            
            # Save
            filename = f"{prefix}_{r}_{c}.png"
            output_path = os.path.join(output_dir, filename)
            cell.save(output_path, "PNG")
            print(f"Saved {output_path}")
            count += 1

    print(f"Done! Processed {count} assets in {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python process_badges.py <image_path> <output_dir> <rows> <cols> <prefix>")
        sys.exit(1)

    image_path = sys.argv[1]
    output_dir = sys.argv[2]
    rows = int(sys.argv[3])
    cols = int(sys.argv[4])
    prefix = sys.argv[5]

    slice_and_transparent(image_path, output_dir, rows, cols, prefix)
