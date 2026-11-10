# 03 Fernhall print farm floor

A floor dashboard for a 12-printer 3D print farm, 90 days of data. The waffle chart is the farm's real schedule: each
column is a day, each square one printer on that day (orange printed, ink failed, grey idle). Pick a
printer in "Running now" to light its squares across 60 days and filter every figure to it.

Below the chart: spool stock, why prints failed, the queue with on-time/late status, service due per
printer, customers billed, power use and on-time shipping, all computed from the same printer-days.

References used for mood and card styles only (warm off-white, orange on light grey, a dot-matrix column chart); the
layout, subject and data are original.

## Use this section in another app
- Packages: `motion`, `next` (for `next/font/local`).
- Files: `Section.tsx`, `data.ts`, `post.css`, `fonts/` (Geist Sans and Geist Mono, OFL).

```tsx
import FernhallPrintFarm from "./sections/03-fernhall-print-farm/Section";
<div style={{ height: "100dvh" }}><FernhallPrintFarm /></div>
```
