import React, { useState } from "react";
import AuthModel from "../components/AuthModel";
import Navbar from "../components/Navbar";
import { Sparkles, Brain, History, Bot, Mic, Clock } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";

import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from "../components/Footer";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const handleClick = (route) => {
    if (!userData) {
      setShowAuth(true);
    } else {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      {/* HERO */}
      <div className="flex flex-col items-center text-center px-4 mt-24">

       <div className="flex items-center gap-3 
  bg-white/5 px-5 py-2.5 rounded-full 
  border border-white/10 
  backdrop-blur-md mb-6 shadow-sm"
>
  <Sparkles className="text-blue-400" size={18} />

  <span className="text-base md:text-lg font-medium tracking-wide text-gray-200">
    AI Powered Smart Interview Platform
  </span>
</div>

        <h1 className="text-4xl md:text-6xl font-bold">
          Practice Interview With
        </h1>

        <h2 className="mt-3 text-4xl md:text-6xl font-extrabold">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 text-transparent bg-clip-text">
            Real AI Interview Experience
          </span>
        </h2>

        <p className="mt-6 max-w-xl text-sm md:text-lg text-gray-400">
          Get real interview experience powered by AI. Practice, improve, and crack top tech companies.
        </p>

        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => handleClick("/interview")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl 
            bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            <Brain size={18} />
            Start Interview
          </button>

          <button
            onClick={() => handleClick("/history")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl 
            bg-white/10 border border-white/20 
            font-semibold hover:bg-white/20 transition"
          >
            <History size={18} />
            History
          </button>
        </div>

        {/* STEP CARDS */}
        <div className="mt-20 grid md:grid-cols-3 gap-10 max-w-6xl w-full px-4">

          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-[#1e293b] p-8 rounded-2xl shadow-xl border-t-4 border-blue-500"
          >
            <Bot className="text-blue-400 mb-4" size={28} />
            <p className="text-blue-400 text-sm font-semibold">STEP 1</p>
            <h3 className="font-bold text-lg mt-2">Role & Experience Selection</h3>
            <p className="text-sm text-gray-400 mt-2">
              AI adjusts difficulty based on selected job role.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-[#1e293b] p-8 rounded-2xl shadow-xl border-t-4 border-purple-500"
          >
            <Mic className="text-purple-400 mb-4" size={28} />
            <p className="text-purple-400 text-sm font-semibold">STEP 2</p>
            <h3 className="font-bold text-lg mt-2">Smart Voice Interview</h3>
            <p className="text-sm text-gray-400 mt-2">
              Dynamic follow-up questions based on your answers.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-[#1e293b] p-8 rounded-2xl shadow-xl border-t-4 border-indigo-500"
          >
            <Clock className="text-indigo-400 mb-4" size={28} />
            <p className="text-indigo-400 text-sm font-semibold">STEP 3</p>
            <h3 className="font-bold text-lg mt-2">Timer Based Simulation</h3>
            <p className="text-sm text-gray-400 mt-2">
              Real interview pressure with time tracking.
            </p>
          </motion.div>

        </div>

        {/* HEADING */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold">
            Advanced AI{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Capabilities
            </span>
          </h2>
        </div>

        {/* FEATURE CARDS */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full px-4">

          {[ 
            { img: evalImg, title: "AI Answer Evaluation", border: "border-blue-500" },
            { img: resumeImg, title: "Resume Based Questions", border: "border-purple-500" },
            { img: pdfImg, title: "Download PDF Report", border: "border-indigo-500" },
            { img: analyticsImg, title: "Performance Analytics", border: "border-cyan-500" }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -8 }}
              className={`bg-[#1e293b] p-6 rounded-2xl shadow-xl border-2 ${item.border}`}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-40 object-contain mb-4"
              />
              <h3 className="font-semibold text-lg text-center">
                {item.title}
              </h3>
            </motion.div>
          ))}

        </div>

        {/* INTERVIEW MODES */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold">
            Multiple{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
              Interview Modes
            </span>
          </h2>
        </div>

        {/* SMALL BOXES */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">

          {[ 
            { img: hrImg, title: "HR Interview", border: "border-blue-500" },
            { img: techImg, title: "Technical Interview", border: "border-purple-500" },
            { img: confidenceImg, title: "Confidence Builder", border: "border-indigo-500" },
            { img: creditImg, title: "Credits System", border: "border-cyan-500" }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04, y: -5 }}
              className={`bg-[#1e293b] p-4 rounded-xl shadow-lg border-2 ${item.border}`}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-28 object-contain mb-3"
              />
              <h3 className="font-semibold text-sm text-center">
                {item.title}
              </h3>
            </motion.div>
          ))}

        </div>

      </div>

      {/* AUTH MODAL */}
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />
    </div>
  );
};

export default Home;