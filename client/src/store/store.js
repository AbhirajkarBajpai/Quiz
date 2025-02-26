import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import quizReducer from "./quizSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
  },
});

export default store;
