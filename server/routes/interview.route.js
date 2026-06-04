import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {upload} from "../middlewares/multer.js"

import {
  analyzeResume,
  generateQuestions,
  submitAnswer,
  finishInterview,
  saveAnswer,
  getInterviewHistory,
} from "../controllers/interview.controller.js";
const interviewRouter = express.Router()
console.log("✅ Interview Router Loaded");
interviewRouter.post("/resume",isAuth,upload.single("resume"),analyzeResume)
interviewRouter.post(
  "/generate-questions",
  (req, res, next) => {
    console.log("➡️ Route hit before isAuth");
    next();
  },
  isAuth,
  generateQuestions
);
interviewRouter.post("/submit-answer",isAuth,submitAnswer);
interviewRouter.post("/finish",isAuth,finishInterview);
interviewRouter.post("/save-answer", isAuth,saveAnswer);
interviewRouter.get("/history", isAuth, getInterviewHistory);

export default interviewRouter


