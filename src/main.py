def RGBtoHSV(R, G, B) :
    R = R / 255
    G = G / 255
    B = B / 255
    Cmaks = max(R, G, B)
    Cmin = min(R, G, B)

    delta = Cmaks - Cmin

    if delta == 0:
        H = 0
    elif Cmaks == R:
        H = (60 * ((G - B) / delta) % 6) 
    elif Cmaks == G:
        H = (60 * ((B - R) / delta) + 2)
    else:
        H = (60 * ((R - G) / delta) + 4) 

    if Cmaks == 0:
        S = 0
    else:
        S = (delta / Cmaks)

    V = Cmaks 

    return H, S, V

















