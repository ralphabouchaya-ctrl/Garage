import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  //  not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}