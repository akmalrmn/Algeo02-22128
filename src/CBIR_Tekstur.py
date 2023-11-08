
import math
#function blyad

testMatrix = [[0,0,1],[1,2,3],[2,3,2]]

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


    