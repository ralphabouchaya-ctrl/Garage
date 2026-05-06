import { useEffect, useState } from "react";
import axios from "axios";
import "./2fa.css";

export default function TwoFA() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    init2FA();
  }, []);

  const init2FA = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/2fa/init/${userId}`
      );

      // if QR exists → new setup
      if (res.data.qr) {
        setQr(res.data.qr);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // auto focus next
    if (value && index < 5) {
      document.getElementById(`digit-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const token = code.join("");

    if (token.length !== 6) {
      alert("Enter 6-digit code");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/2fa/verify",
        { userId, token }
      );

      sessionStorage.setItem("token", res.data.token);
      window.location.href = "/home";

    } catch (err) {
      alert("Invalid code");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="twofa-container">
      <div className="twofa-box">
        <h2>Two-factor Authentication</h2>

        {/* ✅ QR (only first time) */}
        {qr && (
          <div className="qr-section">
            <p>Scan this QR code with Google Authenticator</p>
            <img src={qr} alt="QR Code" />
          </div>
        )}

        <p>Enter 6-digit code</p>

        {/* 🔢 Input */}
        <div className="code-inputs">
          {code.map((digit, i) => (
            <input
              key={i}
              id={`digit-${i}`}
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
            />
          ))}
        </div>

        <button onClick={handleVerify}>✔ Verify</button>
      </div>
    </div>
  );
}