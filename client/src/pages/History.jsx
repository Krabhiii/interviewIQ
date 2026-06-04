import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Brain,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Eye,
  X,
  RotateCcw,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App.jsx";

function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${serverUrl}/api/interview/history`, {
        withCredentials: true,
      });

      setInterviews(res.data.interviews || []);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchSearch =
        item.role?.toLowerCase().includes(search.toLowerCase()) ||
        item.mode?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ||
        item.status === filter ||
        item.cheatingStatus === filter;

      return matchSearch && matchFilter;
    });
  }, [interviews, search, filter]);

  const stats = useMemo(() => {
    const total = interviews.length;

    const completed = interviews.filter((i) => i.status === "completed");

    const avgScore =
      completed.length > 0
        ? completed.reduce((sum, i) => sum + (i.finalScore || 0), 0) /
          completed.length
        : 0;

    const bestScore =
      completed.length > 0
        ? Math.max(...completed.map((i) => i.finalScore || 0))
        : 0;

    const avgConfidence =
      completed.length > 0
        ? completed.reduce((sum, i) => sum + (i.avgConfidence || 0), 0) /
          completed.length
        : 0;

    return {
      total,
      completed: completed.length,
      avgScore: Number(avgScore.toFixed(1)),
      bestScore: Number(bestScore.toFixed(1)),
      avgConfidence: Number(avgConfidence.toFixed(1)),
    };
  }, [interviews]);

  const chartData = [...interviews]
    .reverse()
    .map((item, index) => ({
      name: `I${index + 1}`,
      score: Number(item.finalScore || 0),
      confidence: Number(item.avgConfidence || 0),
      communication: Number(item.avgCommunication || 0),
      correctness: Number(item.avgCorrectness || 0),
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-300">
          <Loader2 className="animate-spin" />
          Loading interview history...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 mb-4">
              <Sparkles size={16} />
              AI Interview Progress
            </div>

            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Interview History
            </h1>

            <p className="text-gray-400 mt-3">
              Track your performance, reports, scores, and interview growth.
            </p>
          </div>

          <button
            onClick={() => navigate("/interview")}
            className="px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:scale-105 transition"
          >
            🚀 Start New Interview
          </button>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          <StatCard
            title="Total Interviews"
            value={stats.total}
            icon={<Brain />}
            color="from-cyan-500 to-blue-600"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 />}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Avg Score"
            value={stats.avgScore}
            icon={<Trophy />}
            color="from-yellow-500 to-orange-600"
          />
          <StatCard
            title="Best Score"
            value={stats.bestScore}
            icon={<Trophy />}
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Avg Confidence"
            value={stats.avgConfidence}
            icon={<MessageSquare />}
            color="from-blue-500 to-indigo-600"
          />
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-cyan-300 mb-5">
              Score Growth
            </h2>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptySmall text="No chart data yet" />
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-cyan-300 mb-5">
              Skill Analytics
            </h2>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="confidence" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="communication" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="correctness" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptySmall text="No skill data yet" />
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="glass-card p-5 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role or mode..."
              className="w-full bg-black/30 border border-white/10 rounded-2xl py-3 pl-11 pr-4 outline-none text-white"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterButton>
            <FilterButton
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </FilterButton>
            <FilterButton
              active={filter === "ongoing"}
              onClick={() => setFilter("ongoing")}
            >
              Ongoing
            </FilterButton>
            <FilterButton
              active={filter === "clean"}
              onClick={() => setFilter("clean")}
            >
              Clean
            </FilterButton>
            <FilterButton
              active={filter === "medium"}
              onClick={() => setFilter("medium")}
            >
              Medium Risk
            </FilterButton>
            <FilterButton
              active={filter === "high"}
              onClick={() => setFilter("high")}
            >
              High Risk
            </FilterButton>
          </div>
        </div>

        {/* HISTORY CARDS */}
        {filteredInterviews.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <h2 className="text-3xl font-bold mb-3">No interviews found</h2>
            <p className="text-gray-400 mb-8">
              Start your first AI interview and your progress will appear here.
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-600 font-bold"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredInterviews.map((item, index) => (
              <InterviewCard
                key={item._id}
                item={item}
                index={index}
                onView={() => setSelectedInterview(item)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedInterview && (
          <ReportModal
            interview={selectedInterview}
            onClose={() => setSelectedInterview(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .glass-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          backdrop-filter: blur(18px);
          box-shadow: 0 0 60px rgba(34,211,238,0.08);
        }
      `}</style>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.04 }}
    className={`rounded-3xl p-6 bg-gradient-to-br ${color} shadow-[0_0_50px_rgba(0,0,0,0.25)] relative overflow-hidden`}
  >
    <div className="absolute -right-5 -top-5 opacity-20 scale-[2]">
      {icon}
    </div>
    <div className="mb-4">{icon}</div>
    <p className="text-sm opacity-80">{title}</p>
    <h2 className="text-4xl font-black mt-2">{value}</h2>
  </motion.div>
);

