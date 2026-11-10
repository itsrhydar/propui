import localFont from "next/font/local";

// Geist Sans for UI, Geist Mono for figures (both OFL, Vercel). Served locally.
export const geist = localFont({
  src: [
    { path: "./geist-sans-400.woff2", weight: "400" },
    { path: "./geist-sans-500.woff2", weight: "500" },
  ],
  variable: "--font-fh",
  display: "swap",
});
export const geistMono = localFont({
  src: [
    { path: "./GeistMono-400.woff2", weight: "400" },
    { path: "./GeistMono-500.woff2", weight: "500" },
  ],
  variable: "--font-fh-mono",
  display: "swap",
});
