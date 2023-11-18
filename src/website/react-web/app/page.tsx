"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useCallback,
  Component,
} from "react";
import Switch from "react-switch";
import { useDropzone } from "react-dropzone";
import Navbar from "./components/Navbar";
import Image, { StaticImageData } from "next/image";
import placeholder from "@/public/placeholder.jpg";
import akmal from "@/public/profilepic/akmal.jpeg";
import andhika from "@/public/profilepic/andhika.jpeg";
import justin from "@/public/profilepic/justin.jpeg";

export default function Home() {
  const [maxPage, setMaxPage] = useState(99);
  const [displayedImage, setDisplayedImage] =
    useState<StaticImageData>(placeholder);
  const [andhikaimage] = useState<StaticImageData>(andhika);
  const [akmalimage] = useState<StaticImageData>(akmal);
  const [justinimage] = useState<StaticImageData>(justin);
  const [isReset, setIsReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState("Color");
  const [currentPage, setCurrentPage] = useState(1);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [datasetUploaded, setDatasetUploaded] = useState(false);
  const [deleteExisting, setDeleteExisting] = useState("FALSE");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isReset) {
      fetch(`/reset`); // Call reset logic here using fetch or perform other actions
      setIsReset(false); // Reset the isReset state back to false
    }
  }, [isReset]);
  function reset() {
    setIsReset(true); // Set isReset to true to trigger the useEffect
  }

  async function displayUpload() {
    const response = await fetch(`/display_upload`);
    const data = await response.json();
    const imageContainer = document.getElementById("upload-image-container");

    if (imageContainer) {
      imageContainer.innerHTML = ""; // Clear existing images

      if (data.image) {
        const imgElement = document.createElement("img");
        imgElement.src = data.image;
        imgElement.style.maxWidth = "300px";
        imgElement.style.margin = "10px";
        imageContainer.appendChild(imgElement);
      }
    } else {
      console.error(
        "Element with ID 'upload-image-container' not found in the DOM"
      );
    }
  }

  function swap_mode() {
    setMode((prevMode) => (prevMode === "Texture" ? "Color" : "Texture"));
  }

  function persistDataset() {
    setDeleteExisting((prevDeleteExisting) =>
      prevDeleteExisting === "FALSE" ? "TRUE" : "FALSE"
    );
  }

  async function fetchImages(page) {
    const imageContainer = document.getElementById("image-container");
    const pageIndicator = document.getElementById("pageIndicator");

    if (imageContainer && pageIndicator && datasetUploaded && fileUploaded) {
      imageContainer.innerHTML = ""; // Clear existing images
      console.log("mode :", mode);

      try {
        const response = await fetch(`/get_images?page=${page}&mode=${mode}`);
        const data = await response.json();

        // Update maxPage using setMaxPage
        setMaxPage(data.max_page);

        data.images.forEach((image) => {
          const imgElement = document.createElement("img");
          imgElement.src = image.url;
          imgElement.style.maxWidth = "300px";
          imgElement.style.margin = "10px";
          imageContainer.appendChild(imgElement);
        });

        // Update the page indicator text content
        pageIndicator.textContent = `Page ${page}`;
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }
  }

  function uploadSearchImage() {
    const fileInput = document.getElementById(
      "fileInput"
    ) as HTMLInputElement | null;

    if (fileInput?.files && fileInput.files.length > 0) {
      const formData = new FormData();
      for (const file of Array.from(fileInput.files)) {
        formData.append("files", file);
      }

      fetch(`/upload_search`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setFileUploaded(true); // Update fileUploaded state
          displayUpload();
          console.log("Search file uploaded:", data.filenames);

          // Read the uploaded image and update displayedImage state
          const uploadedImage = fileInput.files[0];
          const reader = new FileReader();

          reader.onloadend = () => {
            setDisplayedImage(reader.result as string); // Update displayedImage state with the uploaded image URL
          };

          reader.readAsDataURL(uploadedImage); // Read the uploaded file as a data URL
        })
        .catch((error) => {
          console.error("Error uploading files:", error);
        });
    }
  }

  function triggerImageUpload() {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  }

  function test_ping() {
    fetch(`/test_ping`);
    console.log("Ping");
  }

  function uploadDatasetImage() {
    console.log("Trigger dataset upload");
    const fileInput = document.getElementById(
      "datasetInput"
    ) as HTMLInputElement | null;

    if (fileInput?.files && fileInput.files.length > 0) {
      const formData = new FormData();
      for (const file of Array.from(fileInput.files)) {
        formData.append("files", file);
      }

      fetch(`/upload_dataset?delete_existing=${deleteExisting}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setDatasetUploaded(true); // Update datasetUploaded state
          console.log("Dataset uploaded:", data.filenames);
          if (datasetUploaded && fileUploaded) {
            fetchImages(1);
          }
          // after uploading dataset, attempt to calculate images
        })
        .catch((error) => {
          console.error("Error uploading dataset files:", error);
        });
    }
  }

  const forceload = async () => {
    try {
      await fetch("/force_load");
      await displayUpload();
      setFileUploaded(true);
      setDatasetUploaded(true);
      fetchImages(1);
      modeText.innerText = mode;
    } catch (error) {
      console.error("Error during force load:", error);
    }
  };

  const modeText = document.getElementById("mode_text");

  async function displayUpload() {
    const response = await fetch(`/display_upload`);
    const data = await response.json();
    const imageContainer = document.getElementById("upload-image-container");
    imageContainer.innerHTML = ""; // Clear existing images
    if (data.image) {
      const imgElement = document.createElement("img");
      imgElement.src = data.image;
      imgElement.style.height = "100%";
      imgElement.style.margin = "10px";
      imageContainer.appendChild(imgElement);
    }
  }

  async function fetchImages(page) {
    const imageContainer = document.getElementById("image-container");
    imageContainer.innerHTML = ""; // Clear existing images

    if (datasetUploaded && fileUploaded) {
      console.log("mode :", mode);
      try {
        const response = await fetch(`/get_images?page=${page}&mode=${mode}`);
        const data = await response.json();

        setMaxPage(data.max_page); // Update maxPage state

        data.images.forEach((image) => {
          const divElement = document.createElement("div");
          divElement.classList.add("result-place");

          // Create an img element
          const imgElement = document.createElement("img");
          imgElement.src = image.url;
          imgElement.style.maxWidth = "300px";
          imgElement.style.margin = "10px";
          imgElement.style.maxHeight = "35vh";
          imgElement.style.height = "auto";

          const textElement = document.createElement("b");
          textElement.classList.add("result-text");
          textElement.textContent = `${(image.similarity * 100).toFixed(2)}%`;

          // Append the img and text elements to the div
          divElement.appendChild(imgElement);
          divElement.appendChild(textElement);

          // Append the div to the imageContainer
          imageContainer.appendChild(divElement);
        });

        // Update the page indicator
        const pageIndicator = document.getElementById("pageIndicator");
        pageIndicator.textContent = `Page ${page}`;
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }
  }

  const handleCheckboxChange = () => {
    const updatedDeleteExisting = deleteExisting === "FALSE" ? "TRUE" : "FALSE";
    setDeleteExisting(updatedDeleteExisting);

    if (updatedDeleteExisting === "FALSE") {
      console.log("Dataset is now persistent");
    } else {
      console.log("Dataset is now deleted per upload");
    }
  };

  const handleNextPage = () => {
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
      fetchImages(currentPage + 1);
    }
  };

  const handleModeChange = (checked) => {
    setMode(checked); // Update the mode state based on the toggle
    // You can add other logic here based on the mode change
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchImages(currentPage - 1);
    }
  };

  const imageHandler = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFolderUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const folder = e.target.files[0];

      const formData = new FormData();
      formData.append("files", folder);

      try {
        const response = await fetch(
          `/upload_dataset?delete_existing=${deleteExisting}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Dataset uploaded:", data.filenames);

          // Additional logic after successful dataset upload
          setDatasetUploaded(true); // Update datasetUploaded state
          if (datasetUploaded && fileUploaded) {
            fetchImages(1); // Fetch images if both dataset and file are uploaded
          }
          // Add more logic here if needed after dataset upload
          // For example:
          // - Redirect to another page
          // - Show a success message to the user
        } else {
          throw new Error("Failed to upload dataset");
        }
      } catch (error) {
        console.error("Error uploading dataset files:", error);
        // Handle error scenarios if needed
        // For example, display an error message to the user
      }
    }
  };

  const inputImageHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setDisplayedImage(String(reader.result)); // Update displayedImage state with new image URL
      };

      reader.readAsDataURL(file); // Read the uploaded file as a data URL
    }
  };

  return (
    <main
      id="home"
      className="bg-white w-full text-black flex flex-col items-center"
    >
      <Navbar />

      <div className="mt-[100px] flex flex-col items-center gap-y-8 w-full">
        <h1 className="text-5xl text-[black] font-bold">
          Reverse Image Search
        </h1>
        <div className="h-[450px] w-[70%] border-2 border-black rounded-xl p-8 flex items-center justify-between gap-x-8">
          <div className="flex flex-col gap-y-16 items-start">
            <div>
              <h3>Choose Your CBIR Method!</h3>
              <Switch
                onChange={swap_mode} // Use the swap_mode function as the onChange handler
                checked={mode === "Texture"} // Set the checked state based on the mode
                checkedIcon={false} // Customize the icons if needed
                uncheckedIcon={false}
                onColor="#bbbbbb" // Example colors
                offColor="#86d3ff"
                onHandleColor="#cccccc"
                offHandleColor="#2693e6"
                height={28}
                width={56}
              />
              {/* You can display other content based on the mode here */}
              <p>Current Method: {mode}</p>
            </div>
            <button
              className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-[beige] hover:text-black hover:shadow-xl transition-all"
              onClick={() => {
                if (imageInputRef.current) {
                  imageInputRef.current.click();
                }
              }}
            >
              Upload Image
            </button>
            <div className="hidden">
              <input
                id="picture"
                type="file"
                ref={imageInputRef}
                onChange={(e) => {
                  inputImageHandler(e);
                  uploadSearchImage();
                }}
              />
            </div>
            <div>
              <button
                className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-[beige] hover:text-black hover:shadow-xl transition-all"
                onClick={() => {
                  if (folderInputRef.current) {
                    folderInputRef.current.click();
                  }
                }}
              >
                Upload Dataset
              </button>
              <input
                type="file"
                ref={folderInputRef}
                style={{ display: "none" }}
                multiple={false} // Allow selecting only one folder at a time
                webkitdirectory=""
                directory=""
                onChange={() => {
                  uploadDatasetImage(); // Call uploadDatasetImage when files are selected
                }}
              />
              <div>
                <label className="ml-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteExisting === "TRUE"}
                    onChange={handleCheckboxChange}
                    className="mr-1"
                  />
                  Keep Dataset
                </label>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-[400px] overflow-hidden">
            <Image
              src={displayedImage}
              alt="akmal"
              height={400}
              width={400}
              className="rounded-xl object-fill"
            />
          </div>
        </div>
        <button
          className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-red-600 hover:text-black hover:shadow-xl transition-all text-2xl"
          onClick={forceload}
        >
          Search
        </button>
        <section
          id="result"
          className=" text-black flex flex-col items-center text-5xl font-bold bg-[beige] w-full h-full mt-10"
        >
          <h3 className="">Result</h3>
          <div className="grid-cols-6 columns-6 grid"></div>
        </section>
        <section
          id="how-to-use"
          className="flex flex-col items-center gap-y-8 bg-white mt-10"
        >
          <h1 className="text-5xl text-[black] font-bold">How To Use</h1>
          <div className="flex flex-col gap-6">
            <div className="bg-[beige] text-black  px-3 py-3 w-[800px] rounded-full ">
              <h3 className="mx-12 my-2 text-2xl font-bold">Step 1</h3>
              <p className="mx-14 my-2">
                Image Upload: Uploading an image is a simple task, requiring
                just a few clicks.
              </p>
            </div>
            <div className="bg-[beige] text-black  px-3 py-3 w-[800px] rounded-full">
              <h3 className="mx-12 my-2 text-2xl font-bold">Step 2</h3>
              <p className="mx-14 my-2">
                Color Search: Explore images that have similar color schemes to
                your uploaded picture. Texture Search: Find images containing
                textures and patterns resembling the one in your upload.
              </p>
            </div>
            <div className="bg-[beige] text-black  px-3 py-3 w-[800px] rounded-full ">
              <h3 className="mx-12 my-2 text-2xl font-bold">Step 3</h3>
              <p className="mx-14 my-2">
                Results: Our high-tech algorithm ranks search outcomes based on
                visual similarity, allowing you to swiftly identify images
                closely resembling your query from most to least similar.
              </p>
            </div>
          </div>
        </section>
        <section className="mt-10 text-black flex flex-col items-center text-5xl font-bold bg-[beige] w-full h-full">
          <h3 id="about-us" className="mt-10">
            About Us
          </h3>
          <div className="columns-3  gap-20 mt-10">
            <div
              style={{
                border: "4px solid black",
                overflow: "hidden",
                position: "relative",
                width: "300px", // Adjust width as needed
                height: "420px", // Adjust height as needed
                display: "inline-block", // Ensures inline block display
                borderRadius: "20px",
              }}
            >
              <Image
                src={andhikaimage}
                alt="akmal"
                height={400}
                width={300}
                className="rounded-xl"
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  width: "100%",
                  color: "black",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                <p className="text-xl">Mohammad Andhika Fadillah</p>
                <p className="text-xl">13522128</p>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  border: "4px solid black",
                  overflow: "hidden",
                  position: "relative",
                  width: "300px", // Adjust width as needed
                  height: "420px", // Adjust height as needed
                  display: "inline-block", // Ensures inline block display
                  borderRadius: "20px",
                }}
              >
                <Image
                  src={akmalimage}
                  alt="akmal"
                  height={400}
                  width={300}
                  className="rounded-xl"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    color: "black",
                    textAlign: "center",
                    padding: "8px",
                  }}
                >
                  <p className="text-xl">Mohammad Akmal Ramadan</p>
                  <p className="text-xl">13522161</p>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  border: "4px solid black",
                  overflow: "hidden",
                  position: "relative",
                  width: "300px", // Adjust width as needed
                  height: "420px", // Adjust height as needed
                  display: "inline-block", // Ensures inline block display
                  borderRadius: "20px",
                }}
              >
                <Image
                  src={justinimage}
                  alt="akmal"
                  height={400}
                  width={300}
                  className="rounded-xl"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    color: "black",
                    textAlign: "center",
                    padding: "9.5px",
                  }}
                >
                  <p className="text-xl">Justin Aditya Putra Prabakti</p>
                  <p className="text-xl">13522130</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
