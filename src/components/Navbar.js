import "./Navbar.css";
import { NavLink } from "react-router-dom";
export default function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

   return (
    <div className="sidebar">
      <div className="logo">
        Garage
      </div>

      <nav className="nav-links">
        <NavLink to="/home" className="link">
          Dashboard
        </NavLink>

        <NavLink to="/jobs" className="link">
          Job Cards
        </NavLink>

        <NavLink to="/customers" className="link"><span className="icon">👤</span> Customers</NavLink>

        <NavLink to="/invoices" className="link">
          Invoices
        </NavLink>
      </nav>
    </div>
  );
}