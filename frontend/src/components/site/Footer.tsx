import { Sparkles, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5" style={{ color: "oklch(0.85 0.18 195)" }} />
            <span className="font-bold">Life<span className="text-gradient">Flow</span> AI</span>
          </div>
          <p className="text-sm text-muted-foreground">Your life, orchestrated by AI.</p>
        </div>
        {[
          { title: "Product", links: ["Features", "Pricing", "Demo", "Roadmap"] },
          { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-sm font-semibold mb-3">{col.title}</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="hover:text-foreground transition">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <div>© 2026 LifeFlow AI. All systems online.</div>
          <div className="flex items-center gap-4">
            <a href="#"><Github className="h-4 w-4 hover:text-foreground transition" /></a>
            <a href="#"><Twitter className="h-4 w-4 hover:text-foreground transition" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}