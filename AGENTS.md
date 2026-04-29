# FactoryTwin Agent Guide

## Project Purpose

FactoryTwin is a web-based digital twin control dashboard for real-time industrial data visualization. The first version runs without hardware, backend services, databases, or WebSocket connections. All machine data is simulated in the browser.

## Required Stack

- Vite
- React
- TypeScript
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- Tailwind CSS
- Lucide React
- Recharts

## Local Command Notes

- This workspace is on Windows PowerShell.
- Use `npm.cmd` instead of `npm` because PowerShell may block `npm.ps1`.
- Expected commands:
  - `npm.cmd install`
  - `npm.cmd run dev`
  - `npm.cmd run build`
  - `npm.cmd run lint`

## Implementation Principles

- Keep the app focused on a working dashboard, not a marketing page.
- Prefer small, purpose-specific components over one large `App.tsx`.
- Use React Context plus custom hooks for machine data and control state unless a future requirement clearly needs another state library.
- Keep simulated data deterministic enough to debug, but visually alive enough for a real-time dashboard.
- Do not introduce backend, database, authentication, GLTF loading, or external hardware integration in v1.
- Do not add new dependencies unless they directly support the requested dashboard behavior.

## Suggested Source Structure

- `src/context/MachineDataContext.tsx` manages simulated machine sensor state, warnings, logs, and start/stop actions.
- `src/components/FactoryScene.tsx` owns the React Three Fiber canvas, lights, camera behavior, and controls.
- `src/components/Machine.tsx` renders each abstract machine from primitive geometry and exposes hover/click interactions.
- `src/components/Dashboard.tsx` renders machine summaries, warning panels, charts, and logs.
- `src/components/MachineModal.tsx` renders selected machine details and start/stop controls.
- `src/types/machine.ts` defines shared machine IDs, sensor data, statuses, and log types.

## 3D Scene Rules

- The scene must include a factory floor plane, ambient light, directional light, and OrbitControls.
- Render three machines with IDs `id-1`, `id-2`, and `id-3`.
- Build machines from boxes, cylinders, and other simple Three.js primitives.
- Hovering a machine should produce an obvious visual response.
- Clicking a machine should select it, open details, and smoothly move the camera target toward it.
- If a machine temperature exceeds 80 degrees, its 3D representation should visibly warn, such as red blinking.
- Use Drei `Html` labels for floating machine status tags.

## Data Simulation Rules

- Update simulated sensor data once per second.
- Track temperature, vibration, and operating rate for each machine.
- Keep the latest 20 seconds of temperature history for charting.
- Temperature over 80 degrees is a warning condition.
- Stopped machines should trend toward low operating rate and calmer sensor values.
- Keep logs bounded so the UI cannot grow forever; 50 recent entries is enough for v1.

## UI Rules

- Use a dark industrial control-room style.
- The first screen must be the usable dashboard itself.
- Desktop layout: 3D scene on the left, real-time dashboard on the right.
- Mobile layout: stack the 3D scene above the dashboard.
- Use Lucide icons for dashboard actions and status affordances where helpful.
- Avoid visual clutter, decorative blobs, oversized hero sections, and nested cards.
- Ensure text and controls do not overlap at desktop or mobile widths.

## Documentation Rules

- Before implementation, save the implementation plan under `docs/`.
- Keep docs practical and current with the implementation.
- If the plan changes materially, update the relevant doc before continuing.

## Verification Before Completion

- Run `npm.cmd run build` before claiming the app is complete.
- If a dev server is needed, run `npm.cmd run dev` and provide the local URL.
- Manually verify:
  - the 3D canvas renders and is not blank;
  - all three machines are visible;
  - hover, click, modal, and camera zoom work;
  - data updates every second;
  - warning state appears when temperature exceeds 80 degrees;
  - the Recharts temperature graph shows the latest 20 seconds;
  - the layout remains usable on narrow screens.

## Git Rules

- The remote repository is `https://github.com/qkdgur4/FactoryTwin.git`.
- Default branch is `main`.
- Do not rewrite history or reset user changes unless explicitly requested.
- Commit messages should be short and descriptive, for example `feat: scaffold digital twin dashboard`.
