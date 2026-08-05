"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { X, Dumbbell, Sparkles, Layers } from "lucide-react";

export interface PlateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: number;
  exerciseName?: string;
  isMachine?: boolean;
  onApplyWeight?: (weight: number, applyToAll?: boolean) => void;
}

interface PlateConfig {
  weight: number;
  color: string;
  label: string;
  heightClass: string;
  textColor: string;
}

const LBS_PLATES: PlateConfig[] = [
  { weight: 45, color: "bg-red-500 border-red-600", label: "45", heightClass: "h-28", textColor: "text-white" },
  { weight: 35, color: "bg-blue-500 border-blue-600", label: "35", heightClass: "h-24", textColor: "text-white" },
  { weight: 25, color: "bg-yellow-500 border-yellow-600", label: "25", heightClass: "h-20", textColor: "text-black" },
  { weight: 10, color: "bg-emerald-500 border-emerald-600", label: "10", heightClass: "h-16", textColor: "text-white" },
  { weight: 5, color: "bg-slate-200 border-slate-300", label: "5", heightClass: "h-12", textColor: "text-black" },
  { weight: 2.5, color: "bg-slate-600 border-slate-700", label: "2.5", heightClass: "h-9", textColor: "text-white" },
];

const KG_PLATES: PlateConfig[] = [
  { weight: 25, color: "bg-red-500 border-red-600", label: "25", heightClass: "h-28", textColor: "text-white" },
  { weight: 20, color: "bg-blue-500 border-blue-600", label: "20", heightClass: "h-24", textColor: "text-white" },
  { weight: 15, color: "bg-yellow-500 border-yellow-600", label: "15", heightClass: "h-20", textColor: "text-black" },
  { weight: 10, color: "bg-emerald-500 border-emerald-600", label: "10", heightClass: "h-16", textColor: "text-white" },
  { weight: 5, color: "bg-slate-200 border-slate-300", label: "5", heightClass: "h-12", textColor: "text-black" },
  { weight: 2.5, color: "bg-slate-600 border-slate-700", label: "2.5", heightClass: "h-9", textColor: "text-white" },
  { weight: 1.25, color: "bg-slate-400 border-slate-500", label: "1.25", heightClass: "h-7", textColor: "text-black" },
];

