import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}