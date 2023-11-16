import cv2
import os
import numpy as np
import math
#function blyad


def readImgtoRGB(filepath: str):
        global R
        global G
        global B
    
        #print("readImgtoRGB : setting colours")

        img_file = str(filepath)
        pre_img = cv2.imread(img_file, cv2.IMREAD_COLOR)

        if pre_img is None:
            raise ValueError(f"Error: Unable to read the image at {filepath}")
        
        #resize gambar
        resize_percentage = 50


        width = int(len(pre_img[0]) * resize_percentage / 100)
        height = int(len(pre_img) * resize_percentage / 100)

        ##print(height,width)

        img = cv2.resize(pre_img, (width, height))

        ##print(type(img))
        ##print('BGR shape: ', img.shape)  # Rows, cols, channels

        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        ##print('RGB shape: ', img_rgb.shape)

        R = [[img_rgb[j][i][0] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
        G = [[img_rgb[j][i][1] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
        B = [[img_rgb[j][i][2] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]

def Contrast(p: int, i: int, j:int) -> float:
    retval: float = p * (i-j)**2
    return retval

def Homogeneity(p: int, i: int, j:int) -> float:
    retval: float = p / (1 + (i-j)**2)
    return retval

def Entropy(p: int, i: int, j:int) -> float:
    epsilon = 1e-10
    retval: float = p * math.log10(p + epsilon) #epsilon added to prevent log10(0)
    retval = retval * (-1)
    return retval

#now takes size dirrectly from m
def Sigma(m: list[list[int]],f: callable) -> float:
    #NOTE : I itu baris(up down), J itu kolom (left right)
    baris = len(m)
    kolom = len(m[0])
    total: float = 0
    for i in range(baris):
        for j in range(kolom):
            total += f(m[i][j],i,j)
    return total

def RGBtoGrayscale(r: list([list[int]]),g: list([list[int]]),b: list([list[int]])) -> list([list[int]]):
    #membuat matrix dengan ukuran sama
    gray = lambda red,green,blue : 0.299 * red + 0.587 * green + 0.114 * blue
    result = [[gray(r[i][j],g[i][j],b[i][j]) for j in range(len(r[0]))] for i in range(len(r))]
    return result

# m adalah matrix gambar yang sudah menjadi grayscale
def coocurence(m: list([list[int]]), depth: int, distance: int = 1, angle: int = 0) -> list[list[float]]:
    #NOTE : Asumsi X[i][j] i adalah baris (atas bawah)

    #KAMUS LOKAL
    #baris : int (jumlah baris matrix awal) 
    #kolom : int (jumlah baris matrix ahkir)
    #GLCM : list of list of int
    #totalValue : int (sigma dari nilai dalam GLCM)

    baris = len(m)
    kolom = len(m[0])
    GLCM = [[0 for j in range(depth)] for i in range(depth)]
    #gray level cooucrence matrix

    #rounding ke arah int terjauh dari 0
    pos_round = lambda x : math.ceil(x) if x >= 0 else math.floor(x)

    #offset baris
    row_offset = pos_round(distance * math.sin(math.radians(angle)))
    
    #offset kolom dengan beberapa case khusus karena cos = inf/NaN
    if (angle == 90):
        col_offset = 1
    elif (angle == 270):
        col_offset = -1
    else:
        col_offset = pos_round(distance * math.cos(math.radians(angle)))

    totalValue = 0

    #iterasi matrix dan penambahan langsung dengan transpos nya
    for i in range(baris-row_offset):
        for j in range(kolom-col_offset):
            row = int(m[i][j])
            col = int(m[i + row_offset][j + col_offset])
            GLCM[row][col] += 1
            #karena matrix akan ditambahkan dengan transpose nya sendiri maka
            GLCM[col][row] += 1
            
            #kenapa +2? karena dia atas +1 dua kali
            totalValue += 2

    #normalisasi
    for i in range(depth):
        for j in range(depth):
            GLCM[i][j] = float(GLCM[i][j] / totalValue)

    return(GLCM)


def process_texture(filepath: str) -> list[float]:
    global R
    global G
    global B
    readImgtoRGB(filepath)
    grayscale = RGBtoGrayscale(R, G, B)
    GLCM = coocurence(grayscale,256)
    contrast = Sigma(GLCM,Contrast)
    homogeneity = Sigma(GLCM,Homogeneity)
    entropy = Sigma(GLCM, Entropy)
    return ([contrast, homogeneity, entropy])

def cosineSimilarity(matrix1, matrix2):
    # Calculate dot product
    dot = sum(e1 * e2 for e1, e2 in zip(matrix1, matrix2))
    
    # Calculate norms
    norm1 = math.sqrt(sum(e ** 2 for e in matrix1))
    norm2 = math.sqrt(sum(e ** 2 for e in matrix2))
    
    # Calculate cosine similarity
    similarity = dot / (norm1 * norm2) if (norm1 * norm2) != 0 else 0  # Avoid division by zero
    
    return similarity

def count_files(filepath: str) -> int:
    count = 0
    for filename in os.listdir(filepath):
        count+=1
    return count