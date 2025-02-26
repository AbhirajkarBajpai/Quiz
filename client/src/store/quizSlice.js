import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

// ✅ Async action to fetch quizzes from backend
export const fetchQuizzes = createAsyncThunk("quiz/fetchQuizzes", async () => {
  const response = await fetch("/api/quizzes");
  return await response.json();
});

// Async thunk to create a quiz
export const createQuiz = createAsyncThunk(
  "quiz/createQuiz",
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await api.post("/quiz/quizzes", quizData);
      console.log(response);
      return response.data; // Assuming API returns the created quiz with an ID
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating quiz");
    }
  }
);

// Async thunk to add questions
export const addQuizQuestions = createAsyncThunk(
  "quiz/addQuestions",
  async ({ quizId, questions }, { rejectWithValue }) => {
    try {
      await api.post(`/quiz/quizzes/${quizId}/questions`, { questions });
      return questions;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error adding questions");
    }
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    quizzes: [],
    currentQuiz: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetQuizState: (state) => {
      state.currentQuiz = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload; // Save created quiz data
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addQuizQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(addQuizQuestions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addQuizQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetQuizState } = quizSlice.actions;
export default quizSlice.reducer;
