import { useEffect } from "react";
import Navbar from "../components/Navbar";
import "./Home.css";

export default function Home() {
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="home-content">
        <h1>Welcome to Dashboard</h1>
      </div>
    </>
  );
}