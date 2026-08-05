"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Calendar as CalendarIcon, Dumbbell, Activity, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WorkoutLog } from "../../types";

function VolumeChart({ history }: { history: WorkoutLog[] }) {
  if (history.length < 2) return null; // Need at least 2 points to show a trend

  // Sort history oldest to newest (left to right)
  const sorted = [...history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
   
  // Show up to the last 14 workouts
  const recentHistory = sorted.slice(-14);
  
  const chartData = recentHistory.map((log, index) => {
    const volume = log.setLogs?.reduce((acc, set) => acc + (set.weight * set.reps), 0) || 0;
    const date = new Date(log.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    return { id: log.id || String(index), date, volume, dayName: log.dayName };
  });

  return (
    <Card variant="bordered" className="mb-8">
      <div className="p-4 sm:p-6 pb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--color-accent)]" />
          Volume Progression
        </h3>
        <p className="text-xs text-[var(--color-muted)] mt-1">Total weight lifted per session</p>
      </div>
      
      <div className="h-64 px-4 sm:px-6 pb-6 pt-4 mt-2 border-t border-[var(--color-border)]/30">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: 'var(--color-muted)' }} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'var(--color-muted)' }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
            />
            <Tooltip 
              cursor={{ fill: 'var(--color-accent)', opacity: 0.1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl px-3 py-2 rounded-lg text-xs">
                      <p className="font-bold text-white mb-0.5">{data.volume.toLocaleString()} lbs</p>
                      <p className="text-[var(--color-muted)] capitalize">{data.dayName}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="volume" 
              fill="var(--color-accent)" 
              radius={[4, 4, 0, 0]} 
              barSize={32}
              fillOpacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function HistoryDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user) {
      fetchHistory(user.id);
    }
  }, [user, isLoading, router]);

  const fetchHistory = async (userId: string) => {
    try {
      const data = await api.getWorkoutHistory(userId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const toggleExpand = (logId: string) => {
    setExpandedLogId((prev) => (prev === logId ? null : logId));
  };

  if (isLoading || isFetching) {
    return <div className="min-h-screen flex items-center justify-center">Loading history...</div>;
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/profile" className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--color-muted)] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Workout History</h1>
        <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6 sm:mb-8">Review your past workouts and track your progress.</p>

        {history.length === 0 ? (
          <Card variant="bordered" className="text-center py-10 sm:py-12 px-4">
            <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-muted)] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No workouts logged yet</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6">Start your first workout to see your history here.</p>
            <Button size="sm" onClick={() => router.push("/profile")}>Go to Training Plan</Button>
          </Card>
        ) : (
          <>
            <VolumeChart history={history} />
            <div className="space-y-4 sm:space-y-6">
            {history.map((log) => {
              const date = new Date(log.createdAt).toLocaleDateString("en-US", {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
              });
              
              // Calculate total volume
              const totalVolume = log.setLogs?.reduce((acc, set) => acc + (set.weight * set.reps), 0) || 0;
              const totalSets = log.setLogs?.length || 0;
              
              // Group exercises to display a summary
              const exerciseNames = Array.from(new Set(log.setLogs?.map(s => s.exerciseName)));
              
              const isExpanded = expandedLogId === log.id;

              return (
                <Card key={log.id} variant="bordered" className="overflow-hidden p-3.5 sm:p-4 transition-all duration-200 hover:border-[var(--color-accent)]/50">
                  <div 
                    className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-lg capitalize">{log.dayName}</h3>
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full">
                          {totalSets} Sets
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> {date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Vol: {totalVolume.toLocaleString()} lbs
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                      <p className="text-xs text-[var(--color-muted)] truncate max-w-[140px] sm:max-w-[200px]">
                        {exerciseNames.join(", ")}
                      </p>
                      <Button variant="ghost" size="sm" className="p-1.5 hover:bg-transparent text-[var(--color-muted)] hover:text-white shrink-0" onClick={(e) => { e.stopPropagation(); toggleExpand(log.id); }}>
                        {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && log.setLogs && (
                    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                      {exerciseNames.map(exName => {
                        const setsForEx = log.setLogs!.filter(s => s.exerciseName === exName);
                        return (
                          <div key={exName} className="mb-6 last:mb-0">
                            <h4 className="text-sm font-medium mb-3 text-[var(--color-accent)]">{exName}</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider text-left border-b border-[var(--color-border)]/50">
                                    <th className="py-2 pr-4 font-medium w-16">Set</th>
                                    <th className="py-2 px-4 font-medium">Weight</th>
                                    <th className="py-2 px-4 font-medium">Reps</th>
                                    <th className="py-2 px-4 font-medium">RPE</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {setsForEx.map((set, i) => (
                                    <tr key={set.id || i} className="border-b border-[var(--color-border)]/30 last:border-0 hover:bg-white/5 transition-colors">
                                      <td className="py-2 pr-4 text-[var(--color-muted)]">{set.setNumber}</td>
                                      <td className="py-2 px-4">{set.weight}</td>
                                      <td className="py-2 px-4">{set.reps}</td>
                                      <td className="py-2 px-4">{set.rpe || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
