import "./Navbar.css";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const logout = () => {
    sessionStorage.removeItem("token"); // match your login storage
    window.location.href = "/";
  };

  return (
    <>
      {/* 🔝 Top bar */}
      <div className="topbar">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* ⬅ Sidebar */}
      <div className="sidebar">
        <div className="logo">Garage</div>

        <nav className="nav-links">
          <NavLink to="/home" className="link">
            Dashboard
          </NavLink>

          <NavLink to="/jobs" className="link">
            Job Cards
          </NavLink>

          <NavLink to="/customers" className="link">
            👤 Customers
          </NavLink>

          <NavLink to="/invoices" className="link">
            Invoices
          </NavLink>
        </nav>
      </div>
    </>
  );
}