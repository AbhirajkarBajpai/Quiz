import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const QuizParticipants = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    axios.get(`/api/quiz/quizzes/${quizId}/participants`, { withCredentials: true })
      .then(res => setParticipants(res.data))
      .catch(err => console.error(err));
  }, [quizId]);

  return (
    <div className="admin-dashboard">
      <h2>Participants for Quiz {quizId}</h2>
      <div className="quiz-list">
        {participants.map((participant) => (
          <div
            key={participant._id}
            className="quiz-item"
            onClick={() => navigate(`/admin/quiz/${quizId}/participant/${participant._id}`)}
          >
            <p>User: {participant.name}</p>
            <p>Status: <strong>{participant.status}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};



export { QuizParticipants};
