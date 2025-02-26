import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes } from "../store/quizSlice";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizzes, loading, error } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleQuizClick = (quizId) => {
    navigate(`/admin/quiz/${quizId}/participants`);
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <button className="create-quiz-btn" onClick={() => navigate("/admin/create-quiz")}>
        Create New Quiz
      </button>
      {loading && <p>Loading quizzes...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && quizzes.length === 0 && <p>No quizzes available. Create some!</p>}
      <div className="quiz-list">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="quiz-item" onClick={() => handleQuizClick(quiz._id)}>
            <h3>{quiz.title}</h3>
            <p>Questions: {quiz.numberOfQuestions}</p>
            <p>Duration: {quiz.duration} mins</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
