import { motion } from "framer-motion";
import { Brain, Calendar, Bell, MessageSquare, BarChart3, Trophy, Timer, Target } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Timetable Generator", desc: "Auto-balances work, study, and rest. Detects conflicts and rebuilds your day on the fly." },
  { icon: Calendar, title: "Smart Dashboard", desc: "Tasks, focus score, streaks, and AI insights — all in one neon command center." },
  { icon: Bell, title: "Reminder Engine", desc: "Animated, voiced, snoozable. Never miss a beat with motivational alerts." },
  { icon: MessageSquare, title: "AI Chat Assistant", desc: "Conversational planner that reschedules, motivates, and tracks your goals." },
  { icon: BarChart3, title: "Deep Analytics", desc: "Weekly + monthly reports, focus hours, completion rate, AI-generated insights." },
  { icon: Trophy, title: "Gamified XP", desc: "Levels, badges, quests, and streaks make consistency addictive." },
  { icon: Timer, title: "Focus & Pomodoro", desc: "Built-in deep-work timer with ambient soundscapes and break choreography." },
  { icon: Target, title: "Goals & Habits", desc: "Long-term vision tracking with daily challenges and habit chains." },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="inline-block px-3 py-1 rounded-full glass text-xs font-medium mb-4">
            CORE SYSTEM
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            One platform.{" "}
            <span className="text-gradient">Infinite flow.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Every module is powered by AI and built to feel alive.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative glass rounded-2xl p-6 hover:border-primary/60 transition-all"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition"
                style={{ background: "var(--gradient-primary)" }}
              >
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none" style={{ boxShadow: "var(--shadow-neon)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}