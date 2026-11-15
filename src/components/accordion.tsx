"use client";

import { useState } from "react";
import Icon from "./icons";

// A list of questions. A tap opens the answer with a short slide; opening one
// closes the one before it, so the page stays short.

export type AccordionItem = { question: string; answer: string };

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="flex flex-col divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <li
            key={item.question}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`answer-${index}`}
                id={`question-${index}`}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-medium sm:text-[1.0625rem]"
              >
                {item.question}
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-ink-soft transition duration-300 ${
                    isOpen ? "rotate-180 bg-brand-tint text-brand" : ""
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
                <p className="max-w-prose pr-10 pb-5 text-base leading-relaxed text-ink-soft">{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
