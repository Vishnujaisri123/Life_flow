import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How does the AI build my timetable?", a: "It analyzes your tasks, deadlines, energy patterns, and past focus data to generate a schedule that auto-adjusts when life happens." },
  { q: "Can I use LifeFlow offline?", a: "Yes — your dashboard, timer, and tasks work offline. AI features sync once you reconnect." },
  { q: "Is my data private?", a: "End-to-end encrypted. We never sell data and you can delete everything in one click." },
  { q: "Does it integrate with my calendar?", a: "Google, Apple, and Outlook calendars sync two-ways. Your existing events become part of the AI plan." },
  { q: "Can I customize the AI's personality?", a: "Absolutely. Pick from coach, mentor, drill-sergeant, zen — or write your own persona." },
  { q: "What about mobile?", a: "Fully responsive PWA today. Native iOS and Android apps shipping next quarter." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Questions, <span className="text-gradient">answered</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glass rounded-2xl px-6 border-none"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}