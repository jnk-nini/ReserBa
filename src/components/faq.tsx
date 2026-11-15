"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Icon from "./icon";

// The list of questions on the first page. One answer is open at a time and
// it slides open instead of jumping. The plus sign turns into a cross.

export default function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-line-strong">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} className="border-b border-line">
            <h3 className="font-sans text-lg tracking-normal">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`answer-${index}`}
                onClick={() => setOpen(isOpen ? null : index)}
                className="group flex min-h-16 w-full cursor-pointer items-center justify-between gap-6 py-4 text-left font-semibold"
              >
                <span className="transition-colors duration-150 group-hover:text-brand">{item.question}</span>
                <span
                  className={`flex size-8 shrink-0 items-center justify-center text-ink-soft transition-transform duration-300 ease-settle ${
                    isOpen ? "rotate-45 text-brand" : ""
                  }`}
                >
                  <Icon name="plus" className="size-5" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`answer-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[36rem] pr-10 pb-6 text-ink-soft">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
