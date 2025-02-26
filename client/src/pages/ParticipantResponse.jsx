import React, { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const ParticipantResponse = () => {
    const { quizId, participantId } = useParams();
    const [responses, setResponses] = useState([]);
  
    useEffect(() => {
      axios.get(`/api/quiz/quizzes/${quizId}/response/${participantId}`, { withCredentials: true })
        .then(res => setResponses(res.data))
        .catch(err => console.error(err));
    }, [quizId, participantId]);
  
    return (
      <div className="admin-dashboard">
        <h2>Responses for Participant {participantId}</h2>
        <div className="response-list">
          {responses.map((response, index) => (
            <div key={index} className="response-item">
              <p><strong>Q{index + 1}:</strong> {response.questionText}</p>
              <p><strong>Answer:</strong> {response.answer}</p>
              <p className={response.isCorrect ? "correct" : "incorrect"}>
                {response.isCorrect ? "✔️ Correct" : "❌ Incorrect"}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default ParticipantResponse
