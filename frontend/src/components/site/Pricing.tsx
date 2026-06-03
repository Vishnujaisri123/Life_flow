import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For curious minds.",
    features: ["Smart dashboard", "Up to 20 tasks/day", "Basic AI assistant", "Streaks & XP"],
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    desc: "For peak performers.",
    features: ["Unlimited AI timetables", "Voice reminders", "Deep analytics", "Pomodoro + habits", "Priority AI"],
    featured: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/mo",
    desc: "For unstoppable squads.",
    features: ["Everything in Pro", "Shared goals", "Team analytics", "Custom AI persona", "API access"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Plans that <span className="text-gradient">level up</span> with you
          </h2>
          <p className="text-muted-foreground text-lg">Cancel anytime. No quests required.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${p.featured ? "neon-border animate-pulse-glow" : "glass"}`}
              style={p.featured ? { background: "linear-gradient(180deg, oklch(0.2 0.08 290 / 0.7), oklch(0.15 0.05 270 / 0.7))" } : {}}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  Most popular
                </div>
              )}
              <div className="text-sm text-muted-foreground mb-2">{p.desc}</div>
              <div className="text-2xl font-semibold mb-4">{p.name}</div>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-bold text-gradient">{p.price}</span>
                {p.period && <span className="text-muted-foreground mb-2">{p.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4" style={{ color: "oklch(0.9 0.2 140)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-medium transition ${p.featured ? "text-primary-foreground" : "glass hover:border-primary/60"}`}
                style={p.featured ? { background: "var(--gradient-primary)" } : {}}
              >
                {p.featured ? "Start Pro trial" : "Choose plan"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}