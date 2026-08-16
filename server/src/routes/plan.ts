import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { generateTrainingPlan } from "../lib/ai";
import type { InputJsonValue } from "../generated/prisma/internal/prismaNamespace";
import type { GeneratedPlanJson } from "../../types/index";
import { requireAuth } from "../middleware/auth";

export const planRouter = Router();

planRouter.post("/generate", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      res
        .status(400)
        .json({ error: "User profile not found. Complete onboarding first." });
      return;
    }

    // Retrieve the latest plan to compute next version
    const latestPlan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: [
        { version: "desc" },
        { created_at: "desc" },
      ],
      select: { version: true },
    });

    const nextVersion = latestPlan ? latestPlan.version + 1 : 1;
    let planJson: GeneratedPlanJson;

    try {
      planJson = await generateTrainingPlan(profile);
    } catch (error) {
      console.error("AI generation failed:", error);
      res.status(500).json({
        error: "Failed to generate training plan. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }

    const planText = JSON.stringify(planJson, null, 2);

    const newPlan = await prisma.training_plans.create({
      data: {
        user_id: userId,
        plan_json: planJson as unknown as InputJsonValue,
        plan_text: planText,
        version: nextVersion,
      },
    });

    res.json({
      id: newPlan.id,
      version: newPlan.version,
      createdAt: newPlan.created_at,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

planRouter.get("/current", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const plan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: [
        { version: "desc" },
        { created_at: "desc" },
      ],
    });

    if (!plan) {
      res.status(404).json({ error: "No plan found" });
      return;
    }

    res.json({
      id: plan.id,
      userId: plan.user_id,
      planJson: plan.plan_json,
      planText: plan.plan_text,
      version: plan.version,
      createdAt: plan.created_at,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});
