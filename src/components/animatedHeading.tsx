"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

// Banner heading + subtext with animation loop
export function AnimatedBannerText() {
  // const t = useTranslations("HomePage");
  const t = useTranslations("HomePage");

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: [0, -4, 0], // lặp hiệu ứng nhẹ
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-4xl sm:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-[0_2px_15px_rgba(255,180,50,0.5)]"
      >
        {t("title")}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: [0, 2, 0],
        }}
        transition={{
          delay: 0.3,
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mt-4 text-lg sm:text-xl text-white drop-shadow-md"
      >
        {t("slogan")}
      </motion.p>
    </div>
  );
}

// Section heading with pulse glow
export function AnimatedSectionHeading() {
  const t = useTranslations("HomePage");
  return (
    <motion.h2
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: [1, 1.05, 1] }}
      viewport={{ once: true }}
      transition={{
        duration: 1.6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 3,
      }}
      className="text-center text-3xl sm:text-4xl font-bold mb-12 tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-black dark:text-white"
    >
      {t("h2")}
    </motion.h2>
  );
}
