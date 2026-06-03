import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";

const messages = [
  { role: "user", text: "I have 3 tasks pending and a workout at 6pm. Plan my evening." },
  { role: "ai", text: "Got it. I've scheduled Deep Work → 4:00–5:30pm, Break 5:30–5:45pm, then your Workout at 6. I moved 'Reply to Sam' to tomorrow 9am — your peak focus window." },
  { role: "user", text: "Add a 20-min reading session after the workout." },
  { role: "ai", text: "Done ✨ 7:30–7:50pm reading. Streak +1 if you complete it. Want me to set a wind-down reminder at 10pm?" },
];

export function AIDemo() {
  return (
    <section id="demo" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3 py-1 rounded-full glass text-xs font-medium mb-4">
              LIVE AI ASSISTANT
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Talk to your day. <span className="text-gradient">It listens.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              The AI assistant understands context across your tasks, calendar, energy levels, and goals. Just type — it handles the rest.
            </p>
            <ul className="space-y-3 text-sm">
              {["Natural language scheduling", "Real-time conflict resolution", "Motivational nudges", "Goal-aware suggestions"].map((s) => (
                <li key={s} className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4" style={{ color: "oklch(0.85 0.18 195)" }} />
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-6 relative"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background" style={{ background: "oklch(0.9 0.2 140)" }} />
              </div>
              <div>
                <div className="font-semibold text-sm">Nova · Your AI</div>
                <div className="text-xs text-muted-foreground">Online · learning your patterns</div>
              </div>
            </div>

            <div className="space-y-4 min-h-[300px]">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 glass">
                    {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm max-w-[80%] ${
                      m.role === "user" ? "bg-muted" : "glass"
                    }`}
                    style={m.role === "ai" ? { boxShadow: "var(--shadow-glow-cyan)" } : {}}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <input
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                placeholder="Ask Nova anything..."
              />
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                Send
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}