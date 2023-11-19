import cv2
import os
import numpy as np
import time

def hue(r, g, b, delta, Cmax):
    # Calculate hue
    epsilon = 1e-8  # to avoid division by zero
    delta[delta == 0] = epsilon
    h = np.zeros_like(delta)
    h[Cmax == r] = (60 * (((g - b) / delta) % 6))[Cmax == r]
    h[Cmax == g] = (60 * (((b - r) / delta) + 2))[Cmax == g]
    h[Cmax == b] = (60 * (((r - g) / delta) + 4))[Cmax == b]
    h = h/360.0
    return h

def saturation(cmax, delta):
    # Calculate saturation
    epsilon = 1e-8  # to avoid division by zero
    s = np.where(cmax == 0, 0, delta / (cmax + epsilon))
    return s

def delta(r, g, b):
    # Calculate delta
    delta = np.maximum.reduce([r, g, b]) - np.minimum.reduce([r, g, b])
    return delta

def calculateAverageHSV(image):
    image = image / 255.0
    r, g, b = cv2.split(image)
    Cmax = np.maximum.reduce([r, g, b])
    # Calculate average HSV values
    delta_values = delta(r, g, b)
    h_avg = np.mean(hue(r, g, b, delta_values, Cmax))
    s_avg = np.mean(saturation(Cmax, delta_values))
    V = Cmax
    v_avg = np.mean(V)

    return h_avg, s_avg, v_avg

def calculateHistogram(image, n=4, bins=8):
    hist = []
    for i in range(n):
        for j in range(n):
            block = image[i * (image.shape[0] // n):(i + 1) * (image.shape[0] // n),
                          j * (image.shape[1] // n):(j + 1) * (image.shape[1] // n)]
            block_avg_hsv = calculateAverageHSV(block)
            hist.extend(block_avg_hsv)
    return np.divide(hist, np.sum(hist))

def cosineSimilarity(hist1, hist2):
    dot = np.dot(hist1, hist2)
    norm1 = np.sqrt(np.dot(hist1, hist1))
    norm2 = np.sqrt(np.dot(hist2, hist2))
    similarity = dot / (norm1 * norm2) if (norm1 * norm2) != 0 else 0
    return similarity

def cbirColor(input_image, dataset_dir, bins=8):
    input_hist = calculateHistogram(input_image, bins)
    similarities = []
    for entry in os.scandir(dataset_dir):
        if entry.is_file():
            dataset_image = cv2.imread(entry.path)
            dataset_hist = calculateHistogram(dataset_image, bins)
            similarity = cosineSimilarity(input_hist, dataset_hist)
            similarities.append(similarity)
    sorted_indices = np.argsort(similarities)[::-1]
    sorted_similarities = np.sort(similarities)[::-1]
    return sorted_indices, sorted_similarities

def run():
    dataset_dir = "src/dataset" 
    input_image = cv2.imread("src/dataset/4.jpg ")
    start_time = time.time()
    sorted_indices, sorted_similarities = cbirColor(input_image, dataset_dir, bins=8)
    end_time = time.time()
    elapsed_time = end_time - start_time

    # Counter for images with similarity above 60%
    count = 0

    # Iterate over the sorted indices and similarities
    for i, similarity in zip(sorted_indices, sorted_similarities):
        # If the similarity is above 60%
        if similarity > 0.6:
            # Read the image
            image_path = os.path.join(dataset_dir, os.listdir(dataset_dir)[i])
            image = cv2.imread(image_path)
            # Display the image
            cv2.imshow(f"Image {i} - Similarity: {similarity}", image)
            print(f"{similarity}")
            count += 1
    # Print the number of images with similarity above 60% and the execution time
    print(f"Number of images with similarity above 60%: {count - 1}")
    print(f"Elapsed time: {elapsed_time:.2f} seconds")
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def process_color(filepath: str) -> list[float]:
    image = cv2.imread(filepath)
    h_avg, s_avg, v_avg = calculateAverageHSV(image)
    return [h_avg, s_avg, v_avg]

if __name__ == "__main__":
    run()
