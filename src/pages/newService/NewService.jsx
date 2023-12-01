import "./newService.scss";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "../../firebase";

import React from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../components/navigation/NavigationBar";
import Select from "react-select";

const NewService = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [perc, setPerc] = useState(null);
  const navigate = useNavigate();

  const options = [
    { value: "Lewy rząd", label: "Lewy rząd" },
    { value: "Środkowy rząd", label: "Środkowy rząd" },
    { value: "Prawy rząd", label: "Prawy rząd" },
  ];

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;

      console.log(name);

      const storageRef = ref(storage, file.name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setPerc(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, img: downloadURL }));
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  const handleInputSelect = (selectedOption) => {
    setData({ ...data, row: selectedOption.value });
  };

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    console.log(e.target.id);

    setData({ ...data, [id]: value });
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!data["rowPlace"]) {
      toast.error("Podaj miejsce w rzędzie dla montażu!");
      return;
    }
    try {
      await addDoc(collection(db, "services"), {
        ...data,
      });
      toast.success("Dodaje nową maszyne..");

      document.getElementById("name").value = ""; // Przykład dla pola "name"
      document.getElementById("rowPlace").value = ""; // Przykład dla pola "row"
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="new">
      <div className="newContainer">
        <NavigationBar />
        <ToastContainer />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleAddService}>
              <div className="formInput">
                <label htmlFor="file">
                  Zdjęcie: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>
              <div className="formInput">
                <label>Wybierz rząd montażu</label>
                <Select
                  options={options}
                  id="row"
                  name="row"
                  onChange={handleInputSelect}
                />
              </div>
              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleInput}
                  />
                </div>
              ))}
              <div className="formInput">
                <button disabled={perc !== null && perc < 100} type="submit">
                  Dodaj montaż
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewService;
