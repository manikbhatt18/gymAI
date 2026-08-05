"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { soundManager } from "../../lib/audio";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  BellRing,
} from "lucide-react";

export interface RestTimerProps {
  initialSeconds?: number;
  autoStartTrigger?: number; // timestamp or counter to trigger auto-start
  targetRestSeconds?: number; // incoming default rest duration
}

export function RestTimer({
  initialSeconds = 90,
  autoStartTrigger,
  targetRestSeconds,
}: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer helper
  const handleStart = useCallback((secondsToSet?: number) => {
    const s = secondsToSet !== undefined ? secondsToSet : remainingSeconds;
    if (s <= 0) return;
    setIsComplete(false);
    setIsRunning(true);
  }, [remainingSeconds]);

  // Pause helper
  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset helper
  const handleReset = useCallback((newTotal?: number) => {
    const resetVal = newTotal !== undefined ? newTotal : totalSeconds;
    setIsRunning(false);
    setIsComplete(false);
    setRemainingSeconds(resetVal);
  }, [totalSeconds]);

  // Preset setter
  const setPreset = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsComplete(false);
    setIsRunning(true);
  };

  // Adjust +/- seconds
  const adjustSeconds = (delta: number) => {
    setRemainingSeconds((prev) => {
      const next = Math.max(5, prev + delta);
      if (next > totalSeconds) {
        setTotalSeconds(next);
      }
      return next;
    });
    if (isComplete) setIsComplete(false);
  };

  // Handle incoming auto-start trigger
  const prevTriggerRef = useRef<number | undefined>(autoStartTrigger);
  useEffect(() => {
    if (autoStartTrigger && autoStartTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = autoStartTrigger;
      const duration = targetRestSeconds && targetRestSeconds > 0 ? targetRestSeconds : 90;
      setTotalSeconds(duration);
      setRemainingSeconds(duration);
      setIsComplete(false);
      setIsRunning(true);
      setIsMinimized(false);
    }
  }, [autoStartTrigger, targetRestSeconds]);

  // Countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsComplete(true);
            if (!isMuted) {
              soundManager.playTimerComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isMuted]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Calculate percentage
  const progressPercent =
    totalSeconds > 0 ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100)) : 0;

  return (
    <aside aria-label="Rest Timer" className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-80 shadow-2xl transition-all duration-300">
      <div
        className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
          isComplete
            ? "bg-emerald-950/90 border-emerald-500/50 shadow-emerald-500/20"
            : isRunning
            ? "bg-zinc-950/90 border-[var(--color-accent)]/50 shadow-[var(--color-accent)]/15"
            : "bg-zinc-950/85 border-[var(--color-border)] shadow-black/40"
        }`}
      >
        {/* Minimized Pill View */}
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between gap-3">
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 text-left flex-1 min-w-0"
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isComplete
                    ? "bg-emerald-500 text-white animate-bounce"
                    : isRunning
                    ? "bg-[var(--color-accent)] text-zinc-950 animate-pulse"
                    : "bg-zinc-800 text-[var(--color-muted)]"
                }`}
              >
                {isComplete ? <BellRing className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-muted)] uppercase font-semibold leading-tight">
                  {isComplete ? "Rest Complete!" : isRunning ? "Resting..." : "Rest Timer"}
                </p>
                <p className="text-sm font-mono font-bold text-white">
                  {formatTime(remainingSeconds)}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => (isRunning ? handlePause() : handleStart())}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isRunning ? "Pause" : "Start"}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-white transition-colors"
                title="Expand"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Full View */
          <div className="p-4">
            {/* Header bar */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isComplete
                      ? "bg-emerald-500 text-white animate-bounce"
                      : isRunning
                      ? "bg-[var(--color-accent)] text-zinc-950"
                      : "bg-zinc-800 text-[var(--color-muted)]"
                  }`}
                >
                  <Timer className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {isComplete ? "Rest Complete!" : "Rest Timer"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 rounded-lg text-[var(--color-muted)] hover:text-white transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-lg text-[var(--color-muted)] hover:text-white transition-colors"
                  title="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Time display & Progress */}
            <div className="text-center my-3 relative">
              <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-tight text-white drop-shadow">
                {formatTime(remainingSeconds)}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-300 ${
                    isComplete
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-emerald-400 to-[var(--color-accent)]"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={() => adjustSeconds(-15)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[var(--color-muted)] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                title="Subtract 15 seconds"
              >
                <Minus className="w-3.5 h-3.5" /> 15s
              </button>

              <button
                onClick={() => (isRunning ? handlePause() : handleStart())}
                className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 ${
                  isRunning
                    ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                    : "bg-[var(--color-accent)] hover:opacity-90 text-zinc-950"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start
                  </>
                )}
              </button>

              <button
                onClick={() => adjustSeconds(15)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[var(--color-muted)] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                title="Add 15 seconds"
              >
                <Plus className="w-3.5 h-3.5" /> 15s
              </button>

              <button
                onClick={() => handleReset()}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[var(--color-muted)] hover:text-white transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Preset Chips */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-white/10">
              {[30, 60, 90, 120, 180].map((secs) => (
                <button
                  key={secs}
                  onClick={() => setPreset(secs)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    totalSeconds === secs && !isComplete
                      ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/40"
                      : "bg-zinc-900 hover:bg-zinc-800 text-[var(--color-muted)] hover:text-white"
                  }`}
                >
                  {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
