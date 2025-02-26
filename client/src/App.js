import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkLoginStatus } from "./store/authSlice";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

const App = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkLoginStatus());
  }, [dispatch]);

  if (isLoading) return <h2>Loading...</h2>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/user-dashboard"} /> : <Login />} />
        <Route path="/admin-dashboard" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/user-dashboard" element={user?.role === "user" ? <UserDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