const InterviewCard = ({ item, index, onView }) => {
  const riskColor =
    item.cheatingStatus === "high"
      ? "text-red-400 bg-red-500/10 border-red-400/20"
      : item.cheatingStatus === "medium"
      ? "text-yellow-400 bg-yellow-500/10 border-yellow-400/20"
      : "text-green-400 bg-green-500/10 border-green-400/20";

  const scoreColor =
    item.finalScore >= 8
      ? "text-green-400"
      : item.finalScore >= 5
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6"
    >
      <div className="flex justify-between gap-5 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {item.role || "AI Interview"}
          </h2>
          <p className="text-gray-400 mt-1">
            {item.mode} • {item.experience}
          </p>
        </div>

        <div className={`text-4xl font-black ${scoreColor}`}>
          {Number(item.finalScore || 0).toFixed(1)}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <Badge icon={<Calendar size={14} />}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Badge>

        <Badge>{item.questions?.length || 0} Questions</Badge>

        <span className={`px-3 py-1 rounded-full border text-sm ${riskColor}`}>
          {item.cheatingStatus || "clean"}
        </span>

        <Badge>{item.status || "ongoing"}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <MiniStat title="Confidence" value={item.avgConfidence || 0} />
        <MiniStat title="Communication" value={item.avgCommunication || 0} />
        <MiniStat title="Correctness" value={item.avgCorrectness || 0} />
      </div>

      <button
        onClick={onView}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
      >
        <Eye size={18} />
        View Report
      </button>
    </motion.div>
  );
};

const ReportModal = ({ interview, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0f172a] border border-white/10 rounded-3xl p-6 text-white"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-cyan-300">
              {interview.role} Report
            </h2>
            <p className="text-gray-400 mt-1">
              {interview.mode} • {new Date(interview.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X />
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <ModalStat title="Score" value={interview.finalScore || 0} />
          <ModalStat title="Confidence" value={interview.avgConfidence || 0} />
          <ModalStat title="Communication" value={interview.avgCommunication || 0} />
          <ModalStat title="Correctness" value={interview.avgCorrectness || 0} />
          <ModalStat title="Suspicion" value={interview.avgSuspicion || 0} />
        </div>

        <div className="space-y-5">
          {interview.questions?.map((q, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-black/30 border border-white/10"
            >
              <div className="flex justify-between gap-4 mb-3">
                <h3 className="font-bold text-lg">
                  Q{i + 1}. {q.question}
                </h3>
                <span className="text-cyan-300 font-black">
                  {q.score || 0}/10
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-2">Your Answer:</p>
              <p className="text-white mb-4">{q.answer || "Not answered"}</p>

              <p className="text-gray-400 text-sm mb-2">AI Feedback:</p>
              <p className="text-gray-200">{q.feedback || "No feedback"}</p>

              <div className="grid md:grid-cols-4 gap-3 mt-5">
                <MiniStat title="Confidence" value={q.confidence || 0} />
                <MiniStat title="Communication" value={q.communication || 0} />
                <MiniStat title="Correctness" value={q.correctness || 0} />
                <MiniStat title="Suspicion" value={q.suspicion || 0} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Badge = ({ children, icon }) => (
  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm flex items-center gap-2">
    {icon}
    {children}
  </span>
);

const MiniStat = ({ title, value }) => (
  <div className="bg-black/30 border border-white/10 rounded-2xl p-3">
    <p className="text-xs text-gray-400">{title}</p>
    <p className="text-lg font-bold text-white">
      {Number(value || 0).toFixed(1)}
    </p>
  </div>
);

const ModalStat = ({ title, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
    <p className="text-xs text-gray-400 mb-1">{title}</p>
    <p className="text-2xl font-black text-cyan-300">
      {Number(value || 0).toFixed(1)}
    </p>
  </div>
);

const FilterButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl border text-sm transition ${
      active
        ? "bg-cyan-500 text-white border-cyan-300"
        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
    }`}
  >
    {children}
  </button>
);

const EmptySmall = ({ text }) => (
  <div className="h-[280px] flex items-center justify-center text-gray-400">
    {text}
  </div>
);

export default History;