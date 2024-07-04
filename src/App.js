import React from "react";
import { Routes, Route } from "react-router-dom";
import SubmissionsTable from "./components/SubmissionsTable/SubmissionsTable"; // Adjust the path according to your file structure

const App = () => {
  return (
    <Routes>
      <Route path="/submissions" element={<SubmissionsTable />} />
      <Route path="/" element={<SubmissionsTable />} />
    </Routes>
  );
};

export default App;
