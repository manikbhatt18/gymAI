import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { profileRouter } from "./routes/profile";
import { planRouter } from "./routes/plan";
import { workoutRouter } from "./routes/workouts";
import { chatRouter } from "./routes/chat";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration supporting local dev and deployed Vercel apps
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      // Allow localhost, Vercel deployments, and custom CLIENT_URL
      if (
        origin.includes("localhost") ||
        origin.endsWith(".vercel.app") ||
        (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for API portfolio testing
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Health check endpoint for Render / monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Root welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    name: "GymAI API",
    status: "online",
    endpoints: ["/api/profile", "/api/plan", "/api/workouts", "/api/chat", "/health"],
  });
});

// API Routes
app.use("/api/profile", profileRouter);
app.use("/api/plan", planRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

