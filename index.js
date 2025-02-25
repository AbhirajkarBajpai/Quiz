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

app.set("trust proxy", true);

const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://contri-frontend.vercel.app"],
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", quizRoutes);


app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// mongoose
//   .connect(
//     `mongodb+srv://21it3001:${process.env.MongoPass}@cluster0.dphm3.mongodb.net/`
//   )
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});