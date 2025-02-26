import React, { useState } from "react";
import '../App.css';
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ userName, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate(result.payload.data.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
};

export default Login;
