from PIL import Image, ImageChops
import os

def crop_whitespace(img):
    """Crops the whitespace on all four sides of an image"""
    '''pixel = img.getpixel((0,0))
    print(pixel)
    # if pixel is int, convert to tuple
    if isinstance(pixel, int):
        pixel = 0
    else:
        # set pixel to transparent
        pixel = (pixel[0], pixel[1], pixel[2], 0)'''
    bg = Image.new(img.mode, img.size, img.getpixel((0,0)))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    if bbox:
        return img.crop(bbox)

def process_images(directory):
    """Recursively scans a directory and its subdirectories to find PNG files, crops whitespace and saves the modified image back to its original path"""
    for subdir, dirs, files in os.walk(directory):
        for file in files:
            filepath = os.path.join(subdir, file)
            if filepath.lower().endswith(".png"):
                # print(filepath)
                img = Image.open(filepath)
                cropped_img = crop_whitespace(img)
                if cropped_img:
                    cropped_img.save(filepath)

if __name__ == "__main__":
    directory = input("Enter directory path: ")
    process_images(directory)