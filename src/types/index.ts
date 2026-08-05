export interface User {
  id: string;
  email?: string;
  name?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  image?: string | null;
  emailVerified?: boolean;
}

export type FitnessGoal = "cut" | "bulk" | "recomp" | "strength" | "endurance";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type EquipmentAccess = "full_gym" | "home" | "dumbbells";
export type TrainingSplit = "full_body" | "upper_lower" | "ppl" | "custom";

export interface UserProfile {
  userId: string;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  sessionLength: number;
  equipment: EquipmentAccess;
  injuries?: string | null;
  preferredSplit: TrainingSplit;
  updatedAt?: string;
}

export interface PlanOverview {
  goal: string;
  frequency: string;
  split: string;
  notes: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  rpe: number;
  notes?: string;
  alternatives?: string[];
}

export interface DaySchedule {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface TrainingPlan {
  id: string;
  userId: string;
  overview: PlanOverview;
  weeklySchedule: DaySchedule[];
  progression: string;
  version: number;
  createdAt: string;
}

export interface SetLog {
  id?: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  planId: string;
  dayName: string;
  createdAt: string;
  setLogs?: SetLog[];
}

export interface BackendSetLog {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
}

export interface BackendWorkoutLog {
  id: string;
  user_id: string;
  plan_id: string;
  day_name: string;
  created_at: string;
  set_logs: BackendSetLog[];
}

export interface CreateWorkoutLogPayload {
  userId: string;
  planId: string;
  dayName: string;
  sets: SetLog[];
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
}