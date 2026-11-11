import localFont from "next/font/local";

// All OFL. Instrument Sans for the display line, Geist for text, Geist Mono for small figures, and three
// faces used only to draw the invented customer wordmarks.
export const instrument = localFont({ src: "./InstrumentSans-var.woff2", weight: "400 700", variable: "--font-ts-display", display: "swap" });
export const geist = localFont({
  src: [
    { path: "./geist-sans-400.woff2", weight: "400" },
    { path: "./geist-sans-500.woff2", weight: "500" },
  ],
  variable: "--font-ts",
  display: "swap",
});
export const geistMono = localFont({ src: "./GeistMono-400.woff2", variable: "--font-ts-mono", display: "swap" });
export const funnel = localFont({ src: "./funnel-display-500.woff2", variable: "--font-ts-funnel", display: "swap" });
export const garamond = localFont({ src: "./EBGaramond-400.woff2", variable: "--font-ts-garamond", display: "swap" });
export const instrumentSerif = localFont({ src: "./InstrumentSerif-Italic.woff2", style: "italic", variable: "--font-ts-serif", display: "swap" });
