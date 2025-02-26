const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
  score: { type: Number, default: 0 },
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      selectedOptionText: { type: String, required: true }, 
      isCorrect: { type: Boolean, required: true },
    },
  ],
  completedAt: { type: Date },
});

module.exports = mongoose.model("Attempt", AttemptSchema);
