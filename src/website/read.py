import cv2
import numpy as np


def readImgtoRGB(filepath: str):
    global R
    global G
    global B
    img_file = str(filepath)
    pre_img = cv2.imread(img_file, cv2.IMREAD_COLOR)
    
    #resize gambar
    resize_percentage = 50
    
    
    width = int(len(pre_img[0]) * resize_percentage / 100)
    height = int(len(pre_img) * resize_percentage / 100)
    
    print(height,width)
    
    img = cv2.resize(pre_img, (width, height))
    
    print(type(img))
    print('BGR shape: ', img.shape)  # Rows, cols, channels
    
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    print('RGB shape: ', img_rgb.shape)
    
    R = [[img_rgb[j][i][0] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
    G = [[img_rgb[j][i][1] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
    B = [[img_rgb[j][i][2] for i in range(len(img_rgb[0]))] for j in range(len(img_rgb))]
    