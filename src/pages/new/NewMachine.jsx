import "./newMachine.scss";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  where,
  query,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db, storage } from "../../firebase";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import NavigationBar from "../../components/navigation/NavigationBar";
import Select from "react-select";

const NewMachine = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [perc, setPerc] = useState(null);
  console.log("cos");
  console.log(inputs);
  const options = [
    { value: "Boczny rząd", label: "Boczny rząd" },
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

  useEffect(() => {
    // console.log("effect");
    // console.log(data);
    // console.log("name:", data.name, typeof data.name);
    // console.log("rowPlace:", data.rowPlace, typeof data.rowPlace);
    // console.log("row:", data.row, typeof data.row);
  }, [data]);

  const handleInputSelect = (selectedOption) => {
    setData({ ...data, row: selectedOption.value });
  };

  const handleInput = (e) => {
    const id = e.target.id;
    let value = e.target.value;

    if (id === "rowPlace") value = parseInt(value);

    setData({ ...data, [id]: value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // sprawdz i dodaj numery do rowPlace innych
      const q = query(
        collection(db, "machines"),
        where("row", "==", data.row),
        where("rowPlace", ">=", data.rowPlace)
      );

      const batch = writeBatch(db);

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const currentRowPlace = doc.data().rowPlace;
        batch.update(doc.ref, { rowPlace: parseInt(currentRowPlace) + 1 });
      });
      await batch.commit();

      //dodawanie nowegj maszyzny
      await addDoc(collection(db, "machines"), {
        ...data,
      });
      toast.success("Dodaje nową maszyne..");

      document.getElementById("name").value = ""; // Przykład dla pola "name"
      document.getElementById("row").value = ""; // Przykład dla pola "row"
      document.getElementById("rowPlace").value = "";
      // navigate(-1);
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
            <form onSubmit={handleAdd}>
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
                <label>Wybierz rząd maszyny</label>
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
                  Dodaj maszynę
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMachine;
