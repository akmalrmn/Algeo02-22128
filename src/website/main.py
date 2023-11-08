from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import random

app = FastAPI()

# Serve the HTML page from the "templates" directory
@app.get("/", response_class=HTMLResponse)
async def read_gallery(request: Request):
    with open("index.html", "r") as file:
        html_content = file.read()
    return html_content

# Serve static image files from the "images" directory
app.mount("/images", StaticFiles(directory="images"), name="images")

# Assign random values to the images and return them
image_data = []

@app.get("/get_images", response_class=JSONResponse)
async def get_images(page: int = 1):  # Accept the page index as a parameter
    global image_data

    if not image_data:
        images_folder = "images"
        image_urls = []

        if os.path.exists(images_folder) and os.path.isdir(images_folder):
            for filename in os.listdir(images_folder):
                if filename.endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp')):
                    image_url = f"/images/{filename}"
                    random_value = random.randint(1, 100)  # Assign a random value (replace with your logic)
                    image_data.append({"url": image_url, "value": random_value})

        # Sort the images based on their assigned values
        image_data = sorted(image_data, key=lambda x: x["value"])

    # Calculate the start and end index for the requested page
    images_per_page = 6
    start_index = (page - 1) * images_per_page
    end_index = start_index + images_per_page

    # Return the sorted image URLs for the requested page
    return {"images": [image["url"] for image in image_data[start_index:end_index]]}

# Add an endpoint to load and store the image URLs when the button is clicked
@app.get("/load_images")
async def load_images():
    global image_data
    image_data = []  # Clear the stored data
    return {"message": "Images loaded"}
