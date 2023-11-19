"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Switch from "react-switch";
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
  const folderInputRef = useRef(null);

  useEffect(() => {
    if (isReset) {
      fetch(`/reset`)
        .then((response) => {
          if (response.ok) {
            const modeText = document.getElementById("mode_text");
            if (modeText) {
              modeText.textContent = "Updated text";
            }
          } else {
            throw new Error("Failed to fetch");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          setIsReset(false);
        });
    }
  }, [isReset]);
  function reset() {
    setIsReset(true);
  }

  const chooseFile = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  

    async function displayUpload() {
      const response = await fetch(`/display_upload`);
      const data = await response.json();
      const imageContainer = document.getElementById("upload-image-container");

      if (imageContainer) {
        imageContainer.innerHTML = "";
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
    
    function chooseDataset() {
      document.getElementById("datasetInput").click();
    }

    const swapMode = () => {
      const newMode = mode === "Texture" ? "Color" : "Texture"; // Replace 'OtherMode' with your other mode name
      setMode(newMode);
      console.log("Mode swapped:", newMode); // Add a console log here to check mode change
    };
    function persistDataset() {
      setDeleteExisting((prevDeleteExisting) =>
        prevDeleteExisting === "FALSE" ? "TRUE" : "FALSE"
      );
    }

    const uploadSearchImage = (event: React.FormEvent) => {
      event.preventDefault();

      const fileInput = document.getElementById(
        "fileInput"
      ) as HTMLInputElement | null;

      if (fileInput?.files && fileInput.files.length > 0) {
        const formData = new FormData();
        for (const file of Array.from(fileInput.files)) {
          formData.append("files", file);
        }

        fetch("http://127.0.0.1:8000/upload_search", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            setFileUploaded(true);
            displayUpload();
            console.log("Search file uploaded:", data.filenames);

            const uploadedImage = fileInput.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
              setDisplayedImage(reader.result as string);
            };

            reader.readAsDataURL(uploadedImage);
          })
          .catch((error) => {
            console.error("Error uploading files:", error);
          });
      }
    };

    function triggerImageUpload() {
      if (imageInputRef.current) {
        imageInputRef.current.click();
      }
    }

    function test_ping() {
      fetch(`/test_ping`);
      console.log("Ping");
    }

    const uploadDatasetImage = () => {
      const folderInput = document.createElement("input");
      folderInput.type = "file";
      folderInput.webkitdirectory = true;
      folderInput.directory = true;

      folderInput.addEventListener("change", async (event) => {
        const folders = event.target.files;
        if (folders.length > 0) {
          const folderPath = folders[0].webkitRelativePath; // Get the selected folder path

          const formData = new FormData();
          formData.append("folderPath", folderPath);

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
              setDatasetUploaded(true);
              console.log("Dataset uploaded:", data.filenames);
              if (datasetUploaded && fileUploaded) {
                fetchImages(1);
              }
              // after uploading dataset, attempt to calculate images
            } else {
              throw new Error("Failed to upload dataset");
            }
          } catch (error) {
            console.error("Error uploading dataset folder:", error);
          }
        }
      });

      folderInput.click();
    };

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

    async function fetchImages(page) {
      const imageContainer = document.getElementById("image-container");
      imageContainer.innerHTML = "";

      if (datasetUploaded && fileUploaded) {
        console.log("mode :", mode);
        try {
          const response = await fetch(`/get_images?page=${page}&mode=${mode}`);
          const data = await response.json();

          setMaxPage(data.max_page);

          data.images.forEach((image) => {
            const divElement = document.createElement("div");
            divElement.classList.add("result-place");

            const imgElement = document.createElement("img");
            imgElement.src = image.url;
            imgElement.style.maxWidth = "300px";
            imgElement.style.margin = "10px";
            imgElement.style.maxHeight = "35vh";
            imgElement.style.height = "auto";

            const textElement = document.createElement("b");
            textElement.classList.add("result-text");
            textElement.textContent = `${(image.similarity * 100).toFixed(2)}%`;

            divElement.appendChild(imgElement);
            divElement.appendChild(textElement);

            imageContainer.appendChild(divElement);
          });

          const pageIndicator = document.getElementById("pageIndicator");
          pageIndicator.textContent = `Page ${page}`;
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      }
    }

    const handleCheckboxChange = () => {
      const updatedDeleteExisting =
        deleteExisting === "FALSE" ? "TRUE" : "FALSE";
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
      setMode(checked);
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

    const handleFolderUpload = async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const folder = e.target.files[0]; // Get the folder object

        const formData = new FormData();
        formData.append("folder", folder); // Append the folder object

        try {
          const response = await fetch(
            `/upload_search?delete_existing=${deleteExisting}`, // Update the endpoint to handle folder upload
            {
              method: "POST",
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Dataset uploaded:", data.filenames);

            setDatasetUploaded(true); // Update datasetUploaded state
            if (datasetUploaded && fileUploaded) {
              fetchImages(1);
            }
          } else {
            throw new Error("Failed to upload dataset");
          }
        } catch (error) {
          console.error("Error uploading dataset files:", error);
        }
      }
    };

    const inputImageHandler = async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          setDisplayedImage(String(reader.result));
        };

        reader.readAsDataURL(file);
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
                  onChange={swapMode}
                  checked={mode === "Texture"}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  onColor="#bbbbbb"
                  offColor="#86d3ff"
                  onHandleColor="#cccccc"
                  offHandleColor="#2693e6"
                  height={28}
                  width={56}
                />
                <p>Current Method: {mode}</p>
              </div>
              <button
                className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-[beige] hover:text-black hover:shadow-xl transition-all"
                onClick={chooseFile}
              >
                Upload Image
              </button>
              <div className="hidden">
                <input
                  id="fileInput"
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => {
                    inputImageHandler(e);
                    uploadSearchImage(e);
                  }}
                />
              </div>
              <div>
                <button
                  className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-[beige] hover:text-black hover:shadow-xl transition-all"
                  onClick={chooseDataset}
                >
                  Upload Dataset
                </button>
                <input
                  id="datasetInput"
                  type="file"
                  ref={folderInputRef}
                  style={{ display: "none" }}
                  multiple={false}
                  webkitdirectory=""
                  directory=""
                  onChange={uploadDatasetImage}
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
            className="text-black flex flex-col items-center font-bold bg-[beige] w-full h-full mt-10"
          >
            <h3 className="text-5xl pt-10">Result</h3>
            <div className="grid grid-cols-3 gap-y-4 gap-x-16 mt-6 pb-5">
              <img
                src="https://via.placeholder.com/300"
                alt="Image 1"
                className="max-w-full h-auto"
              />
              <img
                src="https://via.placeholder.com/300"
                alt="Image 2"
                className="max-w-full h-auto"
              />
              <img
                src="https://via.placeholder.com/300"
                alt="Image 3"
                className="max-w-full h-auto"
              />
              <img
                src="https://via.placeholder.com/300"
                alt="Image 4"
                className="max-w-full h-auto"
              />
              <img
                src="https://via.placeholder.com/300"
                alt="Image 5"
                className="max-w-full h-auto"
              />
              <img
                src="https://via.placeholder.com/300"
                alt="Image 6"
                className="max-w-full h-auto"
              />
            </div>
            <div id="pagination-container" className="bottom-4 right-4 pb-10">
              <button
                id="prevPageButton"
                className="mr-2 py-1 px-3 bg-gray-300 hover:bg-gray-400 rounded-md"
              >
                {"<"}
              </button>
              <span id="pageIndicator" className="mr-2">
                Page 1
              </span>
              <button
                id="nextPageButton"
                className="py-1 px-3 bg-gray-300 hover:bg-gray-400 rounded-md"
              >
                {">"}
              </button>
            </div>
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
                  Color Search: Explore images that have similar color schemes
                  to your uploaded picture. Texture Search: Find images
                  containing textures and patterns resembling the one in your
                  upload.
                </p>
              </div>
              <div className="bg-[beige] text-black  px-3 py-3 w-[800px] rounded-full ">
                <h3 className="mx-12 my-2 text-2xl font-bold">Step 3</h3>
                <p className="mx-14 my-2">
                  Results: Our high-tech algorithm ranks search outcomes based
                  on visual similarity, allowing you to swiftly identify images
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
                  width: "300px",
                  height: "420px",
                  display: "inline-block",
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
                    width: "300px",
                    height: "420px",
                    display: "inline-block",
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
                    width: "300px",
                    height: "420px",
                    display: "inline-block",
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
                      width: "100%",
                      color: "black",
                      textAlign: "center",
                      padding: "8px",
                    }}
                  >
                    <p className="text-xl">Justin Aditya Putra Prabakti </p>
                    <p className="text-xl">13522130</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  };
