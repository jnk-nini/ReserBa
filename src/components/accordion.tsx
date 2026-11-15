"use client";

import { useState } from "react";
import Icon from "./icons";

// A list of questions. A tap opens the answer with a short slide; opening one
// closes the one before it, so the page stays short.

export type AccordionItem = { question: string; answer: string };

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <li
            key={item.question}
            className={`rounded-2xl border bg-slate-50 transition duration-200 hover:-translate-y-px hover:shadow-sm ${
              isOpen ? "border-sage/60 shadow-sm" : "border-line"
            }`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`answer-${index}`}
                id={`question-${index}`}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-base font-semibold sm:text-lg"
              >
                {item.question}
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full transition duration-300 ${
                    isOpen ? "rotate-180 bg-jade text-white" : "bg-brand-tint text-jade"
                  }`}
                >
                  <Icon name="chevron" className="size-4" />
                </span>
              </button>
            </h3>
            {/* The row grows from 0 to its own height, which is what slides. */}
            <div
              id={`answer-${index}`}
              role="region"
              aria-labelledby={`question-${index}`}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="max-w-prose px-5 pb-5 text-base text-ink-soft">{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
