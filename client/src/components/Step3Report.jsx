import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Brain,
  MessageSquare,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
} from "lucide-react";

function Step3Report({ report, onRestart }) {
  if (!report) {
    return (
      <div className="min-h-screen bg-[#06121f] flex items-center justify-center text-white">
        No Report Found
      </div>
    );
  }

  const scoreColor =
    report.finalScore >= 8
      ? "text-green-400"
      : report.finalScore >= 5
      ? "text-yellow-400"
      : "text-red-400";

  const cheatingColor =
    report.cheatingStatus === "clean"
      ? "text-green-400"
      : report.cheatingStatus === "medium"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="min-h-screen bg-[#06121f] text-white p-8 overflow-x-hidden">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1
          className="text-5xl font-black text-center
          bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500
          bg-clip-text text-transparent"
        >
          Interview Performance Report
        </h1>

        <p className="text-center text-gray-400 mt-4 text-lg">
          AI Generated Evaluation Dashboard
        </p>
      </motion.div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">

        <StatCard
          title="Final Score"
          value={report.finalScore}
          icon={<Trophy size={28} />}
          color="from-cyan-500 to-blue-600"
          textColor={scoreColor}
        />

        <StatCard
          title="Confidence"
          value={report.confidence}
          icon={<Brain size={28} />}
          color="from-purple-500 to-pink-600"
        />

        <StatCard
          title="Communication"
          value={report.communication}
          icon={<MessageSquare size={28} />}
          color="from-green-500 to-emerald-600"
        />

        <StatCard
          title="Correctness"
          value={report.correctness}
          icon={<CheckCircle2 size={28} />}
          color="from-orange-500 to-red-500"
        />

        <StatCard
          title="Cheating Risk"
          value={`${report.suspicion}%`}
          icon={<ShieldAlert size={28} />}
          color="from-red-500 to-pink-600"
          textColor={cheatingColor}
        />
      </div>

      {/* STATUS PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0d1b2a] border border-cyan-500/10 rounded-3xl p-8 mb-10
        shadow-[0_0_50px_rgba(0,255,255,0.08)]"
      >

        <h2 className="text-3xl font-bold text-cyan-300 mb-6">
          Overall Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <AnalysisCard
            title="Performance"
            value={
              report.finalScore >= 8
                ? "Excellent"
                : report.finalScore >= 5
                ? "Good"
                : "Needs Improvement"
            }
            icon={<Star />}
            color={
              report.finalScore >= 8
                ? "text-green-400"
                : report.finalScore >= 5
                ? "text-yellow-400"
                : "text-red-400"
            }
          />

          <AnalysisCard
            title="Interview Status"
            value="Completed"
            icon={<CheckCircle2 />}
            color="text-green-400"
          />

          <AnalysisCard
            title="Cheating Detection"
            value={report.cheatingStatus}
            icon={<AlertTriangle />}
            color={cheatingColor}
          />
        </div>
      </motion.div>

      {/* QUESTION ANALYSIS */}
      <div className="mb-10">

        <h2 className="text-3xl font-bold text-cyan-300 mb-8">
          Question Wise Analysis
        </h2>

        <div className="space-y-6">

          {report.questionWiseScore?.map((q, i) => {
            const isGood = q.score >= 7;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0d1b2a] border border-white/10 rounded-3xl p-6
                shadow-[0_0_40px_rgba(0,255,255,0.04)]"
              >

                {/* TOP */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-5">

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Q{i + 1}. {q.question}
                    </h3>

                    <div className="flex flex-wrap gap-3">

                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">
                        {q.type}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`text-2xl font-black ${
                      isGood ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {q.score}/10
                  </div>
                </div>

                {/* MCQ RESULT */}
                {q.type === "mcq" && (
                  <div className="mb-5">

                    <div className="flex items-center gap-3 mb-3">

                      {q.score > 0 ? (
                        <>
                          <CheckCircle2 className="text-green-400" />
                          <span className="text-green-400 font-semibold">
                            Correct Answer
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-400" />
                          <span className="text-red-400 font-semibold">
                            Incorrect Answer
                          </span>
                        </>
                      )}
                    </div>

                    <div className="bg-black/30 rounded-xl p-4 border border-white/10">

                      <p className="text-gray-400 mb-2">
                        Your Answer:
                      </p>

                      <p className="text-white mb-4">
                        {q.answer || "Not Answered"}
                      </p>

                      <p className="text-gray-400 mb-2">
                        Correct Answer:
                      </p>

                      <p className="text-green-400">
                        {q.correctAnswer}
                      </p>
                    </div>
                  </div>
                )}

                {/* FEEDBACK */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                  <MiniMetric
                    title="Confidence"
                    value={q.confidence || 0}
                    color="bg-cyan-500"
                  />

                  <MiniMetric
                    title="Communication"
                    value={q.communication || 0}
                    color="bg-purple-500"
                  />

                  <MiniMetric
                    title="Correctness"
                    value={q.correctness || 0}
                    color="bg-green-500"
                  />

                  <MiniMetric
                    title="Suspicion"
                    value={q.suspicion || 0}
                    color="bg-red-500"
                  />
                </div>

                {/* FEEDBACK TEXT */}
                <div className="mt-6 bg-black/30 border border-white/10 rounded-2xl p-5">

                  <p className="text-gray-400 mb-2">
                    AI Feedback
                  </p>

                  <p className="text-gray-200">
                    {q.feedback || "No feedback"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RESTART */}
      <div className="flex justify-center">

        <button
          onClick={onRestart}
          className="px-10 py-4 rounded-2xl
          bg-gradient-to-r from-cyan-500 to-blue-600
          hover:scale-105 transition-all duration-300
          shadow-[0_0_40px_rgba(0,255,255,0.3)]
          flex items-center gap-3 text-lg font-semibold"
        >
          <RotateCcw size={22} />
          Restart Interview
        </button>
      </div>
    </div>
  );
}

// =========================
// STAT CARD
// =========================
const StatCard = ({
  title,
  value,
  icon,
  color,
  textColor = "text-white",
}) => (
  <motion.div
    whileHover={{ scale: 1.04 }}
    className={`bg-gradient-to-br ${color}
    rounded-3xl p-6 relative overflow-hidden
    shadow-[0_0_50px_rgba(0,0,0,0.3)]`}
  >

    <div className="absolute -right-5 -top-5 opacity-20 scale-[2]">
      {icon}
    </div>

    <div className="mb-4">{icon}</div>

    <p className="text-sm opacity-80 mb-2">
      {title}
    </p>

    <h2 className={`text-4xl font-black ${textColor}`}>
      {value}
    </h2>
  </motion.div>
);

// =========================
// ANALYSIS CARD
// =========================
const AnalysisCard = ({
  title,
  value,
  icon,
  color,
}) => (
  <div
    className="bg-black/30 border border-white/10 rounded-2xl p-5"
  >

    <div className={`mb-4 ${color}`}>
      {icon}
    </div>

    <p className="text-gray-400 mb-2">
      {title}
    </p>

    <h3 className={`text-2xl font-bold ${color}`}>
      {value}
    </h3>
  </div>
);

// =========================
// MINI METRIC
// =========================
const MiniMetric = ({
  title,
  value,
  color,
}) => (
  <div className="bg-black/30 rounded-2xl p-4 border border-white/10">

    <div className="flex justify-between mb-2">
      <span className="text-gray-400 text-sm">
        {title}
      </span>

      <span className="text-white font-semibold">
        {value}/10
      </span>
    </div>

    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">

      <div
        className={`h-full ${color}`}
        style={{
          width: `${value * 10}%`,
        }}
      />
    </div>
  </div>
);

export default Step3Report;