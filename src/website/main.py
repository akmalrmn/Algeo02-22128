from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import List
import logging
import os
import testing_package as tp
import atexit
import time

current_directory = os.getcwd()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

# Global variables
image_data = []
img_data_dict = {}
current_mode = "TEKSTUR"

log_file = None
with open("logs/log.txt", "a") as log_file:
    log_file.write("start of log\n")

# Serve the HTML page
@app.get("/", response_class=HTMLResponse)
async def read_gallery(request: Request):
    with open("index.html", "r") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content, status_code=200)


@app.get("/test_ping")
async def ping():
    print("Hello")
    return {"Message":"Hello"}

@app.get("/display_upload")
async def display_upload():

    global current_directory

    images_folder = "uploaded"
    if os.path.exists(images_folder) and os.path.isdir(images_folder):
            for filename in os.listdir(images_folder):
                print("process_search :",filename)
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    web_path = f"/uploaded/{filename}"
            return {"image":web_path}



@app.get("/get_images")
async def get_images(page: int = 1):
    global img_data_dict
    global search_value

    #log_file.write("fetching images\n")

    #process_search()
    #process_dataset()

    image_data = []
    images_folder = "dataset"
    count = 0
    for filename in img_data_dict:
        image_url = f"/{images_folder}/{filename}"
        
        #log_file.write("fetching",image_url,"\n")

        count += 1
        print(img_data_dict[filename])
        value = tp.cosineSimilarity(search_value,img_data_dict[filename]["value"])  # Assign a random value (replace with your logic)
        image_data.append({"url": image_url, "similarity": value})

        # Sort the images based on their assigned values
    image_data = sorted(image_data, key=lambda x: x["similarity"], reverse= True)
    print(image_data)

    # Calculate the start and end index for the requested page
    images_per_page = 6
    start_index = (page - 1) * images_per_page
    end_index = start_index + images_per_page

    # Return the sorted image URLs for the requested page
    return {"images": [image["url"] for image in image_data[start_index:end_index]],"max_page": (count//images_per_page)}

# Process image

# Add an endpoint to load and store the image URLs when the button is clicked
@app.get("/reset")
async def reset():
    global image_data
    global img_data_dict
    img_data_dict = {}
    image_data = []  # Clear the stored data
    return {"message": "resetted"}

@app.get("/force_load")
async def forceLoad():
    process_search()
    process_dataset()
    logger.info("FORCE LODADED")

@app.post("/upload_dataset")
async def upload_dataset(files: List[UploadFile] = File(...)):
    dataset_folder = "dataset"

    # Save the newly uploaded images
    for file in files:
        # Add CBIR value to image
        img_data_dict[file.filename] = None

        filename = os.path.join(dataset_folder, file.filename)
        with open(filename, "wb") as image_file:
            image_file.write(file.file.read())

    process_dataset()
    return {"filenames": [file.filename for file in files]}
# Clear existing dataset images


@app.post("/upload_search")
async def upload_search(files: List[UploadFile] = File(...)):
    # Path to the "uploaded" folder
    upload_folder = "uploaded"

    # Clear existing images in the folder
    for existing_file in os.listdir(upload_folder):
        file_path = os.path.join(upload_folder, existing_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

    # Save the newly uploaded images
    for file in files:

        

        # Add CBIR value to image
        img_data_dict[file.filename] = None

        filename = os.path.join(upload_folder, file.filename)
        with open(filename, "wb") as image_file:
            image_file.write(file.file.read())

        app.mount("/uploaded", StaticFiles(directory="uploaded"), name="images")


    process_search()
    return {"filenames": [file.filename for file in files]}

def process_search(mode: str = "TEKSTUR"):
    global search_value
    global current_mode
    global current_directory

    images_folder = "uploaded"
    if os.path.exists(images_folder) and os.path.isdir(images_folder):
            for filename in os.listdir(images_folder):
                start_time = time.time()
                print("process_search :",filename,end=' ')
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                
                    web_path = f"/uploaded/{filename}"

                    relative_path = f"uploaded/{filename}"
                    full_path = os.path.join(current_directory, relative_path)
                    
                    app.mount("/uploaded", StaticFiles(directory="uploaded"), name="uploaded")

                    if mode == "TEKSTUR":
                        #ini nanti pindahin ke CBIR_TEKSTUR
                        if (current_mode == "TEKSTUR" and not filename in img_data_dict):
                            value = tp.process_texture(full_path)
                        else:
                            value = tp.process_texture(full_path)

                    img_data_dict[filename] = {"value":value}

                    #NOTE : NANTI MASUKIN SINI
                    #elif mode == "WARNA":
            
                    search_value = value
                end_time = time.time()
                print(f"[{end_time - start_time}]")


def process_dataset(mode: str = "TEKSTUR"):
        global current_mode

        images_folder = "dataset"
        image_urls = []

        count = 0
        if os.path.exists(images_folder) and os.path.isdir(images_folder) and tp.count_files("uploaded") >= 1:
            
            for filename in os.listdir(images_folder):
                start_time = time.time()
                print("process_dataset :",filename,end=" ")
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    
                    web_path = f"/{images_folder}/{filename}"
                    relative_path = f"{images_folder}/{filename}"
                    full_path = os.path.join(current_directory, relative_path)
                    app.mount("/dataset", StaticFiles(directory="dataset"), name="dataset")
                
                    count += 1

                    if mode == "TEKSTUR":
                        #ini nanti pindahin ke CBIR_TEKSTUR
                        if (current_mode == "TEKSTUR" and not filename in img_data_dict):
                            value = tp.process_texture(full_path)
                        else:
                            #reprocess all values if changing mode
                            value = tp.process_texture(full_path)

                    img_data_dict[filename] = {"value":value}

                    #NOTE : NANTI MASUKIN SINI
                    #elif mode == "WARNA":
                end_time = time.time()
                print(f"[{end_time - start_time}]")

def cleanup_on_exit():
    with open("logs/log.txt", "a") as log:
        log.write("End of log\n")
    
# Register the cleanup function to run when the application exits
atexit.register(cleanup_on_exit)