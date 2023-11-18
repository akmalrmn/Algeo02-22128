from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import List
import math
import os
import read as r
import CBIR_Tekstur as cbt
import cbir_warna as cw
import atexit
import time

current_directory = os.getcwd()

# Create important folders
os.makedirs("/website/uploaded", exist_ok=True)
os.makedirs("/website/dataset", exist_ok=True)

app = FastAPI()

# Global variables
img_data_dict = {}
last_mode = None

app = FastAPI()


styles_path = "website/styles"
# Mount the styles folder
if os.path.exists("website/styles"):
    app.mount("/styles", StaticFiles(directory="website/styles"), name="styles")
    print("STYLES MOUNTED")
else:
    print("Styles folder not found")

# Serve the HTML page
@app.get("/", response_class=HTMLResponse)
async def read_gallery(request: Request):
    with open("website/index.html", "r") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content, status_code=200)



@app.get("/display_upload")
async def display_upload():

    global current_directory

    upload_folder = "website/uploaded"

    if os.path.exists(upload_folder) and os.path.isdir(upload_folder):
            for filename in os.listdir(upload_folder):
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    #mount image to server
                    app.mount("/uploaded", StaticFiles(directory=upload_folder), name="images")
                    web_path = f"/uploaded/{filename}"
            return {"image":web_path}


@app.get("/get_images")
async def get_images(page: int = 1, mode = "TEKSTUR"):
    global img_data_dict
    global search_value
    global last_mode

    process_search(mode)
    process_dataset(mode)

    last_mode = mode

    image_data = []
    images_folder = "dataset"
    count = 0
    
    for filename in img_data_dict:
        image_url = f"/{images_folder}/{filename}"
        
        #log_file.write("fetching",image_url,"\n")

        count += 1
        print(img_data_dict)
        print(filename)
        print(img_data_dict[filename])
        value = cosineSimilarity(search_value,img_data_dict[filename]["value"])
        image_data.append({"url": image_url, "similarity": value})

        # Sort the images based on their assigned values
    image_data = sorted(image_data, key=lambda x: x["similarity"], reverse= True)
    print(image_data)

    # Calculate the start and end index for the requested page
    images_per_page = 6
    start_index = (page - 1) * images_per_page
    end_index = start_index + images_per_page

    # Return the sorted image URLs for the requested page
    return {
    "images": [{"url": image["url"], "similarity": image["similarity"]} for image in image_data[start_index:end_index]],
    "max_page": (count // images_per_page)
    }
# Process image

@app.get("/reset")
async def reset():
    global img_data_dict
    global last_mode
    last_mode = None
    img_data_dict = {}
    return {"message": "resetted"}

@app.get("/force_load")
async def forceLoad():
    app.mount("/uploaded", StaticFiles(directory="website/uploaded"), name="images")
    get_images(1)

@app.post("/upload_dataset")
async def upload_dataset(files: List[UploadFile] = File(...), delete_existing="FALSE"):
    global img_data_dict
    global last_mode
    dataset_folder = "website/dataset"

    if (not os.path.exists(dataset_folder)):
        os.makedirs(dataset_folder,exist_ok=True)

    if delete_existing == "TRUE":
        print("Deleting existing dataset")
        # Delete existing images in the folder
        for existing_file in os.listdir(dataset_folder):
            file_path = os.path.join(dataset_folder, existing_file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")

        # Reset img_data_dict to an empty dictionary
        img_data_dict = {}
        # Last mode is set to none to induce recalculation
        last_mode = None

    # Save the newly uploaded images
    for file in files:
        filename = os.path.join(dataset_folder, file.filename)
        with open(filename, "wb") as image_file:
            image_file.write(file.file.read())

    return {"filenames": [file.filename for file in files]}

#works like a charm
@app.post("/upload_search")
async def upload_search(files: List[UploadFile] = File(...)):
    # Path to the "uploaded" folder
    upload_folder = "website/uploaded"

    if (not os.path.exists(upload_folder)):
        os.makedirs(upload_folder,exist_ok=True)

    # Delete existing image in the folder
    for existing_file in os.listdir(upload_folder):
        file_path = os.path.join(upload_folder, existing_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

    # Save the newly uploaded images
    for file in files:

        #img_data_dict[file.filename] = None

        filename = os.path.join(upload_folder, file.filename)
        with open(filename, "wb") as image_file:
            image_file.write(file.file.read())

    return {"filenames": [file.filename for file in files]}

def process_search(mode: str = "TEKSTUR"):
    global search_value
    global current_mode
    global current_directory

    images_folder = "website/uploaded"
    if os.path.exists(images_folder) and os.path.isdir(images_folder):
            for filename in os.listdir(images_folder):
                start_time = time.time()
                print("process_search :",filename,end=' ')
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                
                    web_path = f"/uploaded/{filename}"

                    relative_path = f"{images_folder}/{filename}"
                    full_path = os.path.join(current_directory, relative_path)
                    
                    #app.mount("/uploaded", StaticFiles(directory=images_folder), name="uploaded")

                    if mode == "TEKSTUR" and (last_mode != "TEKSTUR"):
                        value = cbt.process_texture(full_path)
                        search_value = value

                    elif mode == "WARNA" and (last_mode != "WARNA"):
                        value = cw.process_color(full_path)
                        search_value = value
                    else:
                        print("bruh")

                    

                    #NOTE : NANTI MASUKIN SINI
                    #elif mode == "WARNA":
            
                    
                end_time = time.time()
                print(f"[{end_time - start_time}]")


def process_dataset(mode: str = "TEKSTUR"):
        global current_mode

        images_folder = "website/dataset"
        image_urls = []

        count = 0
        if os.path.exists(images_folder) and os.path.isdir(images_folder) and count_files("website/uploaded") >= 1:
            
            for filename in os.listdir(images_folder):
                start_time = time.time()
                print("process_dataset :",filename,end=" ")
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    
                    web_path = f"/{images_folder}/{filename}"
                    relative_path = f"{images_folder}/{filename}"
                    full_path = os.path.join(current_directory, relative_path)
                    app.mount("/dataset", StaticFiles(directory=images_folder), name="dataset")
                
                    count += 1

                    print(mode)
                    if mode == "TEKSTUR" and (last_mode != "TEKSTUR" or not filename in img_data_dict):
                        value = cbt.process_texture(full_path)
                        img_data_dict[filename] = {"value":value}

                    elif mode == "WARNA" and (last_mode != "WARNA" or not filename in img_data_dict):
                        value = cw.process_color(full_path)
                        img_data_dict[filename] = {"value":value}
                    else:
                        print("bruh")

                    

                    #NOTE : NANTI MASUKIN SINI
                    #elif mode == "WARNA":
                end_time = time.time()
                print(f"[{end_time - start_time}]")

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
