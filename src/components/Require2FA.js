import { Navigate } from "react-router-dom";

export default function Require2FA({ children }) {
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  // ❌ not logged in
  if (!token && !userId) {
    return <Navigate to="/" replace />;
  }

  // ❌ 2FA not done yet → force /2fa
  if (!token && userId) {
    return <Navigate to="/2fa" replace />;
  }

  return children;
}