import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { askAi } from "../services/openRouter.services.js";

import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

// ======================================================
// ANALYZE RESUME
// ======================================================

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume required",
      });
    }

    const filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);

    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return ONLY JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1"],
  "skills": ["skill1"]
}
`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAi(messages);

    let parsed;

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

      parsed = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : null;

      if (!parsed) {
        throw new Error("Invalid AI response");
      }
    } catch (err) {
      console.log(aiResponse);

      return res.status(500).json({
        message: "AI parse failed",
      });
    }

    fs.unlinkSync(filepath);

    return res.json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: parsed.projects || [],
      skills: parsed.skills || [],
      resumeText,
    });
  } catch (error) {
    console.log(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GENERATE QUESTIONS
// ======================================================

export const generateQuestions = async (req, res) => {
  try {
    let {
      role,
      experience,
      mode,
      resumeText,
      projects,
      skills,
    } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: "Role, Experience and Mode required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits",
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are an advanced AI interviewer.

Generate EXACTLY 10 interview questions.

Return ONLY JSON ARRAY.

Format:

[
 {
   "question": "string",
   "type": "rapid | scenario | explanation",
   "difficulty": "easy | medium | hard",
   "timeLimit": number
 }
]

Rules:
- NO MCQ
- realistic questions
- short clean english
- role specific
- no repeated questions

Difficulty Rules:
easy = 60
medium = 90
hard = 120
`,
      },
      {
        role: "user",
        content: `
Role: ${role}
Experience: ${experience}
Mode: ${mode}

Projects:
${projects?.join(", ") || "None"}

Skills:
${skills?.join(", ") || "None"}

Resume:
${resumeText || "None"}
`,
      },
    ];

    const aiResponse = await askAi(messages);

    let parsed;

    try {
      const match = aiResponse.match(/\[[\s\S]*\]/);

      parsed = match
        ? JSON.parse(match[0])
        : null;

      if (!parsed) {
        throw new Error("Invalid JSON");
      }
    } catch (err) {
      console.log(aiResponse);

      return res.status(500).json({
        message: "AI parsing failed",
      });
    }

    user.credits -= 50;

    await user.save();

    const formattedQuestions = parsed.map((q) => ({
      question: q.question,
      type: q.type || "scenario",
      difficulty: q.difficulty || "medium",

      timeLimit:
        q.difficulty === "easy"
          ? 60
          : q.difficulty === "hard"
          ? 120
          : 90,

      answer: "",
      score: 0,
      feedback: "",
      suspicion: 0,

      confidence: 0,
      communication: 0,
      correctness: 0,

      visited: false,
      answered: false,
      markedForReview: false,

      status: "notVisited",
    }));

    const interview = await Interview.create({
      userId: user._id,

      role,
      experience,
      mode,

      resumeText,

      questions: formattedQuestions,
    });

    return res.json({
      interviewId: interview._id,
      questions: interview.questions,
      creditsLeft: user.credits,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Question generation failed",
    });
  }
};

// ======================================================
// SAVE ANSWER
// ======================================================

export const saveAnswer = async (req, res) => {
  try {
    const {
      interviewId,
      questionIndex,
      answer,
      markedForReview,
    } = req.body;

    const interview = await Interview.findById(
      interviewId
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const question =
      interview.questions[questionIndex];

    question.answer = answer || "";

    question.visited = true;

    question.answered = !!answer;

    question.markedForReview =
      markedForReview;

    if (markedForReview) {
      question.status = "review";
    } else if (answer) {
      question.status = "answered";
    } else {
      question.status = "visited";
    }

    await interview.save();

    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Save failed",
    });
  }
};

// ======================================================
// SUBMIT ANSWER
// ======================================================

