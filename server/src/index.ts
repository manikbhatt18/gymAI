import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { profileRouter } from "./routes/profile";
import { planRouter } from "./routes/plan";
import { workoutRouter } from "./routes/workouts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

import { chatRouter } from "./routes/chat";

//API Routes
app.use("/api/profile", profileRouter);
app.use("/api/plan", planRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
