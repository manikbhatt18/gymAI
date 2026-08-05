"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ArrowLeft, Save, Calculator, Check } from "lucide-react";
import Link from "next/link";
import type { SetLog } from "../../../types";
import { PlateCalculator } from "../../../components/workout/PlateCalculator";
import { RestTimer } from "../../../components/workout/RestTimer";

function parseRestStringToSeconds(restStr?: string): number {
  if (!restStr) return 90;
  const lower = restStr.toLowerCase();
  
  // Match range like "60-90 sec" or "2-3 min" -> take the upper bound
  if (lower.includes("min")) {
    const numbers = lower.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length > 0) {
      const highestNum = parseFloat(numbers[numbers.length - 1]);
      return Math.round(highestNum * 60);
    }
    return 120;
  }
  
  if (lower.includes("sec") || lower.includes("s")) {
    const numbers = lower.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[numbers.length - 1], 10);
    }
    return 90;
  }
  
  const parsed = parseInt(restStr, 10);
  return isNaN(parsed) ? 90 : parsed;
}

// Determines whether an exercise uses standard Olympic plates / barbells / plate-loaded machines
function isPlateOrBarbellExercise(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes("barbell") ||
    lower.includes("bench press") ||
    lower.includes("squat") ||
    lower.includes("deadlift") ||
    lower.includes("overhead press") ||
    lower.includes("military press") ||
    lower.includes("clean") ||
    lower.includes("snatch") ||
    lower.includes("leg press") ||
    lower.includes("hack squat") ||
    lower.includes("smith") ||
    lower.includes("hip thrust") ||
    lower.includes("sled") ||
    lower.includes("calf raise") ||
    (lower.includes("row") && !lower.includes("dumbbell") && !lower.includes("cable"))
  );
}

