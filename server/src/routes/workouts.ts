import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import type { CreateWorkoutInput } from "../../types/index";
import { requireAuth } from "../middleware/auth";

export const workoutRouter = Router();

workoutRouter.post("/log", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId, dayName, sets } = req.body as CreateWorkoutInput;
    const userId = req.user?.id;

    if (!userId || !planId || !dayName || !sets || !Array.isArray(sets)) {
      res.status(400).json({ error: "Missing required fields or invalid sets" });
      return;
    }

    const workoutLog = await prisma.workout_logs.create({
      data: {
        user_id: userId,
        plan_id: planId,
        day_name: dayName,
        set_logs: {
          create: sets.map((set) => ({
            exercise_name: set.exerciseName,
            set_number: Number(set.setNumber),
            weight: Number(set.weight),
            reps: Number(set.reps),
            rpe: set.rpe ? Number(set.rpe) : null,
          })),
        },
      },
      include: {
        set_logs: true,
      },
    });

    res.json({ success: true, workoutLog });
  } catch (error) {
    console.error("Error logging workout:", error);
    res.status(500).json({ error: "Failed to log workout" });
  }
});

workoutRouter.get("/history", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const history = await prisma.workout_logs.findMany({
      where: { user_id: userId },
      include: {
        set_logs: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching workout history:", error);
    res.status(500).json({ error: "Failed to fetch workout history" });
  }
});

workoutRouter.get("/previous", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dayName = req.query.dayName as string;

    if (!userId || !dayName) {
      res.status(400).json({ error: "Missing required query parameters" });
      return;
    }

    const previousWorkout = await prisma.workout_logs.findFirst({
      where: {
        user_id: userId,
        day_name: dayName,
      },
      include: {
        set_logs: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!previousWorkout) {
      res.json(null);
      return;
    }

    res.json(previousWorkout);
  } catch (error) {
    console.error("Error fetching previous workout:", error);
    res.status(500).json({ error: "Failed to fetch previous workout" });
  }
});
