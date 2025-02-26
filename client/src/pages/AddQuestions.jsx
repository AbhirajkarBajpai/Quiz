import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addQuizQuestions } from "../store/quizSlice";
import { useParams, useNavigate } from "react-router-dom";
import "./AddQuestions.css";

const AddQuestions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, () => ({
      questionText: "",
      marks: 5,
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
    }))
  );

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (qIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options.length < 4) {
      updatedQuestions[qIndex].options.push({ optionText: "", isCorrect: false });
      setQuestions(updatedQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addQuizQuestions({ quizId, questions }));
      alert("Questions added successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding questions:", error);
    }
  };

  return (
    <div className="add-questions-container">
      <h2>Create Quiz Step 2</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="question-block">
            <label>Question {qIndex + 1}:</label>
            <input
              type="text"
              value={question.questionText}
              onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
              required
            />

            <label>Marks:</label>
            <input
              type="number"
              value={question.marks}
              onChange={(e) => handleQuestionChange(qIndex, "marks", e.target.value)}
              min="1"
              required
            />

            <div className="options-container">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-block">
                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, "optionText", e.target.value)}
                    required
                  />
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, "isCorrect", e.target.checked)}
                  />
                  <label>Correct</label>
                </div>
              ))}
            </div>
            {question.options.length < 4 && (
              <button type="button" onClick={() => handleAddOption(qIndex)}>Add Option</button>
            )}
          </div>
        ))}
        <button type="submit">Create Quiz</button>
      </form>
    </div>
  );
};

export default AddQuestions;
