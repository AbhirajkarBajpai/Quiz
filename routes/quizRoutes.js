const express = require("express");
const { body } = require("express-validator");
const quizController = require("../controllers/quizController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect); 

//User Routes
router.get("/my-quizzes",  quizController.getMyQuizzes);
router.post("/quizzes/:id/start",  quizController.startQuiz);
router.post("/quizzes/:quizId/question/:questionId/submit", authController.protect, quizController.submitQuestion);
router.post("/quizzes/:id/submit",  quizController.submitQuiz);
router.get("/quizzes/:id/response",  quizController.getQuizResponse);


//Admin Routes
router.use(authController.restrictTo("admin"));
router.post(
  "/quizzes",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("totalQuestions").isInt({ min: 1 }).withMessage("Total questions must be at least 1"),
    body("totalScore").isInt({ min: 1 }).withMessage("Total score must be at least 1"),
    body("duration").isInt({ min: 1 }).withMessage("Duration must be at least 1 minute"),
  ],
  quizController.createQuiz
);

router.get("/quizzes", quizController.getAllQuizzes);
router.post(
  "/quizzes/:id/questions",
  [
    body("questions").isArray({ min: 1, max: 10 }).withMessage("You can add 1 to 10 questions at a time"),
    body("questions.*.questionText").notEmpty().withMessage("Each question must have text"),
    body("questions.*.marks").isInt({ min: 1 }).withMessage("Each question must have marks"),
    body("questions.*.options").isArray({ min: 2 }).withMessage("Each question must have at least 2 options"),
    body("questions.*.options.*.optionText").notEmpty().withMessage("Each option must have text"),
    body("questions.*.options.*.isCorrect").isBoolean().withMessage("Each option must specify if it is correct"),
  ],
  quizController.addQuestions
);

router.get("/quizzes/:id/participants", quizController.getParticipants);
router.get("/quizzes/:id/response/:userId", quizController.getUserResponse);

module.exports = router;
