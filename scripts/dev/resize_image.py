from PIL import Image, ImageSequence
import os


def resize_images_in_directory(directory, new_size):
    """Resizes all images in a directory to the specified size and saves them with a suffix added to the original names"""
    for filename in os.listdir(directory):
        # Save the resized frames as a new animated PNG
        image_name = os.path.splitext(filename)[0]
        # Avoid overwriting resized images
        if image_name.endswith("-resized"):
            continue

        if filename.lower().endswith((".png")):
            image_path = os.path.join(directory, filename)
            image = Image.open(image_path)

            # Check if the image is animated
            if image.info.get("duration"):
                # Resize each frame in the animation
                frames = []
                durations = []
                for frame in ImageSequence.Iterator(image):
                    # Resize the frame
                    frame_resized = frame.resize(new_size, Image.LANCZOS)
                    frame_resized = frame_resized.convert("RGBA")

                    frames.append(frame_resized)
                    # Get the duration of the frame
                    durations.append(frame.info["duration"])

                output_path = os.path.join(directory, f"{image_name}-resized.gif")
                frames[0].save(
                    output_path,
                    save_all=True,
                    append_images=frames[1:],
                    loop=0,
                    duration=durations,
                    transparency=0,
                    disposal=2,
                )
            else:
                # Handle non-animated images
                # Add transparent pixels to the image if it is not square
                if image.size[0] != image.size[1]:
                    max_dimension = max(image.size)
                    new_image = Image.new(
                        "RGBA", (max_dimension, max_dimension), (0, 0, 0, 0)
                    )
                    new_image.paste(
                        image,
                        (
                            (max_dimension - image.size[0]) // 2,
                            (max_dimension - image.size[1]) // 2,
                        ),
                    )
                    image = new_image

                resized_image = image.resize(new_size, Image.LANCZOS)

                # Add "-resized.png" to the original image name
                output_path = os.path.join(directory, f"{image_name}-resized.png")

                resized_image.save(output_path)


if __name__ == "__main__":
    directory_path = input("Enter the directory path: ")
    resize_images_in_directory(directory_path, (96, 96))
