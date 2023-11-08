import cv2
import os
import numpy as np
import math

def calculateHistogram(image, bins=8):
    # Normalisasi gambar
    image = image / 255.0

    # Membagi gambar menjadi tiga channel RGB
    r, g, b = cv2.split(image)

    # Menginisialisasi histogram
    hist = [0] * (bins * bins * bins)

    for i in range(image.shape[0]):
        for j in range(image.shape[1]):
            R, G, B = r[i, j], g[i, j], b[i, j]

            # Menghitung Cmax dan Cmin
            Cmax = max(R, G, B)
            Cmin = min(R, G, B)
            delta = Cmax - Cmin

            # Hitung nilai HSV
            if delta == 0:
                H = 0
            elif Cmax == R:
                H = (60 * (((G - B) / delta) % 6))
            elif Cmax == G:
                H = (60 * (((B - R) / delta) + 2))
            else:
                H = (60 * (((R - G) / delta) + 4))

            if Cmax == 0:
                S = 0
            else:
                S = delta / Cmax

            V = Cmax

            # Normalisasi ke dalam jumlah bin
            H = min(int(H / (360 / bins)), bins - 1)
            S = min(int(S / (1 / bins)), bins - 1)
            V = min(int(V / (1 / bins)), bins - 1)

            # Hitung indeks histogram
            hist_idx = H * bins * bins + S * bins + V

            # Tingkatkan hitungan pada indeks histogram yang sesuai
            hist[hist_idx] += 1

    # Normalisasi histogram
    total = sum(hist)
    hist = [h / total for h in hist]

    return hist

def cosineSimilarity(hist1, hist2):
    # Calculate dot product
    dot = sum(h1 * h2 for h1, h2 in zip(hist1, hist2))
    
    # Calculate norms
    norm1 = math.sqrt(sum(h ** 2 for h in hist1))
    norm2 = math.sqrt(sum(h ** 2 for h in hist2))
    
    # Calculate cosine similarity
    similarity = dot / (norm1 * norm2) if (norm1 * norm2) != 0 else 0  # Avoid division by zero
    
    return similarity

def cbirColor(input_image, dataset_dir, n=3, bins=8):
    input_hist = calculateHistogram(input_image, bins)

    similarities = []

    for filename in os.listdir(dataset_dir):
        dataset_image = cv2.imread(os.path.join(dataset_dir, filename))
        dataset_hist = calculateHistogram(dataset_image, bins)

        similarity = cosineSimilarity(input_hist, dataset_hist)
        similarities.append(similarity)

    sorted_indices = np.argsort(similarities)[::-1]
    sorted_similarities = np.sort(similarities)[::-1]

    return sorted_indices, sorted_similarities

# Try it out
if __name__ == "__main__":
    dataset_dir = "src/website/images/"  
    input_image = cv2.imread("src/website/images/untitled2.png")

    sorted_indices, sorted_similarities = cbirColor(input_image, dataset_dir, n=3, bins=8)

    # Get the top 5 most similar images
    top_5_indices = sorted_indices[:5]

    for i in range(len(top_5_indices)):
        dataset_image = cv2.imread(os.path.join(dataset_dir, os.listdir(dataset_dir)[top_5_indices[i]]))
        print(f"Image {top_5_indices[i]} - Similarity: {sorted_similarities[i]}")
        cv2.imshow(f"Image {top_5_indices[i]} - Similarity: {sorted_similarities[i]}", dataset_image)

    cv2.waitKey(0)
    cv2.destroyAllWindows()