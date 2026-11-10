import localFont from "next/font/local";

// Geist Sans and Geist Mono (OFL) for UI and figures, Funnel Display (OFL) for the large numbers. Served locally.
export const geist = localFont({
  src: [
    { path: "./geist-sans-400.woff2", weight: "400" },
    { path: "./geist-sans-500.woff2", weight: "500" },
  ],
  variable: "--font-wl",
  display: "swap",
});
export const geistMono = localFont({ src: "./GeistMono-400.woff2", variable: "--font-wl-mono", display: "swap" });
export const funnel = localFont({ src: "./funnel-display-400.woff2", variable: "--font-wl-display", display: "swap" });
