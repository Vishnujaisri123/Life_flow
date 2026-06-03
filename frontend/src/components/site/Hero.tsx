import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import heroImg from "@/assets/hero-ai.jpg";
import { ROUTES } from "@/routes/paths";

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-radial-glow)" }} />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 2 ? "oklch(0.85 0.18 195)" : "oklch(0.72 0.25 330)",
            left: `${(i * 47) % 100}%`,
            top: `${(i * 31) % 100}%`,
            boxShadow: "0 0 12px currentColor",
          }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "oklch(0.9 0.2 140)" }} />
              AI System Online · v2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              Your life,<br />
              <span className="text-gradient">orchestrated</span> by AI.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              LifeFlow AI generates intelligent timetables, tracks your focus, and rebuilds your day in real-time — a personal operating system inspired by the future.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={ROUTES.signup}
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-primary-foreground animate-pulse-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                Start your flow
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to={ROUTES.dashboard}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass hover:border-primary/60 transition"
              >
                <Play className="h-4 w-4" /> Watch demo
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-border">
              {[
                { v: "120K+", l: "Active users" },
                { v: "98%", l: "Goal hit rate" },
                { v: "4.9★", l: "User rating" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-gradient">{s.v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-full blur-3xl opacity-60" style={{ background: "var(--gradient-aurora)" }} />
            <div className="relative animate-float">
              <img
                src={heroImg}
                alt="LifeFlow AI holographic interface"
                width={1536}
                height={1024}
                className="rounded-3xl neon-border"
              />
              {/* Floating stat cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-6 top-12 glass rounded-2xl p-4 min-w-[180px]"
              >
                <div className="text-xs text-muted-foreground">Productivity</div>
                <div className="text-2xl font-bold text-gradient">94%</div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[94%] rounded-full" style={{ background: "var(--gradient-primary)" }} />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -right-4 bottom-10 glass rounded-2xl p-4"
              >
                <div className="text-xs text-muted-foreground">Streak</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  🔥 <span className="text-gradient">47</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}