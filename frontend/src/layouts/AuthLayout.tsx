import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/routes/paths";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-radial-glow)" }} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link to={ROUTES.home} className="mb-8 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6" style={{ color: "oklch(0.85 0.18 195)" }} />
          <span className="text-xl font-bold">
            Life<span className="text-gradient">Flow</span> AI
          </span>
        </Link>
        <div className="glass neon-border rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)]">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
