import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import type { CreateWorkoutInput, SetLogInput } from "../../types/index";

export const workoutRouter = Router();

workoutRouter.post("/log", async (req: Request, res: Response) => {
  try {
    const { userId, planId, dayName, sets } = req.body as CreateWorkoutInput;

    if (!userId || !planId || !dayName || !sets || !Array.isArray(sets)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const createdLog = await prisma.workout_logs.create({
      data: {
        user_id: userId,
        plan_id: planId,
        day_name: dayName,
        set_logs: {
          create: sets.map((s: SetLogInput) => ({
            exercise_name: s.exerciseName,
            set_number: Number(s.setNumber),
            weight: Number(s.weight),
            reps: Number(s.reps),
            rpe: s.rpe !== undefined && s.rpe !== null && s.rpe !== "" ? Number(s.rpe) : null,
          })),
        },
      },
      include: {
        set_logs: true,
      },
    });

    const { set_logs, ...workoutLog } = createdLog;
    const newLog = { workoutLog, setLogs: set_logs };

    res.json({ success: true, log: newLog });
  } catch (error) {
    console.error("Error logging workout:", error);
    res.status(500).json({ error: "Failed to log workout" });
  }
});

workoutRouter.get("/history", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const history = await prisma.workout_logs.findMany({
      where: { user_id: userId },
      include: {
        set_logs: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch workout history" });
  }
});

workoutRouter.get("/previous", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const dayName = req.query.dayName as string;
    
    if (!userId || !dayName) {
      return res.status(400).json({ error: "User ID and dayName are required" });
    }

    const previousLog = await prisma.workout_logs.findFirst({
      where: { 
        user_id: userId,
        day_name: dayName 
      },
      include: {
        set_logs: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(previousLog || null);
  } catch (error) {
    console.error("Error fetching previous workout:", error);
    res.status(500).json({ error: "Failed to fetch previous workout" });
  }
});
