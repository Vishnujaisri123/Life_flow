import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/routes/paths";

export function CTA() {
  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-5xl rounded-3xl p-12 md:p-20 text-center overflow-hidden neon-border"
        style={{ background: "linear-gradient(135deg, oklch(0.2 0.1 290 / 0.6), oklch(0.18 0.08 200 / 0.6))" }}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Step into your <span className="text-gradient">system</span>.
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join 120,000+ people who let AI run the boring parts so they can focus on what matters.
          </p>
          <Link
            to={ROUTES.signup}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-primary-foreground animate-pulse-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            Begin your flow <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}