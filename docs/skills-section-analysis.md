# Skills Section Analysis

## Executive Summary

The primary Skills-section glitch was caused by typing timelines being recreated during every React render. `CodeCard` passed an inline timeline setup function into `useGsapTypingEffect`; that hook included the setup function in its dependency array, so every `setCurrentLine`, `setCompletedLines`, or `setIsTyping` update changed the callback identity, killed the current GSAP timeline, reset state, and started another timeline. The visible symptoms were repeated typing, flicker, jumpy scroll position, and occasional missing or duplicated lines.

Secondary issues included tab scroll synchronization only running on mount, invalid nested interactive controls in tabs, hidden custom scrollbars due to global CSS, fragile duplicate-line keys/indexing, incomplete auto-scroll dependencies, and missing reduced-motion handling.

## Architecture Overview

`SkillsSection` fetches API skills, resolves icon keys through the dashboard icon map, owns selected/open tab state, and renders skill chips plus `CodeCard`. `CodeCard` owns transient presentation state for typing code and delegates terminal rendering to `TerminalView`.

## Component Relationship Diagram

```text
SkillsSection
├─ SecContainer
├─ SkillsHeading
├─ SkillChips
│  └─ SkillChip[]
└─ CodeCard
   ├─ TabScrollbarStyle
   ├─ ContentScrollbarStyle
   ├─ CodeTabBar
   ├─ CodeLine[]
   ├─ TerminalView
   │  └─ TerminalLine[]
   └─ CodeEmptyState
```

## Data Flow

1. `useSkillsData()` returns `ApiSkill[]`.
2. `SkillsSection` maps `icon` strings to `iconComponent` and produces runtime `Skill[]`.
3. Chip clicks add a skill name to `openTabNames` and set `activeName`.
4. `openTabs` and `resolvedSkill` are derived from `mappedSkills`, `openTabNames`, and `activeName`.
5. `CodeCard` receives only the active skill and open tab list.

## Render Flow

- Loading/error/empty states reserve a stable 300px card area.
- A code skill renders committed `CodeLine`s plus one active typed line.
- A terminal skill renders `TerminalView`, which animates command blocks.

## State Flow

- Section state: `activeName`, `openTabNames`.
- Code-card state: `completedLines`, `currentLine`, `isTyping`.
- Terminal state: done blocks, active block, active outputs, cursor.

## Animation Flow

- Section reveal: `useGsapReveal` once on section container.
- Chip stagger: `useGsapStagger` once on chip container.
- Tab animation: scoped GSAP fade/slide when open tab count changes.
- Code typing: one memoized GSAP timeline per active skill/start state.
- Terminal typing: one GSAP timeline per skill/block set.

## Root Causes

1. **Critical: timeline setup identity changed on every render.** This restarted the typing animation repeatedly.
2. **High: tab auto-scroll effect had an empty dependency array.** Active tabs opened after mount were not scrolled into view.
3. **High: nested `<button>` elements in tabs.** Invalid interactive markup caused focus and click ambiguity.
4. **Medium: duplicate-line indexing used `indexOf`.** Repeated code lines could receive the first occurrence index and unstable keys.
5. **Medium: auto-scroll only ran on mount.** Typed content could advance beyond the visible panel.
6. **Medium: global scrollbar hiding overrode local custom scrollbars.** Users had no visual affordance for horizontal or vertical scroll.
7. **Medium: reduced-motion users still received GSAP and CSS motion.**

## Bug List

- Repeated typing/flickering code panel.
- Active tab not brought into view after opening/selecting tabs.
- Invalid nested tab close button.
- Hidden scrollbars in tab and content panels.
- Fragile duplicate-line keys.
- Content panel not auto-scrolling while typing.
- Missing `data-lenis-prevent` on nested scroll areas.

## Performance Findings

- The critical performance issue was timeline churn and many state updates caused by timeline recreation.
- Removing `useDeferredValue` simplified rendering and prevented deferred stale line lists for this small code sample size.
- Stable numeric map indexes avoid O(n) `indexOf` work per line.
- Reduced-motion mode renders the full code immediately and avoids per-character updates.

## Accessibility Findings

- Tabs now use `role="tablist"`, `role="tab"`, and `aria-selected`.
- Skill chips expose pressed state with `aria-pressed`.
- Focus-visible outlines are restored with skill-color outlines.
- Decorative window controls/icons are hidden from assistive tech where appropriate.
- Reduced-motion support was added.

## Final Recommendations

- Keep timeline setup callbacks memoized whenever they are passed to GSAP hooks.
- Avoid nested interactive elements.
- Keep all derived state derived; only store user intent (`activeName`, `openTabNames`).
- Preserve visible scroll affordances for nested scroll areas.
- Add component tests for tab close/selection and reduced-motion rendering.
