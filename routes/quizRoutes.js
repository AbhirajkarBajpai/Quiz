const express = require("express");
const { body } = require("express-validator");
const quizController = require("../controllers/quizController");
const { protect } = require("../controllers/authController");

const router = express.Router();

//Admin Routes
router.post(
  "/quizzes",
  protect,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("totalQuestions").isInt({ min: 1 }).withMessage("Total questions must be at least 1"),
    body("totalScore").isInt({ min: 1 }).withMessage("Total score must be at least 1"),
    body("duration").isInt({ min: 1 }).withMessage("Duration must be at least 1 minute"),
  ],
  quizController.createQuiz
);

router.get("/quizzes", protect, quizController.getAllQuizzes);
router.post(
  "/quizzes/:id/questions",
  protect,
  [
    body("questionText").notEmpty().withMessage("Question text is required"),
    body("marks").isInt({ min: 1 }).withMessage("Marks must be at least 1"),
    body("options").isArray({ min: 2 }).withMessage("At least 2 options are required"),
  ],
  quizController.addQuestion
);
router.get("/quizzes/:id/participants", protect, quizController.getParticipants);
router.get("/quizzes/:id/response/:userId", protect, quizController.getUserResponse);

//User Routes
router.get("/my-quizzes", protect, quizController.getMyQuizzes);
router.post("/quizzes/:id/start", protect, quizController.startQuiz);
router.post("/quizzes/:id/submit", protect, quizController.submitQuiz);
router.get("/quizzes/:id/response", protect, quizController.getQuizResponse);

module.exports = router;
