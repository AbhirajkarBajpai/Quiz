const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempts");
const Question = require("../models/Questions");
const { validationResult } = require("express-validator");

// 📌 Create a new quiz
exports.createQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const quiz = await Quiz.create({
      title: req.body.title,
      totalQuestions: req.body.totalQuestions,
      totalScore: req.body.totalScore,
      duration: req.body.duration,
      createdBy: req.user.id, // Admin ID
    });
    res.status(201).json({ status: "success", quiz });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json({ status: "success", quizzes });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Add questions to a quiz
exports.addQuestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const question = await Question.create({
      quizId: req.params.id,
      questionText: req.body.questionText,
      marks: req.body.marks,
      options: req.body.options,
    });
    res.status(201).json({ status: "success", question });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Fetch participants of a quiz
exports.getParticipants = async (req, res) => {
  try {
    const participants = await Attempt.find({ quizId: req.params.id }).populate("userId", "name email");
    res.status(200).json({ status: "success", participants });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Get responses of a specific user for a quiz
exports.getUserResponse = async (req, res) => {
  try {
    const response = await Attempt.findOne({ quizId: req.params.id, userId: req.params.userId });
    if (!response) return res.status(404).json({ status: "fail", message: "No response found" });

    res.status(200).json({ status: "success", response });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Fetch quizzes assigned to the user
exports.getMyQuizzes = async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user.id }).populate("quizId");
    res.status(200).json({ status: "success", quizzes: attempts.map(a => a.quizId) });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Start a quiz
exports.startQuiz = async (req, res) => {
  try {
    let attempt = await Attempt.findOne({ quizId: req.params.id, userId: req.user.id });
    if (!attempt) {
      attempt = await Attempt.create({ quizId: req.params.id, userId: req.user.id, status: "in-progress" });
    }
    res.status(200).json({ status: "success", attempt });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Submit quiz responses
exports.submitQuiz = async (req, res) => {
  try {
    let attempt = await Attempt.findOne({ quizId: req.params.id, userId: req.user.id });
    if (!attempt || attempt.status === "completed") return res.status(400).json({ status: "fail", message: "Quiz already completed or not started" });

    attempt.responses = req.body.responses;
    attempt.status = "completed";
    attempt.score = req.body.responses.filter(r => r.isCorrect).reduce((sum, r) => sum + 5, 0);
    attempt.completedAt = new Date();

    await attempt.save();
    res.status(200).json({ status: "success", attempt });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 📌 Fetch user’s quiz results
exports.getQuizResponse = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ quizId: req.params.id, userId: req.user.id });
    if (!attempt) return res.status(404).json({ status: "fail", message: "No quiz attempt found" });

    res.status(200).json({ status: "success", attempt });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
