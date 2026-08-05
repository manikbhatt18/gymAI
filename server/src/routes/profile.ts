import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import type { UserProfileInput } from "../../types/index";

export const profileRouter = Router();

profileRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, ...profileData } = req.body as UserProfileInput & { userId?: string };

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const goal = profileData.goal;
    const experience = profileData.experience;
    const daysPerWeek = profileData.daysPerWeek ?? profileData.days_per_week;
    const sessionLength = profileData.sessionLength ?? profileData.session_length;
    const equipment = profileData.equipment;
    const injuries = profileData.injuries;
    const preferredSplit = profileData.preferredSplit ?? profileData.preferred_split;

    if (
      !goal ||
      !experience ||
      !daysPerWeek ||
      !sessionLength ||
      !equipment ||
      !preferredSplit
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await prisma.user_profiles.upsert({
      where: { user_id: userId },
      update: {
        goal,
        experience,
        days_per_week: Number(daysPerWeek),
        session_length: Number(sessionLength),
        equipment,
        injuries: injuries || null,
        preferred_split: preferredSplit,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        goal,
        experience,
        days_per_week: Number(daysPerWeek),
        session_length: Number(sessionLength),
        equipment,
        injuries: injuries || null,
        preferred_split: preferredSplit,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});
