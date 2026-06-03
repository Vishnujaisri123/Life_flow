import { motion } from "framer-motion";

const items = [
  { name: "Aria Chen", role: "PhD Candidate", text: "LifeFlow rebuilt my research schedule. I finally have evenings back." },
  { name: "Marcus Reid", role: "Founder", text: "It's like a Solo Leveling system for my startup. Streaks are dangerously addictive." },
  { name: "Yuki Tanaka", role: "Designer", text: "The AI assistant feels like a co-pilot. Reschedules without me asking." },
  { name: "Leo Park", role: "Med Student", text: "Hit a 60-day streak. My focus hours doubled in a month." },
  { name: "Sana Iqbal", role: "Product Manager", text: "The dashboard is genuinely beautiful. I open it just to look at it." },
  { name: "David Okafor", role: "Engineer", text: "Pomodoro + analytics + AI = my new operating system." },
];

export function Testimonials() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="text-gradient">high performers</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-sm leading-relaxed mb-6">"{t.text}"</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full" style={{ background: "var(--gradient-aurora)" }} />
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}