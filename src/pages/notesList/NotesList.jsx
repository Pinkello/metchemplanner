import React from "react";
import "./notesList.scss";
import Notes from "../../components/notes/Notes";
import NavigationBar from "../../components/navigation/NavigationBar";

const NotesList = () => {
  return (
    <div className="list">
      <div className="listContainer">
        <NavigationBar />
        <Notes />
      </div>
    </div>
  );
};

export default NotesList;
