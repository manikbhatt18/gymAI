"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Target,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Plans",
    description:
      "Get a training program tailored to your goals, experience, and schedule in seconds.",
  },
  {
    icon: Target,
    title: "Goal-Oriented",
    description:
      "Whether you want to build muscle, lose fat, or get stronger — we optimize for your specific goal.",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description:
      "Plans that fit your lifestyle. Train 2 days or 6 — our AI adapts to your weekly availability.",
  },
  {
    icon: Clock,
    title: "Time-Efficient",
    description:
      "Every workout is designed to maximize your results in the time you actually have.",
  },
];

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/profile");
    }
  }, [user, isLoading, router]);

  if (!isLoading && user) {
    return null; // Avoid flashing the home page while redirecting
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-hidden font-sans selection:bg-[var(--color-accent)] selection:text-black">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-accent)]/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-accent)]/5 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-6 sm:px-12 lg:px-24 max-w-[1400px] mx-auto z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
        
        {/* Left Column: Text & CTA */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start animate-fade-in-up">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-[var(--color-accent)]/20 mb-8 shadow-[0_0_20px_-5px_var(--color-accent)]">
            <Zap className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="text-sm font-medium text-[var(--color-accent)] tracking-wide">
              GymAI 2.0 is live
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
            Evolve Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#4ade80]">Training</span> With AI.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            Stop guessing your sets and reps. Get a hyper-personalized, dynamic training program built by AI intelligence, tailored exactly to your goals and schedule.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 group text-black font-semibold h-14 px-8 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all shadow-[0_0_30px_-5px_var(--color-accent)] hover:shadow-[0_0_40px_0px_var(--color-accent)]">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 transition-all text-white">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Demo Account Credentials Banner */}
          <div className="mt-16 glass-card rounded-2xl p-6 text-left animate-fade-in-up animation-delay-200 border-l-4 border-l-blue-500 shadow-2xl max-w-md w-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl drop-shadow-md">👋</span>
                <p className="text-base text-blue-400 font-bold tracking-wide">Skip the setup?</p>
              </div>
              <p className="text-sm text-zinc-400 mb-4 font-medium">
                Use our demo account to instantly explore the dashboard and AI features:
              </p>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-black/40 p-3 rounded-lg border border-white/5">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold w-20">Email</span>
                  <code className="text-sm text-[var(--color-accent)] font-mono select-all font-medium">
                    demo@gymai.com
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-black/40 p-3 rounded-lg border border-white/5">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold w-20">Password</span>
                  <code className="text-sm text-[var(--color-accent)] font-mono select-all font-medium">
                    password123
                  </code>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Hero Image */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-fade-in-up animation-delay-200 z-20">
           <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-glow animate-float group">
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
              
              <Image 
                src="/hero-gym-ai.png" 
                alt="AI Gym Training" 
                fill 
                className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                priority 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Floating UI Element over image */}
              <div className="absolute bottom-8 left-8 right-8 z-20 glass-card rounded-2xl p-5 border border-white/10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center border border-[var(--color-accent)]/50 shadow-[0_0_15px_var(--color-accent)]">
                    <Sparkles className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Hypertrophy Plan</h4>
                    <p className="text-[var(--color-accent)] text-sm font-medium">Generated in 2.4s</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 sm:px-12 lg:px-24 border-t border-white/5 bg-zinc-950/80">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-20 animate-fade-in-up animation-delay-400">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">Intelligence meets Iron</h2>
            <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              We leverage advanced AI to construct the perfect training regimen. No more cookie-cutter routines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card rounded-3xl p-8 group hover:-translate-y-2 hover:bg-zinc-900/80 hover:border-[var(--color-accent)]/50 transition-all duration-300 animate-fade-in-up shadow-lg"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[var(--color-accent)]/10 transition-all duration-300 border border-white/5 group-hover:border-[var(--color-accent)]/30">
                  <feature.icon className="w-7 h-7 text-zinc-400 group-hover:text-[var(--color-accent)] transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[var(--color-accent)] transition-colors">{feature.title}</h3>
                <p className="text-zinc-400 text-base leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-[var(--color-accent)] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 font-medium">
                  Learn more <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
