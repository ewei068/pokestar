from PIL import Image
import os

def resize_images_in_directory(directory, new_size):
    """Resizes all images in a directory to the specified size and saves them with a suffix added to the original names"""
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png')):
            image_path = os.path.join(directory, filename)
            image = Image.open(image_path)

            # add transparent pixels to the image if it is not square
            if image.size[0] != image.size[1]:
                max_dimension = max(image.size)
                new_image = Image.new('RGBA', (max_dimension, max_dimension), (0, 0, 0, 0))
                new_image.paste(image, ((max_dimension - image.size[0]) // 2, (max_dimension - image.size[1]) // 2))
                image = new_image

            resized_image = image.resize(new_size, Image.ANTIALIAS)
            
            # Get the original image name without extension
            image_name = os.path.splitext(filename)[0]

            # if image ends with -resized.png, ignore
            if image_name.endswith("-resized"):
                continue
            
            # Add "-resized.png" to the original image name
            output_path = os.path.join(directory, f"{image_name}-resized.png")
            
            resized_image.save(output_path)

if __name__ == "__main__":
    directory_path = input("Enter the directory path: ")
    resize_images_in_directory(directory_path, (96, 96))