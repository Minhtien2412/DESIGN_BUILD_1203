# Villa Progress Screen

This document captures the current UX contract for `app/construction/villa-progress.tsx`.

## Purpose
- Visualize detailed finishing progress for each floor/zone of the villa project.
- Provide trade legend (sơn, cơ điện, trần thạch cao, máy lạnh) to match the Figma color chips.
- Give stakeholders a quick read on global progress (percentage + milestone dates).

## Data model
```ts
type Task = { label: string; code: string };
type VillaStage = {
  id: string;        // numeric order, also rendered inside the timeline node
  title: string;     // e.g. "Tường ngăn"
  area: string;      // e.g. "Lầu 2"
  description: string;
  accent: string;    // semantic color for cards + timeline node
  tasks: Task[];     // ordered list shown inside the card
};
```

## UI notes
- Cards alternate left/right around a central vertical rail to mimic the original Figma layout.
- Start/End markers hug the rail to show the full journey.
- Chips reuse the global surface/background colors via the theme helper to stay in sync with light/dark mode.
- Update `VILLA_STAGES` to add/remove areas. The timeline renders dynamically (no extra layout code required).

## Navigation
Route: `/construction/villa-progress`

Register it inside expo-router navigation stacks or link from your sections as needed:
```ts
router.push('/construction/villa-progress');
```