export const submitAnswer = async (req, res) => {
  try {
    const {
      interviewId,
      questionIndex,
      answer,
      timeTaken,
      suspicion,
    } = req.body;

    const interview = await Interview.findById(
      interviewId
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const question =
      interview.questions[questionIndex];

    const userAnswer = answer || "";

    const words = userAnswer
      .trim()
      .split(/\s+/).length;

    let finalSuspicion = suspicion || 0;

    // additional backend detection

    if (timeTaken < 5) {
      finalSuspicion += 20;
    }

    if (words > 180) {
      finalSuspicion += 20;
    }

    if (
      question.type === "explanation" &&
      words < 8
    ) {
      finalSuspicion += 10;
    }

    finalSuspicion = Math.min(
      100,
      finalSuspicion
    );

    const messages = [
      {
        role: "system",
        content: `
You are an interviewer.

Evaluate the answer.

Return ONLY JSON.

{
 "confidence": number,
 "communication": number,
 "correctness": number,
 "finalScore": number,
 "feedback": "short feedback"
}

Rules:
- scores between 0-10
- realistic evaluation
- strict checking
`,
      },
      {
        role: "user",
        content: `
Question:
${question.question}

Answer:
${userAnswer}
`,
      },
    ];

    const aiResponse = await askAi(messages);

    let parsed;

    try {
      const jsonMatch =
        aiResponse.match(/\{[\s\S]*\}/);

      parsed = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : null;

      if (!parsed) {
        throw new Error("Invalid AI");
      }
    } catch (err) {
      console.log(aiResponse);

      return res.status(500).json({
        message: "AI parse failed",
      });
    }

    let finalScore =
      parsed.finalScore || 0;

    if (finalSuspicion > 70) {
      finalScore *= 0.5;
    } else if (finalSuspicion > 40) {
      finalScore *= 0.75;
    }

    question.answer = userAnswer;

    question.score = Number(
      finalScore.toFixed(1)
    );

    question.feedback =
      parsed.feedback || "";

    question.confidence =
      parsed.confidence || 0;

    question.communication =
      parsed.communication || 0;

    question.correctness =
      parsed.correctness || 0;

    question.suspicion = finalSuspicion;

    question.status = "answered";

    await interview.save();

    return res.json({
      success: true,
      feedback: parsed.feedback,
      suspicion: finalSuspicion,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Submit failed",
    });
  }
};

// ======================================================
// FINISH INTERVIEW
// ======================================================

export const finishInterview = async (
  req,
  res
) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(
      interviewId
    );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    let totalScore = 0;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    let totalSuspicion = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;

      totalConfidence +=
        q.confidence || 0;

      totalCommunication +=
        q.communication || 0;

      totalCorrectness +=
        q.correctness || 0;

      totalSuspicion +=
        q.suspicion || 0;
    });

    const count =
      interview.questions.length || 1;

    const finalScore = Number(
      (totalScore / count).toFixed(1)
    );

    const avgConfidence = Number(
      (totalConfidence / count).toFixed(1)
    );

    const avgCommunication = Number(
      (totalCommunication / count).toFixed(1)
    );

    const avgCorrectness = Number(
      (totalCorrectness / count).toFixed(1)
    );

    const avgSuspicion = Number(
      (totalSuspicion / count).toFixed(1)
    );

    let cheatingStatus = "clean";

    if (avgSuspicion > 70) {
      cheatingStatus = "high";
    } else if (avgSuspicion > 40) {
      cheatingStatus = "medium";
    }

    interview.finalScore = finalScore;

    interview.avgConfidence =
      avgConfidence;

    interview.avgCommunication =
      avgCommunication;

    interview.avgCorrectness =
      avgCorrectness;

    interview.avgSuspicion =
      avgSuspicion;

    interview.cheatingStatus =
      cheatingStatus;

    interview.status = "completed";

    await interview.save();

    return res.json({
      finalScore,

      confidence: avgConfidence,

      communication:
        avgCommunication,

      correctness:
        avgCorrectness,

      suspicion: avgSuspicion,

      cheatingStatus,

    questionWiseScore: interview.questions.map((q) => ({
  question: q.question,

  answer: q.answer,

  score: q.score || 0,

  feedback: q.feedback || "",

  confidence: q.confidence || 0,
  communication: q.communication || 0,
  correctness: q.correctness || 0,

  suspicion: q.suspicion || 0,

  type: q.type,
  difficulty: q.difficulty,
})),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Finish failed",
    });
  }
};
export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .select(
        "role experience mode finalScore avgConfidence avgCommunication avgCorrectness avgSuspicion cheatingStatus status questions createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.log("History error:", error);

    return res.status(500).json({
      message: "Failed to fetch interview history",
    });
  }
};