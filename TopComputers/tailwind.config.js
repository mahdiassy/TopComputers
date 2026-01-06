/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand colors based on typical computer store logo palette
        brand: {
          primary: "#1a365d",    // Deep blue
          secondary: "#2d3748",  // Dark gray
          accent: "#3182ce",     // Bright blue
          light: "#63b3ed",      // Light blue
          dark: "#0f1419",       // Almost black
          orange: "#ed8936",     // Orange accent
          green: "#38a169",      // Success green
          red: "#e53e3e",        // Error red
        },
        gray: {
          850: "#1f2937",
          900: "#111827",
          950: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
