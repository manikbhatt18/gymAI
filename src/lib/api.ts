import type {
  UserProfile,
  WorkoutLog,
  BackendWorkoutLog,
  BackendSetLog,
  CreateWorkoutLogPayload,
  TrainingPlan,
} from "../types";

import { authClient } from "./auth";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

async function getAuthHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    // We use authClient.token() to explicitly get a fresh JWT, not a cached session
    const result = await (authClient as any).token();
    console.log("[DEBUG API] authClient.token() result:", result);
    
    // Fallback to multiple possible token paths just in case
    const token = result?.data?.session?.token || result?.data?.token;
    console.log("[DEBUG API] Extracted Token:", token ? token.substring(0, 15) + "..." : "undefined");
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("[DEBUG API] No token found to send in headers!");
    }
  } catch (e) {
    console.error("Failed to fetch fresh token:", e);
  }
  return headers;
}

async function post<T = unknown>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorData.error || "Request failed");
  }

  return res.json() as Promise<T>;
}

async function get<T = unknown>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  // For GET requests, we only need the Authorization header, but Content-Type is fine too
  const res = await fetch(`${BASE_URL}/api${path}`, { headers });
  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorData.error || "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface CurrentPlanResponse {
  id: string;
  userId: string;
  planJson: Omit<TrainingPlan, "id" | "userId" | "version" | "createdAt">;
  planText: string;
  version: number;
  createdAt: string;
}

export const api = {
  saveProfile: (
    userId: string,
    profile: Omit<UserProfile, "userId" | "updatedAt">,
  ): Promise<{ success: boolean }> => {
    return post<{ success: boolean }>("/profile", { userId, ...profile });
  },

  generatePlan: (
    userId: string,
  ): Promise<{ id: string; version: number; createdAt: string }> => {
    return post<{ id: string; version: number; createdAt: string }>("/plan/generate", { userId });
  },

  getCurrentPlan: (userId: string): Promise<CurrentPlanResponse> => {
    return get<CurrentPlanResponse>(`/plan/current?userId=${encodeURIComponent(userId)}`);
  },

  logWorkout: (data: CreateWorkoutLogPayload): Promise<{ success: boolean }> => {
    return post<{ success: boolean }>("/workouts/log", data);
  },

  getWorkoutHistory: async (userId: string): Promise<WorkoutLog[]> => {
    const data = await get<BackendWorkoutLog[]>(`/workouts/history?userId=${encodeURIComponent(userId)}`);
    return data.map((log: BackendWorkoutLog) => ({
      id: log.id,
      userId: log.user_id,
      planId: log.plan_id,
      dayName: log.day_name,
      createdAt: log.created_at,
      setLogs: log.set_logs.map((set: BackendSetLog) => ({
        id: set.id,
        exerciseName: set.exercise_name,
        setNumber: set.set_number,
        weight: Number(set.weight),
        reps: Number(set.reps),
        rpe: set.rpe !== null && set.rpe !== undefined ? Number(set.rpe) : undefined,
      })),
    }));
  },

  getPreviousWorkout: async (userId: string, dayName: string): Promise<WorkoutLog | null> => {
    const data = await get<BackendWorkoutLog | null>(
      `/workouts/previous?userId=${encodeURIComponent(userId)}&dayName=${encodeURIComponent(dayName)}`
    );
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      dayName: data.day_name,
      createdAt: data.created_at,
      setLogs: data.set_logs.map((set: BackendSetLog) => ({
        id: set.id,
        exerciseName: set.exercise_name,
        setNumber: set.set_number,
        weight: Number(set.weight),
        reps: Number(set.reps),
        rpe: set.rpe !== null && set.rpe !== undefined ? Number(set.rpe) : undefined,
      })),
    };
  },
};
