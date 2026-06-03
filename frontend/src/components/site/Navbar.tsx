import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ROUTES } from "@/routes/paths";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 mt-4">
        <nav className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link to={ROUTES.home} className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-[oklch(var(--neon-cyan))]" style={{ color: "oklch(0.85 0.18 195)" }} />
              <div className="absolute inset-0 blur-md opacity-70" style={{ background: "oklch(0.85 0.18 195)" }} />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Life<span className="text-gradient">Flow</span> AI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#demo" className="hover:text-foreground transition">AI Demo</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.login}
              className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              Sign in
            </Link>
            <Link
              to={ROUTES.dashboard}
              className="text-sm font-medium px-4 py-2 rounded-xl text-primary-foreground animate-pulse-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              Launch app
            </Link>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
