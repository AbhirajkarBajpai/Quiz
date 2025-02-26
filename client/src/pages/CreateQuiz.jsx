import React, { useState } from "react";
import "./CreateQuiz.css"; // Import CSS file

const CreateQuiz = ({ onNext }) => {
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    numQuestions: "",
    score: "",
    duration: "",
  });

  const handleChange = (e) => {
    setQuizDetails({ ...quizDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quizDetails.title || !quizDetails.numQuestions || !quizDetails.score || !quizDetails.duration) {
      alert("Please fill in all fields.");
      return;
    }
    onNext(quizDetails); // Proceed to next step
  };

  return (
    <div className="create-quiz-container">
      <h2>Create Quiz Step 1</h2>
      <form onSubmit={handleSubmit}>
        <label>Enter Quiz Title:</label>
        <input type="text" name="title" value={quizDetails.title} onChange={handleChange} />

        <label>Number of Questions:</label>
        <input type="number" name="numQuestions" value={quizDetails.numQuestions} onChange={handleChange} min="1" max="10" />

        <label>Enter Score:</label>
        <input type="number" name="score" value={quizDetails.score} onChange={handleChange} min="1" />

        <label>Enter Duration (in minutes):</label>
        <input type="number" name="duration" value={quizDetails.duration} onChange={handleChange} min="1" />

        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default CreateQuiz;
