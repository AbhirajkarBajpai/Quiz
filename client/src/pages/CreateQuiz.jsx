import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createQuiz } from "../store/quizSlice";
import { useNavigate } from "react-router-dom";
import "./CreateQuiz.css";

const CreateQuiz = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.quiz);

  const [quizDetails, setQuizDetails] = useState({
    title: "",
    totalQuestions: "",
    totalScore: "",
    duration: "",
  });

  const handleChange = (e) => {
    setQuizDetails({ ...quizDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizDetails.title || !quizDetails.totalQuestions || !quizDetails.totalScore || !quizDetails.duration) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const resultAction = await dispatch(createQuiz(quizDetails));
      console.log("act", resultAction);
      if (createQuiz.fulfilled.match(resultAction)) {
        navigate(`/admin/add-questions/${resultAction.payload.quiz._id}`);
      }
    } catch (error) {
      console.error("Quiz creation failed", error);
    }
  };

  return (
    <div className="create-quiz-container">
      <h2>Create Quiz Step 1</h2>
      <form onSubmit={handleSubmit}>
        <label>Enter Quiz Title:</label>
        <input type="text" name="title" value={quizDetails.title} onChange={handleChange} />

        <label>Number of Questions:</label>
        <input type="number" name="totalQuestions" value={quizDetails.totalQuestions} onChange={handleChange} min="1" max="10" />

        <label>Enter Score:</label>
        <input type="number" name="totalScore" value={quizDetails.totalScore} onChange={handleChange} min="1" />

        <label>Enter Duration (in minutes):</label>
        <input type="number" name="duration" value={quizDetails.duration} onChange={handleChange} min="1" />

        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Next"}</button>
      </form>
    </div>
  );
};

export default CreateQuiz;
