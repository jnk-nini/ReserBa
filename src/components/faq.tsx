"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Icon from "./icon";

// The list of questions on the first page. One answer is open at a time and
// it slides open instead of jumping.

export default function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div
            key={item.question}
            className={`rounded-2xl border bg-surface transition-[border-color,box-shadow] duration-300 ${
              isOpen ? "border-brand/40 shadow-low" : "border-line hover:border-line-strong"
            }`}
          >
            <h3 className="font-sans text-lg tracking-normal">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`answer-${index}`}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left font-semibold"
              >
                {item.question}
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-300 ease-settle ${
                    isOpen ? "rotate-180 bg-brand text-on-brand" : "bg-brand-tint text-brand"
                  }`}
                >
                  <Icon name="chevron" className="size-4" />
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
                  <p className="max-w-[38rem] px-5 pb-5 text-ink-soft">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
