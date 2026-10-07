import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6",
        "dark-bg": "#0a1a14",
        "dark-card": "#112a1f",
        "dark-border": "#1a3d2b",
        "dark-input": "#0d2018",
      },
    },
  },
  plugins: [],
};
export default config;
