let mode = "TEKSTUR";
let currentPage = 1;
let fileUploaded = false;
let datasetUploaded = false;
let maxPage = 99;
let deleteExisting = "FALSE";
async function displayUpload() {
    const response = await fetch(`/display_upload`);
    const data = await response.json();
    const imageContainer = document.getElementById('upload-image-container');
    imageContainer.innerHTML = '';  // Clear existing images
    if (data.image) {
        const imgElement = document.createElement('img');
        imgElement.src = data.image;
        imgElement.style.maxWidth = '300px';
        imgElement.style.margin = '10px';
        imageContainer.appendChild(imgElement);
    }
}

function swap_mode(){
    if (mode == "TEKSTUR"){
        mode = "WARNA";
    }
    else if (mode == "WARNA"){
        mode = "TEKSTUR";
    }
}

function persistDataset(){
    if (deleteExisting == "FALSE"){
        deleteExisting = "TRUE";
        console.log("Dataset is now deleted per upload");
    }
    else{
        deleteExisting = "FALSE";
        console.log("Dataset is now persistent");
    }
}

async function fetchImages(page) {
    
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';  // Clear existing images
    if (datasetUploaded && fileUploaded){
    console.log("mode :",mode);
    const response = await fetch(`/get_images?page=${page}&mode=${mode}`);
    const data = await response.json();
    
    maxPage = data.max_page
    data.images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.url;
        imgElement.style.maxWidth = '300px';
        imgElement.style.margin = '10px';
        imageContainer.appendChild(imgElement);
    });
    // Update the page indicator
    const pageIndicator = document.getElementById('pageIndicator');
    pageIndicator.textContent = `Page ${page}`;
    }
}
function reset(){
    fetch(`/reset`);
}
function uploadSearchImage() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    if (files.length > 0) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        fileUploaded = true
        fetch(`/upload_search`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
                fileUploaded = true;
                displayUpload();
                console.log('Search file uploaded:', data.filenames);
        })
        .catch(error => {
            console.error('Error uploading files:', error);
        });
    }
    
}
function test_ping(){
    fetch(`/test_ping`);
    console.log("Ping");
}

function uploadDatasetImage() {
    console.log("Trigger dataset upload");
    const fileInput = document.getElementById('datasetInput');
    const files = fileInput.files;
    if (files.length > 0) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        fetch(`/upload_dataset?delete_existing=${deleteExisting}`, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                datasetUploaded = true;
                console.log('Dataset uploaded:', data.filenames);
                if (datasetUploaded && fileUploaded){
                    fetchImages(1);
                }
                // after uploading dataset, attempt to calculate images
            })
            .catch(error => {
                console.error('Error uploading dataset files:', error);
            });
    }
    
}
function forceload(){
    fetch('/force_load');
    displayUpload();
    fileUploaded = true;
    datasetUploaded = true;
    fetchImages(1);
}
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const imageUploadButton = document.getElementById('uploadImageButton');
const datasetUploadButton = document.getElementById('datasetImageButton');
/*
imageUploadButton.addEventListener('click',() => {
    uploadSearchImage();
})
*/
nextPageButton.addEventListener('click',() =>{
    console.log("click");
    if (currentPage < maxPage) {
        console.log("clock");
        currentPage++;
        fetchImages(currentPage);
        console.log(maxPage);
    }
    else{
        console.log(currentPage);
    }
});
prevPageButton.addEventListener('click',() =>{
    console.log("clack");
    if (currentPage > 1) {
        console.log("clock");
        currentPage--;
        fetchImages(currentPage);
    }
});
window.onload = reset;
