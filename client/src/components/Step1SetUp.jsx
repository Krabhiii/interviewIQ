import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mic, BarChart3, PlayCircle, X, Loader2 } from "lucide-react";
import { serverUrl } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

function Step1SetUp({ onStart }) {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");

  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");

  const [error, setError] = useState("");

  // ---------------- FILE UPLOAD ----------------
  const handleUploadResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File must be under 2MB");
      return;
    }

    setError("");
    setResumeFile(file);
    setAnalysisDone(false);

    setProjects([]);
    setSkills([]);
    setResumeText("");
  };

  // ---------------- ANALYZE ----------------
  const handleAnalyze = async () => {
    if (!resumeFile) return;

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const result = await axios.post(
        `${serverUrl}/api/interview/resume`,
        formData,
        { withCredentials: true }
      );

      const data = result.data;

      setRole(data.role || "");
      setExperience(data.experience || "");
      setProjects(data.projects || []);
      setSkills(data.skills || []);
      setResumeText(data.resumeText || "");

      setAnalysisDone(true);
    } catch (err) {
      console.error(err);
      setError("Resume analysis failed");
    }

    setAnalyzing(false);
  };

  // ---------------- START ----------------
  const handleStart = async () => {
    if (!role || !experience) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
  serverUrl + "/api/interview/generate-questions",
  { role, experience, mode, resumeText, projects, skills },
  { withCredentials: true }
);

console.log("🔥 FULL BACKEND RESPONSE:", result.data);

      // update credits
      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditsLeft,
          })
        );
      }

      onStart(result.data);
    } catch (error) {
  console.log("❌ FULL ERROR:", error.response?.data);

  setError(
    error.response?.data?.message || "Failed to start interview"
  );
}

    setLoading(false);
  };

  // ---------------- RESET ----------------
  const handleRemoveResume = () => {
    setResumeFile(null);
    setAnalysisDone(false);
    setProjects([]);
    setSkills([]);
    setResumeText("");

    setRole("");
    setExperience("");
    setMode("Technical");
    setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-4xl h-[540px] mx-auto rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-[0_0_60px_rgba(59,130,246,0.15)]"
    >
      {/* LEFT PANEL */}
      <div className="w-1/2 relative flex items-center justify-center bg-[#020617] border-r border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.2),transparent_60%)]" />

        <div className="relative z-10 max-w-sm px-6">
          <h1 className="text-3xl font-bold text-white mb-4">
            AI Interview Setup
          </h1>

          <p className="text-gray-400 mb-6 text-sm">
            Smart interview powered by resume analysis and AI-driven questions.
          </p>

          <div className="space-y-4">
            <Feature icon={<User size={18} />} text="Role-based Questions" />
            <Feature icon={<Mic size={18} />} text="Voice Interaction" />
            <Feature icon={<BarChart3 size={18} />} text="AI Analytics" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex items-center justify-center bg-[#020617]">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-6">

          <h2 className="text-xl font-semibold text-white mb-5 text-center">
            Setup Interview
          </h2>

          {/* ROLE */}
          <input
            placeholder="Job Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 mb-3 rounded-lg bg-[#020617] border border-white/10 text-white"
          />

          {/* EXPERIENCE */}
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full p-2 mb-3 rounded-lg bg-[#020617] border border-white/10 text-white"
          >
            <option value="">Experience</option>
            <option>Fresher</option>
            <option>1-2 Years</option>
            <option>3-5 Years</option>
            <option>5+ Years</option>
          </select>

          {/* MODE */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2 mb-4 rounded-lg bg-[#020617] border border-white/10 text-white"
          >
            <option>Technical</option>
            <option>HR</option>
            <option>Mixed</option>
          </select>

          {/* UPLOAD + RESULT */}
          <AnimatePresence mode="wait">
            {!analysisDone ? (
              <motion.label
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/20 rounded-xl cursor-pointer mb-3"
              >
                <input type="file" className="hidden" onChange={handleUploadResume} />

                {!resumeFile ? (
                  <span className="text-gray-400 text-sm">Upload Resume</span>
                ) : (
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    {resumeFile.name}
                    <X size={14} onClick={handleRemoveResume} />
                  </div>
                )}
              </motion.label>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 space-y-4"
              >
                {/* SKILLS */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <motion.span
                        key={i}
                        className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* PROJECTS */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Projects</p>
                  {projects.map((proj, i) => (
                    <div key={i} className="text-sm text-gray-300 bg-white/5 px-2 py-1 rounded mb-1">
                      • {proj}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleRemoveResume}
                  className="text-xs text-red-400 hover:underline"
                >
                  Upload another resume
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ANALYZE */}
          {resumeFile && !analysisDone && (
            <motion.button
              onClick={handleAnalyze}
              className="w-full mb-3 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg flex justify-center gap-2"
            >
              {analyzing ? <Loader2 className="animate-spin" /> : "Analyze Resume"}
            </motion.button>
          )}

          {/* ERROR */}
          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

          {/* START */}
          <motion.button
            disabled={!role || !experience || loading}
            onClick={handleStart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex justify-center gap-2"
          >
            {loading ? "Starting..." : (
              <>
                <PlayCircle size={18} />
                Start Interview
              </>
            )}
          </motion.button>

        </div>
      </div>
    </motion.div>
  );
}

export default Step1SetUp;

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg">
    <div className="bg-blue-500/20 text-blue-400 p-2 rounded-md">{icon}</div>
    <span className="text-gray-300 text-sm">{text}</span>
  </div>
);