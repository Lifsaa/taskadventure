import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import styles from "./App.module.css";
import TaskPage from "./TaskPage";
import Login from "./Login";
import Signup from "./Signup";
import CalendarPage from "./CalendarPage";
import ContactUsPage from "./ContactUsPage";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<Signup setToken={setToken} />} />
          <Route
            path="/"
            element={
              token ? <TaskPage token={token} /> : <Navigate to="/login" />
            }
          />
          <Route path="/tasks" element={<TaskPage token={token} />} />{" "}
          <Route path="/calendar" element={<CalendarPage token={token} />} />{" "}
          <Route path="/contactus" element={<ContactUsPage token={token} />} />{" "}
          <Route path="/contact" element={<ContactUsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
