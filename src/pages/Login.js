import { useState } from "react";
import axios from "axios";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error
  const [show, setShow] = useState(false);

  const showMessage = (msg, msgType = "success") => {
    setMessage(msg);
    setType(msgType);
    setShow(true);

    setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      sessionStorage.setItem("token", res.data.token);

      sessionStorage.setItem("loginMessage", res.data.message);
      window.location.href = "/home";

    } catch (err) {
      showMessage(
        err.response?.data?.error || "Login failed",
        "error"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        {/* 🔔 Message */}
        {show && (
          <div className={`message ${type}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}