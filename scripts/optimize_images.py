import os
from PIL import Image

IMAGE_DIRS = ["public/images", "src/assets"]

def optimize_images():
    total_saved = 0
    count = 0

    for directory in IMAGE_DIRS:
        if not os.path.exists(directory):
            continue
        for root, _, files in os.walk(directory):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in [".jpg", ".jpeg"]:
                    filepath = os.path.join(root, file)
                    size_before = os.path.getsize(filepath)

                    try:
                        temp_path = filepath + ".tmp"
                        with Image.open(filepath) as img:
                            if img.mode != "RGB":
                                img = img.convert("RGB")
                            img.save(temp_path, "JPEG", optimize=True, quality=80)
                        
                        size_after = os.path.getsize(temp_path)
                        if size_after < size_before:
                            os.replace(temp_path, filepath)
                            diff = size_before - size_after
                            total_saved += diff
                            count += 1
                            print(f"Compressed {file}: {size_before/1024:.1f}KB -> {size_after/1024:.1f}KB (-{diff/1024:.1f}KB)")
                        else:
                            os.remove(temp_path)
                    except Exception as e:
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
                        print(f"Error {file}: {e}")

    print(f"\nSuccessfully compressed {count} JPEG images, saved total {total_saved / (1024*1024):.2f} MB")

if __name__ == "__main__":
    optimize_images()
