import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import { motion } from "framer-motion";
import {
  Send,
  ChevronRight,
  ChevronLeft,
  Flag,
  Maximize,
  Clock3,
} from "lucide-react";

import { serverUrl } from "../App";

function Step2Interview({ interviewData, onFinish }) {
  const questions = interviewData?.questions || [];
  const interviewId = interviewData?.interviewId;

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [reviewed, setReviewed] = useState([]);
  const [answered, setAnswered] = useState([]);

  const [timeLeft, setTimeLeft] = useState(3600);

  const [feedback, setFeedback] = useState("");

  const [suspicion, setSuspicion] = useState(0);
  const [tabWarning, setTabWarning] = useState(0);

  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const videoRef = useRef(null);

  const current = questions[index];

  // =========================
  // FULLSCREEN
  // =========================
  const handleFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =========================
  // TAB SWITCH DETECTION
  // =========================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabWarning((prev) => prev + 1);

        setSuspicion((prev) => {
          const updated = prev + 15;

          if (updated >= 100) {
            alert("Interview terminated due to cheating");
            handleFinish();
          }

          return updated;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  // =========================
  // START CAMERA + FACE API
  // =========================
  useEffect(() => {
    const start = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log(err);
      }
    };

    start();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // =========================
  // FACE TRACKING
  // =========================
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      // no face
      if (detections.length === 0) {
        setSuspicion((prev) => prev + 10);
      }

      // multiple faces
      if (detections.length > 1) {
        setSuspicion((prev) => prev + 20);
      }

      // movement
      if (detections[0]) {
        const box = detections[0].box;

        if (box.x < 80 || box.x > 250) {
          setSuspicion((prev) => prev + 5);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // SUBMIT ANSWER
  // =========================
  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex: index,
          answer,
          suspicion,
        },
        {
          withCredentials: true,
        }
      );

      setFeedback(res.data.feedback || "");

      // MCQ CHECK
      if (current.type === "mcq") {
        setIsCorrect(res.data.isCorrect);
        setCorrectAnswer(res.data.correctAnswer);
      }

      // ANSWERED
      if (!answered.includes(index)) {
        setAnswered((prev) => [...prev, index]);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };
  const handleSave = async (markReview = false) => {
  try {
    await axios.post(
      `${serverUrl}/api/interview/save-answer`,
      {
        interviewId,
        questionIndex: index,
        answer,
        markedForReview: markReview,
      },
      {
        withCredentials: true,
      }
    );

    questions[index].status = markReview
      ? "review"
      : answer
      ? "answered"
      : "visited";

  } catch (err) {
    console.log(err);
  }
};

  // =========================
  // NEXT
  // =========================
 const handleNext = async () => {
  await handleSave(false);

  if (index < questions.length - 1) {
    setIndex(index + 1);

    setFeedback("");
  }
};
  // =========================
  // PREVIOUS
  // =========================
  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);

      setAnswer("");
      setFeedback("");

      setIsCorrect(null);
      setCorrectAnswer("");
    }
  };

  // =========================
  // REVIEW
  // =========================
 const handleReview = async () => {
  await handleSave(true);

  if (index < questions.length - 1) {
    setIndex(index + 1);
  }
};

  // =========================
  // FINISH
  // =========================
  const handleFinish = async () => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/interview/finish`,
        { interviewId },
        { withCredentials: true }
      );

      onFinish(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // TIME FORMAT
  // =========================
  const formatTime = (secs) => {
    const hrs = String(Math.floor(secs / 3600)).padStart(2, "0");
    const mins = String(Math.floor((secs % 3600) / 60)).padStart(
      2,
      "0"
    );
    const sec = String(secs % 60).padStart(2, "0");

    return `${hrs}:${mins}:${sec}`;
  };

  return (
    <div className="min-h-screen bg-[#06121f] text-white flex flex-col">

      {/* HEADER */}
      <div className="h-16 bg-[#0d1b2a] border-b border-cyan-500/20 px-6 flex items-center justify-between">

        <h1 className="text-xl font-semibold text-cyan-300">
          AI Mock Interview
        </h1>

        <div className="flex items-center gap-5">

          <div className="flex items-center gap-2 text-yellow-400">
            <Clock3 size={18} />
            <span className="font-semibold">
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={handleFullscreen}
            className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Maximize size={18} />
            Fullscreen
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT */}
        <div className="flex-1 p-8 overflow-y-auto">

          {/* WARNING */}
          <div className="flex justify-between mb-6">

            <div className="text-red-400 font-medium">
              Tab Warnings: {tabWarning}
            </div>

            <div className="text-yellow-400 font-medium">
              Suspicion: {suspicion}%
            </div>
          </div>

          {/* QUESTION */}
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d1b2a] border border-cyan-500/10 
            rounded-3xl p-8 shadow-[0_0_40px_rgba(0,255,255,0.08)]"
          >

            <div className="text-cyan-300 text-lg mb-6">
              Question {index + 1}
            </div>

            <h2 className="text-2xl font-semibold mb-8 leading-relaxed">
              {current?.question}
            </h2>

            {/* MCQ */}
            {current?.type === "mcq" ? (
              <div className="space-y-4">

                {current.options.map((opt, i) => {
                  let bg =
                    answer === opt
                      ? "bg-cyan-500 text-white"
                      : "bg-white/5";

                  if (isCorrect !== null) {
                    if (opt === correctAnswer) {
                      bg = "bg-green-500";
                    } else if (
                      opt === answer &&
                      opt !== correctAnswer
                    ) {
                      bg = "bg-red-500";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setAnswer(opt)}
                      className={`w-full text-left p-4 rounded-xl border border-white/10 transition-all duration-300 ${bg}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answer}
               onChange={(e) => {
  setAnswer(e.target.value);

  questions[index].status = "answered";
}}
                placeholder="Write your answer..."
                className="w-full h-44 rounded-2xl bg-[#020617]
                border border-cyan-500/20 p-5 outline-none"
              />
            )}

            {/* FEEDBACK */}
            {feedback && (
              <div className="mt-6 bg-white/5 rounded-2xl p-4 text-cyan-200">
                {feedback}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-8">

              <button
                onClick={handlePrev}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <Send size={18} />
                {loading ? "Submitting..." : "Submit"}
              </button>

              <button
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl flex items-center gap-2"
              >
                Next
                <ChevronRight size={18} />
              </button>

              <button
                onClick={handleReview}
                className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <Flag size={18} />
                Mark Review
              </button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-80 bg-[#0d1b2a] border-l border-cyan-500/10 p-5 overflow-y-auto">

          <h2 className="text-xl font-semibold text-cyan-300 mb-5">
            Questions
          </h2>

          <div className="grid grid-cols-5 gap-3">

            {questions.map((_, i) => {
            let bg =
  "bg-[#1e293b] border border-white/10 text-gray-400";

const q = questions[i];

if (q.status === "answered") {
  bg =
    "bg-green-500/20 border border-green-400 text-green-300";
}

if (q.status === "review") {
  bg =
    "bg-yellow-500/20 border border-yellow-400 text-yellow-300";
}

if (q.status === "visited") {
  bg =
    "bg-purple-500/20 border border-purple-400 text-purple-300";
}

if (i === index) {
  bg =
    "bg-cyan-500 text-white border border-cyan-300";
}
              return (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-12 h-12 rounded-lg font-semibold ${bg}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleFinish}
            className="w-full mt-10 bg-red-500 hover:bg-red-600 py-4 rounded-2xl text-lg font-semibold"
          >
            Submit Interview
          </button>
        </div>
      </div>

      {/* FLOATING CAMERA */}
      <div className="fixed bottom-5 right-5 z-50">

        <div className="w-60 h-44 rounded-2xl overflow-hidden 
        border border-cyan-400/40 bg-black
        shadow-[0_0_30px_rgba(34,211,238,0.6)] relative">

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-2 left-2 text-green-400 text-xs">
            ● LIVE
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;