import cv2
import numpy as np


def is_sharp(image_path: str, threshold: float = 100.0) -> bool:
    """Return True if the image is sharp enough to process."""
    # TODO: install opencv-python before using
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return False
    variance = cv2.Laplacian(img, cv2.CV_64F).var()
    return variance >= threshold