export default function WorkoutLogger() {
  const params = useParams();
  const dayParam = params.day as string;
  const { user, plan, isLoading } = useAuth();
  const router = useRouter();
  const [setsData, setSetsData] = useState<SetLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingPrevious, setIsFetchingPrevious] = useState(true);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // Completed sets tracker (key is originalIndex)
  const [completedSets, setCompletedSets] = useState<Record<number, boolean>>({});

  // Rest Timer state
  const [restTimerTrigger, setRestTimerTrigger] = useState<number>(0);
  const [targetRestSeconds, setTargetRestSeconds] = useState<number>(90);

  // Plate Calculator state
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [plateCalcInitialWeight, setPlateCalcInitialWeight] = useState<number>(135);
  const [plateCalcExerciseName, setPlateCalcExerciseName] = useState<string>("");
  const [activeSetIndexForCalc, setActiveSetIndexForCalc] = useState<number | null>(null);
  const [activeExerciseNameForCalc, setActiveExerciseNameForCalc] = useState<string>("");

  const decodedDay = decodeURIComponent(dayParam).toLowerCase();
  
  // Find the schedule for this day
  const daySchedule = plan?.weeklySchedule.find(
    (s) => s.day.toLowerCase() === decodedDay
  );

  useEffect(() => {
    if (!isLoading && (!user || !plan)) {
      router.replace("/profile");
      return;
    }

    const loadPreviousAndInitialize = async () => {
      if (!user || !daySchedule || setsData.length > 0) return;
      
      try {
        const previousLog = await api.getPreviousWorkout(user.id, daySchedule.day);
        
        const initialSets: SetLog[] = [];
        let didAutoFill = false;

        daySchedule.exercises.forEach((ex) => {
          for (let i = 1; i <= ex.sets; i++) {
            const prevSet = previousLog?.setLogs?.find(
              (s: SetLog) => s.exerciseName === ex.name && s.setNumber === i
            );
            
            if (prevSet) {
              didAutoFill = true;
            }

            initialSets.push({
              exerciseName: ex.name,
              setNumber: i,
              weight: prevSet?.weight || 0,
              reps: prevSet?.reps || 0,
              rpe: prevSet?.rpe || ex.rpe || undefined,
            });
          }
        });
        setSetsData(initialSets);
        setHasAutoFilled(didAutoFill);
      } catch (error) {
        console.error("Failed to load previous workout", error);
        // Fallback initialization
        const initialSets: SetLog[] = [];
        daySchedule.exercises.forEach((ex) => {
          for (let i = 1; i <= ex.sets; i++) {
            initialSets.push({
              exerciseName: ex.name,
              setNumber: i,
              weight: 0,
              reps: 0,
              rpe: ex.rpe || undefined,
            });
          }
        });
        setSetsData(initialSets);
      } finally {
        setIsFetchingPrevious(false);
      }
    };

    if (user && daySchedule && setsData.length === 0) {
      loadPreviousAndInitialize();
    }
  }, [isLoading, user, plan, router, daySchedule, setsData.length]);

  if (!plan || !daySchedule || isFetchingPrevious) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleSetChange = (index: number, field: keyof SetLog, value: string) => {
    const newData = [...setsData];
    newData[index] = {
      ...newData[index],
      [field]: field === 'weight' || field === 'reps' || field === 'rpe' ? Number(value) : value,
    };
    setSetsData(newData);
  };

  const handleToggleSetComplete = (index: number, exerciseRest?: string) => {
    const isNowComplete = !completedSets[index];
    setCompletedSets((prev) => ({
      ...prev,
      [index]: isNowComplete,
    }));

    // If marked as complete, automatically trigger the Rest Timer
    if (isNowComplete) {
      const restSecs = parseRestStringToSeconds(exerciseRest);
      setTargetRestSeconds(restSecs);
      setRestTimerTrigger(Date.now());
    }
  };

  const handleOpenPlateCalc = (weight: number, exerciseName: string, originalIndex: number) => {
    setPlateCalcInitialWeight(weight > 0 ? weight : 135);
    setPlateCalcExerciseName(exerciseName);
    setActiveSetIndexForCalc(originalIndex);
    setActiveExerciseNameForCalc(exerciseName);
    setIsPlateCalcOpen(true);
  };

  const handleApplyCalculatedWeight = (weight: number, applyToAll?: boolean) => {
    if (applyToAll && activeExerciseNameForCalc) {
      // Update all sets belonging to this exercise
      const newData = setsData.map((s) => {
        if (s.exerciseName === activeExerciseNameForCalc) {
          return { ...s, weight };
        }
        return s;
      });
      setSetsData(newData);
    } else if (activeSetIndexForCalc !== null && activeSetIndexForCalc >= 0) {
      handleSetChange(activeSetIndexForCalc, "weight", weight.toString());
    }
  };

  const handleSubmit = async () => {
    if (!user || !plan) return;
    setIsSubmitting(true);
    try {
      await api.logWorkout({
        userId: user.id,
        planId: plan.id,
        dayName: daySchedule.day,
        sets: setsData,
      });
      router.push("/profile");
    } catch (error) {
      console.error("Failed to log workout", error);
      alert("Failed to save workout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-28 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/profile" className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--color-muted)] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Log Workout: {daySchedule.day}</h1>
          <button
            onClick={() => handleOpenPlateCalc(135, "Barbell & Machine Setup", -1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 text-xs font-semibold text-[var(--color-muted)] hover:text-white transition-all shadow-sm w-fit"
            title="Open Barbell / Plate Loaded Calculator"
          >
            <Calculator className="w-4 h-4 text-[var(--color-accent)]" /> Plate Calculator
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-[var(--color-accent)] font-medium">{daySchedule.focus}</p>
          {hasAutoFilled && (
            <div className="text-[11px] sm:text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 w-fit border border-[var(--color-accent)]/20 shadow-sm shadow-[var(--color-accent)]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse"></span>
              Auto-filled from last session
            </div>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8 mb-8">
          {daySchedule.exercises.map((exercise, exIndex) => {
            const exerciseSets = setsData
              .map((s, i) => ({ ...s, originalIndex: i }))
              .filter((s) => s.exerciseName === exercise.name);

            const hasPlateCalc = isPlateOrBarbellExercise(exercise.name);

            return (
              <Card key={exIndex} variant="bordered" className="overflow-hidden p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--color-border)]/50">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{exercise.name}</h3>
                    <p className="text-xs text-[var(--color-muted)]">
                      Target: {exercise.sets} sets x {exercise.reps} reps • Rest: {exercise.rest} • RPE: {exercise.rpe}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-[10px] sm:text-xs uppercase tracking-wider text-left">
                        <th className="py-2 pr-3 sm:pr-4 font-medium w-12 sm:w-14">Set</th>
                        <th className="py-2 px-2 sm:px-4 font-medium">Lbs/Kg</th>
                        <th className="py-2 px-2 sm:px-4 font-medium">Reps</th>
                        <th className="py-2 px-2 sm:px-4 font-medium">RPE</th>
                        <th className="py-2 pl-2 sm:pl-4 font-medium text-center w-14">Done</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseSets.map((set, setIndex) => {
                        const isDone = !!completedSets[set.originalIndex];

                        return (
                          <tr
                            key={setIndex}
                            className={`border-b border-[var(--color-border)] last:border-0 transition-colors ${
                              isDone ? "bg-emerald-500/5" : ""
                            }`}
                          >
                            <td className="py-2.5 sm:py-3 pr-3 sm:pr-4 font-medium text-[var(--color-muted)]">
                              {set.setNumber}
                            </td>
                            <td className="py-2.5 sm:py-3 px-2 sm:px-4">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={set.weight || ""}
                                  onChange={(e) => handleSetChange(set.originalIndex, "weight", e.target.value)}
                                  className="w-16 sm:w-20 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                                  placeholder="0"
                                />
                                {hasPlateCalc && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenPlateCalc(
                                        set.weight || 0,
                                        exercise.name,
                                        set.originalIndex
                                      )
                                    }
                                    className="p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors"
                                    title="Calculate barbell / machine plates"
                                  >
                                    <Calculator className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 sm:py-3 px-2 sm:px-4">
                              <input
                                type="number"
                                min="0"
                                value={set.reps || ""}
                                onChange={(e) => handleSetChange(set.originalIndex, "reps", e.target.value)}
                                className="w-16 sm:w-20 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-2.5 sm:py-3 px-2 sm:px-4">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={set.rpe || ""}
                                onChange={(e) => handleSetChange(set.originalIndex, "rpe", e.target.value)}
                                className="w-14 sm:w-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                                placeholder={exercise.rpe?.toString() || ""}
                              />
                            </td>
                            <td className="py-2.5 sm:py-3 pl-2 sm:pl-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleSetComplete(set.originalIndex, exercise.rest)
                                }
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/30"
                                    : "bg-[var(--color-background)] border-[var(--color-border)] text-zinc-500 hover:text-white hover:border-[var(--color-muted)]"
                                }`}
                                title={
                                  isDone
                                    ? "Mark set incomplete"
                                    : `Mark complete & start ${exercise.rest || "90s"} rest timer`
                                }
                              >
                                {isDone ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 opacity-40" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full gap-2">
          {isSubmitting ? "Saving..." : (
            <>
              <Save className="w-5 h-5" /> Save Workout
            </>
          )}
        </Button>
      </div>

      {/* Floating Rest Timer Widget */}
      <RestTimer
        autoStartTrigger={restTimerTrigger}
        targetRestSeconds={targetRestSeconds}
      />

      {/* Barbell / Machine Plate Calculator Modal */}
      <PlateCalculator
        isOpen={isPlateCalcOpen}
        onClose={() => setIsPlateCalcOpen(false)}
        initialWeight={plateCalcInitialWeight}
        exerciseName={plateCalcExerciseName}
        onApplyWeight={handleApplyCalculatedWeight}
      />
    </div>
  );
}


