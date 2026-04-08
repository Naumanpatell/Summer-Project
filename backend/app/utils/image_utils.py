import cv2


def resize(image_path: str, width: int, height: int, output_path: str) -> None:
    """Resize an image to target dimensions."""
    img = cv2.imread(image_path)
    resized = cv2.resize(img, (width, height))
    cv2.imwrite(output_path, resized)


def draw_boxes(image_path: str, detections: list[dict], output_path: str) -> None:
    """Draw bounding boxes on an image from YOLO detection results."""
    img = cv2.imread(image_path)
    for det in detections:
        x1, y1, x2, y2 = [int(v) for v in det["bounding_box"]]
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(img, det["label"], (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    cv2.imwrite(output_path, img)
