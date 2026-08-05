export interface UserProfile {
  goal: string;
  experience: string;
  days_per_week: number;
  session_length: number;
  equipment: string;
  injuries?: string | null;
  preferred_split: string;
}

export interface UserProfileInput {
  goal?: string;
  experience?: string;
  daysPerWeek?: number;
  days_per_week?: number;
  sessionLength?: number;
  session_length?: number;
  equipment?: string;
  injuries?: string | null;
  preferredSplit?: string;
  preferred_split?: string;
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

export interface GeneratedPlanJson {
  overview: PlanOverview;
  weeklySchedule: DaySchedule[];
  progression: string;
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

export interface RawAiExercise {
  name?: string;
  sets?: number;
  reps?: string;
  rest?: string;
  rpe?: number;
  notes?: string;
  alternatives?: string[];
}

export interface RawAiDaySchedule {
  day?: string;
  focus?: string;
  exercises?: RawAiExercise[];
}

export interface RawAiOverview {
  goal?: string;
  frequency?: string;
  split?: string;
  notes?: string;
}

export interface RawAiTrainingPlanResponse {
  overview?: RawAiOverview;
  weeklySchedule?: RawAiDaySchedule[];
  progression?: string;
}

export interface SetLogInput {
  exerciseName: string;
  setNumber: number;
  weight: number | string;
  reps: number | string;
  rpe?: number | string | null;
}

export interface CreateWorkoutInput {
  userId: string;
  planId: string;
  dayName: string;
  sets: SetLogInput[];
}

export interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}