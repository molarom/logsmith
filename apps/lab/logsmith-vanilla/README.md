# LogSmith (Vanilla) — Week 1

## Goals
- Practice DOM & Event Model
- Implement basic virtualization (no libraries)
- Add a simple filter and measure performance

## Tasks
1. Explain in comments which operations cause layout vs paint vs composite in this app.
2. Add IntersectionObserver to lazily render a footer "Load more" sentinel (simulate streaming).
3. Add a FPS meter using `requestAnimationFrame` to spot jank.
4. Capture Lighthouse metrics (LCP, CLS, TBT) and paste results here.
5. Add keyboard shortcuts: `/` focuses filter, `Escape` clears it.
6. Add a simple perf budget: assert initial render < 200ms on your machine (in dev).
