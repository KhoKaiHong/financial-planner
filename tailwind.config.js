const { hairlineWidth } = require("nativewind/theme");
const defaultTheme = require("tailwindcss/defaultTheme");
import { platformSelect } from "nativewind/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        "inter-black": ["inter-black"],
        "inter-extrabold": ["inter-extrabold"],
        "inter-bold": ["inter-bold"],
        "inter-semibold": ["inter-semibold"],
        "inter-medium": ["inter-medium"],
        "inter": ["inter"],
        "inter-light": ["inter-light"],
        "inter-extralight": ["inter-extralight"],
        "inter-thin": ["inter-thin"],
        "inter-black-italic": ["inter-black-italic"],
        "inter-extrabold-italic": ["inter-extrabold-italic"],
        "inter-bold-italic": ["inter-bold-italic"],
        "inter-semibold-italic": ["inter-semibold-italic"],
        "inter-medium-italic": ["inter-medium-italic"],
        "inter-italic": ["inter-italic"],
        "inter-light-italic": ["inter-light-italic"],
        "inter-extralight-italic": ["inter-extralight-italic"],
        "inter-thin-italic": ["inter-thin-italic"],
      },
    },
  },
  plugins: [],
};