export function PlateCalculator({
  isOpen,
  onClose,
  initialWeight = 135,
  exerciseName,
  isMachine = false,
  onApplyWeight,
}: PlateCalculatorProps) {
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight || 135);
  
  // Check if exercise is leg press or plate loaded machine
  const isPlateLoadedExercise = useMemo(() => {
    if (isMachine) return true;
    if (!exerciseName) return false;
    const lower = exerciseName.toLowerCase();
    return (
      lower.includes("leg press") ||
      lower.includes("hack squat") ||
      lower.includes("sled") ||
      lower.includes("calf raise machine") ||
      lower.includes("plate loaded") ||
      lower.includes("smith")
    );
  }, [exerciseName, isMachine]);

  const [barWeight, setBarWeight] = useState<number>(isPlateLoadedExercise ? 0 : 45);

  // Sync initial configuration when opened
  useEffect(() => {
    if (isOpen) {
      if (initialWeight > 0) {
        setTargetWeight(initialWeight);
      } else {
        setTargetWeight(isPlateLoadedExercise ? 180 : 135);
      }
      setBarWeight(isPlateLoadedExercise ? 0 : unit === "lbs" ? 45 : 20);
    }
  }, [isOpen, initialWeight, isPlateLoadedExercise, unit]);

  const currentPlatesConfig = unit === "lbs" ? LBS_PLATES : KG_PLATES;

  // Calculate plates per side
  const calculation = useMemo(() => {
    if (targetWeight <= barWeight) {
      return {
        platesPerSide: [] as { plate: PlateConfig; count: number }[],
        weightPerSide: 0,
        totalPlateWeight: 0,
        remainder: targetWeight < barWeight ? barWeight - targetWeight : 0,
        isValid: targetWeight >= barWeight,
      };
    }

    const weightNeededOnSides = targetWeight - barWeight;
    let weightPerSideNeeded = weightNeededOnSides / 2;

    const platesPerSide: { plate: PlateConfig; count: number }[] = [];

    for (const plate of currentPlatesConfig) {
      if (weightPerSideNeeded >= plate.weight) {
        const count = Math.floor(weightPerSideNeeded / plate.weight);
        if (count > 0) {
          platesPerSide.push({ plate, count });
          weightPerSideNeeded = Number((weightPerSideNeeded - count * plate.weight).toFixed(2));
        }
      }
    }

    const totalPlateWeight =
      platesPerSide.reduce((sum, item) => sum + item.plate.weight * item.count, 0) * 2;

    return {
      platesPerSide,
      weightPerSide: totalPlateWeight / 2,
      totalPlateWeight,
      remainder: Number(weightPerSideNeeded.toFixed(2)),
      isValid: true,
    };
  }, [targetWeight, barWeight, currentPlatesConfig]);

  if (!isOpen) return null;

  const quickPicks =
    unit === "lbs"
      ? isPlateLoadedExercise
        ? [90, 180, 270, 360, 450, 540]
        : [95, 135, 185, 225, 275, 315, 405]
      : isPlateLoadedExercise
      ? [40, 80, 120, 160, 200, 240]
      : [40, 60, 80, 100, 120, 140, 180];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              {isPlateLoadedExercise ? <Layers className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {isPlateLoadedExercise ? "Machine Plate Calculator" : "Barbell Plate Calculator"}
              </h2>
              {exerciseName && (
                <p className="text-xs text-[var(--color-accent)] truncate max-w-xs font-medium">
                  {exerciseName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-border)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Target Weight */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5 uppercase tracking-wider">
              Target Total Weight ({unit.toUpperCase()})
            </label>
            <div className="relative">
              <input
                type="number"
                min={barWeight}
                step={unit === "lbs" ? "5" : "2.5"}
                value={targetWeight || ""}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-[var(--color-accent)] shadow-inner"
                placeholder={isPlateLoadedExercise ? "180" : "135"}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-muted)]">
                {unit.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Bar / Machine Sled & Unit Config */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5 uppercase tracking-wider">
                Bar / Sled Weight
              </label>
              <select
                value={barWeight}
                onChange={(e) => setBarWeight(Number(e.target.value))}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-2.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                {unit === "lbs" ? (
                  <>
                    <option value={0}>0 lbs (Leg Press / Machine)</option>
                    <option value={45}>45 lbs (Standard Olympic)</option>
                    <option value={35}>35 lbs (Women&apos;s Bar)</option>
                    <option value={55}>55 lbs (Trap / Hex Bar)</option>
                    <option value={25}>25 lbs (EZ Curl Bar)</option>
                    <option value={15}>15 lbs (Smith Bar)</option>
                  </>
                ) : (
                  <>
                    <option value={0}>0 kg (Leg Press / Machine)</option>
                    <option value={20}>20 kg (Standard Olympic)</option>
                    <option value={15}>15 kg (Women&apos;s Bar)</option>
                    <option value={25}>25 kg (Trap / Hex Bar)</option>
                    <option value={10}>10 kg (EZ Curl Bar)</option>
                    <option value={7}>7 kg (Smith Bar)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5 uppercase tracking-wider">
                Unit
              </label>
              <div className="grid grid-cols-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    if (unit !== "lbs") {
                      setUnit("lbs");
                      if (barWeight > 0) setBarWeight(45);
                      setTargetWeight(Math.round(targetWeight * 2.20462));
                    }
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    unit === "lbs"
                      ? "bg-[var(--color-accent)] text-[var(--color-background)] shadow-sm"
                      : "text-[var(--color-muted)] hover:text-white"
                  }`}
                >
                  LBS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (unit !== "kg") {
                      setUnit("kg");
                      if (barWeight > 0) setBarWeight(20);
                      setTargetWeight(Math.round(targetWeight / 2.20462));
                    }
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    unit === "kg"
                      ? "bg-[var(--color-accent)] text-[var(--color-background)] shadow-sm"
                      : "text-[var(--color-muted)] hover:text-white"
                  }`}
                >
                  KG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Pick Chips */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted)] mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Quick Select:
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {quickPicks.map((weight) => (
              <button
                key={weight}
                type="button"
                onClick={() => setTargetWeight(weight)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  targetWeight === weight
                    ? "bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted)] hover:text-white hover:border-[var(--color-muted)]"
                }`}
              >
                {weight} {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Barbell / Peg Diagram */}
        <div className="bg-gradient-to-b from-black/60 to-black/30 border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 mb-5 overflow-x-auto">
          <div className="text-center text-xs font-semibold text-[var(--color-muted)] mb-3 uppercase tracking-wider">
            {barWeight === 0 ? "Machine Peg / Sled (One Side)" : "Barbell Sleeve (One Side)"}
          </div>

          <div className="min-w-[320px] flex items-center justify-center py-4">
            {/* Bar Shaft or Machine Plate Stopper */}
            {barWeight > 0 ? (
              <div className="w-10 sm:w-16 h-3.5 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-600 rounded-l shadow-inner relative flex items-center justify-center">
                <span className="text-[9px] font-bold text-zinc-900 drop-shadow-sm select-none">BAR</span>
              </div>
            ) : (
              <div className="w-6 sm:w-8 h-16 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-l border-r-2 border-zinc-600 flex items-center justify-center shadow-lg">
                <span className="text-[8px] font-bold text-zinc-400 rotate-90 select-none">FRAME</span>
              </div>
            )}

            {/* Inner Collar */}
            <div className="w-3.5 h-14 bg-zinc-400 border-x border-zinc-600 shadow-md"></div>

            {/* Plates Stack */}
            <div className="flex items-center bg-zinc-800/80 border-y border-zinc-700 h-6 px-1 gap-1">
              {calculation.platesPerSide.length === 0 ? (
                <span className="text-[10px] text-zinc-500 italic px-4 select-none">No plates loaded</span>
              ) : (
                calculation.platesPerSide.flatMap(({ plate, count }, pIdx) =>
                  Array.from({ length: count }).map((_, cIdx) => (
                    <div
                      key={`${pIdx}-${cIdx}`}
                      className={`w-5 sm:w-6 ${plate.heightClass} ${plate.color} border rounded-sm flex items-center justify-center shadow-lg transition-all transform hover:scale-105 select-none`}
                      title={`${plate.label} ${unit}`}
                    >
                      <span
                        className={`text-[9px] sm:text-[10px] font-extrabold rotate-90 sm:rotate-0 ${plate.textColor} tracking-tight`}
                      >
                        {plate.label}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Outer Sleeve Tip */}
            <div className="w-8 sm:w-12 h-5 bg-gradient-to-r from-zinc-500 to-zinc-700 rounded-r border-r border-zinc-500 shadow-inner"></div>
          </div>
        </div>

        {/* Breakdown Summary */}
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-3.5 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[var(--color-muted)] font-medium">Load Per Side:</span>
            <span className="font-bold text-white text-right">
              {calculation.platesPerSide.length > 0
                ? calculation.platesPerSide
                    .map((item) => `${item.count} × ${item.plate.label} ${unit}`)
                    .join("  +  ")
                : `0 ${unit} (Empty)`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-[var(--color-border)]/50">
            <span className="text-[var(--color-muted)] font-medium">Total Load ({barWeight > 0 ? "Bar + Plates" : "Plates"}):</span>
            <span className="font-bold text-[var(--color-accent)]">
              {barWeight + calculation.totalPlateWeight} {unit}
            </span>
          </div>

          {calculation.remainder > 0 && (
            <p className="text-[11px] text-amber-400/90 pt-1">
              ⚠️ Remaining {calculation.remainder * 2} {unit} cannot be loaded evenly with standard plates.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {onApplyWeight && (
            <>
              <Button
                onClick={() => {
                  onApplyWeight(targetWeight, false);
                  onClose();
                }}
                className="w-full sm:flex-1"
              >
                Apply to This Set ({targetWeight} {unit})
              </Button>
              <Button
                onClick={() => {
                  onApplyWeight(targetWeight, true);
                  onClose();
                }}
                variant="secondary"
                className="w-full sm:flex-1"
              >
                Apply to All Sets
              </Button>
            </>
          )}
          <Button onClick={onClose} variant="ghost" className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

