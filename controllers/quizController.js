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
exports.addQuestions = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const questions = req.body.questions.map((q) => ({
      quizId: req.params.id,
      questionText: q.questionText,
      marks: q.marks,
      options: q.options,
    }));

    const createdQuestions = await Question.insertMany(questions);

    res.status(201).json({ status: "success", questions: createdQuestions });
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
    let attempts = await Attempt.find({ userId: req.user.id }).populate("quizId");

    if (attempts.length === 0) {
      // If user has no attempts, return all available quizzes with 'start' status
      const allQuizzes = await Quiz.find().select("title totalQuestions totalScore duration");
      return res.status(200).json({
        status: "success",
        quizzes: allQuizzes.map((quiz) => ({
          _id: quiz._id,
          title: quiz.title,
          totalQuestions: quiz.totalQuestions,
          totalScore: quiz.totalScore,
          duration: quiz.duration,
          status: "start", // Initial status for new users
        })),
      });
    }

    // Format existing attempts
    const formattedAttempts = attempts.map((attempt) => ({
      _id: attempt.quizId._id,
      title: attempt.quizId.title,
      totalQuestions: attempt.quizId.totalQuestions,
      totalScore: attempt.quizId.totalScore,
      duration: attempt.quizId.duration,
      status: attempt.status, // in-progress or completed
    }));

    res.status(200).json({ status: "success", quizzes: formattedAttempts });
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

exports.submitQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { selectedOptionText } = req.body;

    let attempt = await Attempt.findOne({ quizId, userId: req.user.id });
    
    if (!attempt) {
      // Create new attempt if it doesn't exist
      attempt = await Attempt.create({
        userId: req.user.id,
        quizId,
        status: "in-progress",
        responses: [],
      });
    }

    // Check if the question already has a response (prevent duplicate submission)
    const existingResponseIndex = attempt.responses.findIndex((r) => r.questionId.toString() === questionId);
    
    if (existingResponseIndex !== -1) {
      return res.status(400).json({ status: "fail", message: "Question already submitted" });
    }

    // Find the correct answer
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ status: "fail", message: "Question not found" });

    const correctOption = question.options.find((option) => option.isCorrect);
    const isCorrect = correctOption.optionText === selectedOptionText;

    // Save response
    attempt.responses.push({ questionId, selectedOptionText, isCorrect });
    
    // Update status if all questions are answered
    if (attempt.responses.length === question.marks) {
      attempt.status = "completed";
      attempt.completedAt = new Date();
    }

    await attempt.save();

    res.status(200).json({ status: "success", attempt });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};


exports.submitQuiz = async (req, res) => {
  try {
    let attempt = await Attempt.findOne({ quizId: req.params.id, userId: req.user.id });

    if (!attempt) {
      return res.status(400).json({ status: "fail", message: "Quiz not started yet!" });
    }

    if (attempt.status === "completed") {
      return res.status(400).json({ status: "fail", message: "Quiz already completed!" });
    }

    // Check if all questions are answered
    const totalQuestions = await Question.countDocuments({ quizId: req.params.id });
    if (attempt.responses.length < totalQuestions) {
      return res.status(400).json({ status: "fail", message: "All questions must be answered before submitting the quiz!" });
    }

    // Calculate final score
    const finalScore = attempt.responses.filter((r) => r.isCorrect).reduce((sum, r) => sum + 5, 0);

    // Update attempt
    attempt.status = "completed";
    attempt.score = finalScore;
    attempt.completedAt = new Date();

    await attempt.save();

    res.status(200).json({
      status: "success",
      message: "Quiz submitted successfully!",
      score: finalScore,
      attempt,
    });
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
