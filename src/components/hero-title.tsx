"use client";

import { motion } from "motion/react";

// The big sentence at the top of the first page. The words come into focus
// one after another, and a gold line is drawn under the last words.

const words = ["Reserve", "the", "clubhouse", "without", "the"];
const ease = [0.16, 1, 0.3, 1] as const;

export default function HeroTitle() {
  return (
    <h1 className="text-[2.625rem] leading-[1.04] font-bold tracking-tight sm:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]">
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.08 * index, ease }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
      <motion.span
        className="relative inline-block whitespace-nowrap text-accent"
        initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.08 * words.length, ease }}
      >
        back-and-forth.
        <svg
          viewBox="0 0 300 14"
          preserveAspectRatio="none"
          className="absolute inset-x-0 -bottom-2 h-3 w-full"
          aria-hidden="true"
        >
          <motion.path
            d="M3 9 C 60 2, 110 12, 160 6 S 250 3, 297 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.9, ease }}
          />
        </svg>
      </motion.span>
    </h1>
  );
}
