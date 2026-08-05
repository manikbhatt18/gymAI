import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import OpenAI from "openai";
import dotenv from "dotenv";
import type { GeneratedPlanJson, ChatMessageInput, DaySchedule } from "../../types/index";

dotenv.config();

export const chatRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.BASE_URL || "http://localhost:3001",
    "X-Title": "GymAI Spotter",
  },
});

chatRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { messages, userId } = req.body as { messages?: ChatMessageInput[]; userId?: string };

    if (!userId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "User ID and messages array are required" });
    }

    // Retrieve the user's latest plan by version and creation time
    const latestPlan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: [
        { version: "desc" },
        { created_at: "desc" },
      ],
    });

    if (!latestPlan) {
      return res.status(404).json({ error: "No active plan found for this user." });
    }

    console.log(`[AI Spotter] Using Plan ID: ${latestPlan.id}, Version: ${latestPlan.version}`);

    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    let todaysPlan = "Rest day or not explicitly scheduled.";
    const parsedPlan = latestPlan.plan_json as unknown as GeneratedPlanJson | null;
    const weeklySchedule = parsedPlan?.weeklySchedule;
    if (Array.isArray(weeklySchedule)) {
      const foundDay = weeklySchedule.find((d: DaySchedule) => d.day === currentDay);
      if (foundDay) {
        todaysPlan = JSON.stringify(foundDay, null, 2);
      }
    }

    // System prompt with context (RAG)
    const systemPrompt = `You are the 'GymAI Spotter', a friendly and expert AI personal trainer. 
Your job is to answer the user's questions strictly based on their current workout plan.

CRITICAL INFORMATION:
Today is ${currentDay}. 
If the user asks "what should I do today" or "what is my workout today", you MUST refer to this specific plan for today:
${todaysPlan}

Here is the user's FULL workout plan for reference (for other days):
${JSON.stringify(latestPlan.plan_json)}

Rules:
- Keep answers concise, ideally 1-3 sentences.
- Be encouraging and helpful.
- If they ask for exercise alternatives, suggest ones that target the same muscle group and fit their equipment if known.
- Do not make up a new plan unless specifically asked to change something.
- Guardrails: Strictly refuse to answer questions unrelated to fitness, gym training, exercises, nutrition, or the workout plan (e.g., coding, general trivia, homework). Politely decline and bring the focus back to their workout.`;

    // stream using standard OpenAI SDK which is proven to work perfectly with OpenRouter
    const stream = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: ChatMessageInput) => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.7,
      stream: true,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content);
      }
    }
    
    res.end();
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});
