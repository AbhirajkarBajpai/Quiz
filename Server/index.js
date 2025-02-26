const express = require("express");
const { authLimiter } = require("./middlewares/rateLimit");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(authLimiter);
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);


app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.get("/health", (req, res) => {
  res.send("Everything is Fine Here!");
});

mongoose
  .connect(
    `mongodb+srv://abhiraj:${process.env.MongoPass}@cluster0.0c9jl.mongodb.net/`
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});