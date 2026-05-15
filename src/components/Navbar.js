import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { FaHome, FaTools, FaUser, FaFileInvoice, FaBars } from "react-icons/fa";
import { useState } from "react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      {/*  Top bar */}
      <div className="topbar">
        {/*  Mobile menu button */}
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars />
        </button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/*  Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <div className="logo">Abou Chaaya Garage</div>

        <nav className="nav-links">
          <NavLink to="/home" className="link" onClick={() => setSidebarOpen(false)}>
            <FaHome className="icon" /> Home
          </NavLink>

          <NavLink to="/jobcard" className="link" onClick={() => setSidebarOpen(false)}>
            <FaTools className="icon" /> Job Cards
          </NavLink>

          <NavLink to="/customers" className="link" onClick={() => setSidebarOpen(false)}>
            <FaUser className="icon" /> Customers
          </NavLink>

          <NavLink to="/invoices" className="link" onClick={() => setSidebarOpen(false)}>
            <FaFileInvoice className="icon" /> Invoices
          </NavLink>
        </nav>
      </div>

      {/*  Overlay (click to close) */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}