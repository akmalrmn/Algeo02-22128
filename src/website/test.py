
from typing import List
import os
import testing_package as tp

current_directory = os.getcwd()


# Global variables
image_data = []
img_data_dict = {}
current_mode = "TEKSTUR"

log_file = None
with open("logs/log.txt", "a") as log_file:
    log_file.write("start of log\n")

def get_images(page: int = 1):
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
    image_data = sorted(image_data, key=lambda x: x["similarity"])

    # Calculate the start and end index for the requested page
    images_per_page = 6
    start_index = (page - 1) * images_per_page
    end_index = start_index + images_per_page

    # Return the sorted image URLs for the requested page
    for image in image_data:
        print(image)
    return {"images": [image["url"] for image in image_data[start_index:end_index]],"max_page": (count//images_per_page)}

def process_search(mode: str = "TEKSTUR"):
    global search_value
    global current_mode
    global current_directory

    images_folder = "uploaded"
    if os.path.exists(images_folder) and os.path.isdir(images_folder):
            for filename in os.listdir(images_folder):
                print("process_search :",filename)
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                
                    web_path = f"/uploaded/{filename}"

                    relative_path = f"uploaded/{filename}"
                    full_path = os.path.join(current_directory, relative_path)
                    

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


def process_dataset(mode: str = "TEKSTUR"):
        global current_mode

        images_folder = "dataset"
        image_urls = []

        count = 0
        if os.path.exists(images_folder) and os.path.isdir(images_folder) and tp.count_files("uploaded") >= 1:
            
            for filename in os.listdir(images_folder):
                print("process_dataset :",filename)
                if filename.endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    
                    web_path = f"/{images_folder}/{filename}"
                    relative_path = f"{images_folder}/{filename}"
                    full_path = os.path.join(current_directory, relative_path)
                
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


# Register the cleanup function to run when the application exits
process_search()
process_dataset()
get_images(1)