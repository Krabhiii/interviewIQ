import React from "react";
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

  const handleGoogleAuth = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      const result = await axios.post(
        serverUrl + "/api/auth/google",
        {
          name: user.displayName,
          email: user.email,
        },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        {/* CLOSE BUTTON */}
        <button className="close-btn" onClick={onClose}>✕</button>

        {/* LOGO */}
        <div className="logo-row">
          <FaRobot className="logo-icon" />
          <h2>InterviewIQ.AI</h2>
        </div>

        {/* HEADING */}
        <h1 className="main-heading">
          Continue with <br />
          <span className="highlight">AI Powered Interview</span>
        </h1>

        {/* SUB TEXT */}
        <p className="sub-text">
          Practice real interview scenarios, receive AI-powered feedback,
          and improve your confidence step by step.
        </p>

        {/* BUTTON */}
        <button className="google-btn" onClick={handleGoogleAuth}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="google"
          />
          Continue with Google
        </button>

      </div>
    </div>
  );
};

export default Auth;