import cv2
import math
import os
import numpy as np

def normalizeRgb(image):
    return image / 255.0

def RGBtoHSV(R, G, B):
    R = R / 255.0
    G = G / 255.0
    B = B / 255.0
    Cmax = max(R, G, B)
    Cmin = min(R, G, B)

    delta = Cmax - Cmin

    if delta == 0:
        H = 0
    elif Cmax == R:
        H = (60 * ((G - B) / delta) % 360)  # Convert H to [0, 360] range
    elif Cmax == G:
        H = (60 * ((B - R) / delta) + 120)  # Convert H to [0, 360] range
    else:
        H = (60 * ((R - G) / delta) + 240)  # Convert H to [0, 360] range

    if Cmax == 0:
        S = 0
    else:
        S = (delta / Cmax)

    V = Cmax

    return H, S, V

def calculateHistogram(image, bins=8):
    hist = cv2.calcHist([image], [0, 1, 2], None, [bins, bins, bins], [0, 256, 0, 256, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    return hist

def dotProduct(vector1, vector2):
    result = sum(x * y for x, y in zip(vector1, vector2))
    return result

def norm(vector):
    result = math.sqrt(sum(x ** 2 for x in vector))
    return result

def cosineSimilarity(hist1, hist2):
    dot = dotProduct(hist1, hist2)
    norm1 = norm(hist1)
    norm2 = norm(hist2)
    
    similarity = dot / (norm1 * norm2) if (norm1 * norm2) != 0 else 0  # Hindari pembagian oleh nol
    
    return similarity

def cbirColor(input_image, dataset_dir, n=3, bins=8):
    input_image = normalizeRgb(input_image)

    input_hsv = np.zeros_like(input_image, dtype=np.float32)
    for i in range(input_image.shape[0]):
        for j in range(input_image.shape[1]):
            R, G, B = input_image[i, j]
            H, S, V = RGBtoHSV(R, G, B)
            input_hsv[i, j] = [H, S, V]

    input_hist = calculateHistogram(input_hsv, bins)

    similarities = []

    for filename in os.listdir(dataset_dir):
        dataset_image = cv2.imread(os.path.join(dataset_dir, filename))
        dataset_image = normalizeRgb(dataset_image)

        dataset_hsv = np.zeros_like(dataset_image, dtype=np.float32)
        for i in range(dataset_image.shape[0]):
            for j in range(dataset_image.shape[1]):
                R, G, B = dataset_image[i, j]
                H, S, V = RGBtoHSV(R, G, B)
                dataset_hsv[i, j] = [H, S, V]

        dataset_hist = calculateHistogram(dataset_hsv, bins)

        similarity = cosineSimilarity(input_hist, dataset_hist)
        similarities.append(similarity)

    sorted_indices = np.argsort(similarities)[::-1]

    return sorted_indices

# cobain
if __name__ == "__main__":
    dataset_dir = "path/to/dataset_directory"  
    input_image = cv2.imread("input_image.jpg")

    sorted_indices = cbirColor(input_image, dataset_dir, n=3, bins=8)

    for i in sorted_indices:
        dataset_image = cv2.imread(os.path.join(dataset_dir, os.listdir(dataset_dir)[i]))
        cv2.imshow(f"Image {i}", dataset_image)

    cv2.waitKey(0)
    cv2.destroyAllWindows()
