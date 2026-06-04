import React, { useState } from "react";
import "./Auth.css";
import { FaRobot } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Auth = ({ onClose }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await signInWithPopup(auth, provider);
      const firebaseUser = res.user;

      const result = await axios.post(
        `${serverUrl}/api/auth/google`,
        {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
        },
        {
          withCredentials: true,
        }
      );

      dispatch(setUserData(result.data));

      onClose();
    } catch (err) {
      console.log("GOOGLE AUTH ERROR:", err);
      console.log("BACKEND ERROR:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="logo-row">
          <FaRobot className="logo-icon" />
          <h2>InterviewIQ.AI</h2>
        </div>

        <h1 className="main-heading">
          Continue with <br />
          <span className="highlight">AI Powered Interview</span>
        </h1>

        <p className="sub-text">
          Practice real interview scenarios, receive AI-powered feedback,
          and improve your confidence step by step.
        </p>

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        <button
          className="google-btn"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="google"
          />

          {loading ? "Connecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
