import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        /* Firefox */
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.4) transparent",
        },

        /* WebKit (Chrome, Edge, Safari) */
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
          backdropFilter: "blur(8px)",
        },
        "*::-webkit-scrollbar-thumb": {
          background: "rgba(0, 0, 0, 0.4)", // полупрозрачный чёрный
          borderRadius: "9999px",
          backdropFilter: "blur(8px)",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0, 0, 0, 0.6)", // темнее при наведении
        },
      });
    }),
  ],
};

export default config;
