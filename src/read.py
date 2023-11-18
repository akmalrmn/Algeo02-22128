import cv2
import numpy as np


def readImgtoRGB(filepath: str):
    global R
    global G
    global B
    img_file = str(filepath)
    img = cv2.imread(img_file, cv2.IMREAD_COLOR)
    
    # Resize gambar supaya ukuran nya 300 pixel berdasarkan width

    target_width = 200

    if (len(img[0]) > target_width):
        resize_percentage = target_width*100/len(img[0])
        width = int(len(img[0]) * resize_percentage / 100)
        height = int(len(img) * resize_percentage / 100)
        img = cv2.resize(img, (width, height))
    
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    print('RGB shape: ', img_rgb.shape)
    
    R = [[img_rgb[j][i][0] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
    G = [[img_rgb[j][i][1] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
    B = [[img_rgb[j][i][2] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
    