import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./Home.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    // 🔐 protect route
    if (!token) {
      window.location.href = "/";
      return;
    }

    // 🔔 get login message
    const msg = sessionStorage.getItem("loginMessage");

    if (msg) {
      setMessage(msg);
      setShow(true);

      // remove so it doesn't repeat
      sessionStorage.removeItem("loginMessage");

      setTimeout(() => {
        setShow(false);
      }, 3000);
    }
  }, []);

  return (
    <>
     

      {/* 🔔 Floating me */}
      {show && (
        <div className="toast success">
          {message}
        </div>
      )}

      <div className="home-content">
        <h1>Welcome to Dashboard</h1>
      </div>
    </>
  );
}