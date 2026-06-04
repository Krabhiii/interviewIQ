import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
  },

  type: {
    type: String,
  },

  difficulty: {
    type: String,
  },

  timeLimit: {
    type: Number,
  },

  // =========================
  // ANSWER DATA
  // =========================

  answer: {
    type: String,
    default: "",
  },

  score: {
    type: Number,
    default: 0,
  },

  feedback: {
    type: String,
    default: "",
  },

  // =========================
  // AI EVALUATION
  // =========================

  confidence: {
    type: Number,
    default: 0,
  },

  communication: {
    type: Number,
    default: 0,
  },

  correctness: {
    type: Number,
    default: 0,
  },

  // =========================
  // CHEATING
  // =========================

  suspicion: {
    type: Number,
    default: 0,
  },

  // =========================
  // TESTBOOK STYLE TRACKING
  // =========================

  visited: {
    type: Boolean,
    default: false,
  },

  answered: {
    type: Boolean,
    default: false,
  },

  markedForReview: {
    type: Boolean,
    default: false,
  },

  // possible values:
  // notVisited
  // visited
  // answered
  // review

  status: {
    type: String,
    default: "notVisited",
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    role: String,

    experience: String,

    mode: String,

    resumeText: String,

    questions: [questionSchema],

    // =========================
    // FINAL REPORT
    // =========================

    finalScore: {
      type: Number,
      default: 0,
    },

    avgConfidence: {
      type: Number,
      default: 0,
    },

    avgCommunication: {
      type: Number,
      default: 0,
    },

    avgCorrectness: {
      type: Number,
      default: 0,
    },

    avgSuspicion: {
      type: Number,
      default: 0,
    },

    cheatingStatus: {
      type: String,
      default: "clean",
    },

    status: {
      type: String,
      default: "ongoing",
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

export default Interview;