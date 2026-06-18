# Skills Section Architecture

## Current Architecture

### Component hierarchy

```text
SkillsSection -> SkillChips -> SkillChip
SkillsSection -> CodeCard -> CodeTabBar
SkillsSection -> CodeCard -> CodeLine | TerminalView | CodeEmptyState
TerminalView -> TerminalLine
```

### State hierarchy

- `SkillsSection` owns durable UI selection state: active skill name and open tab names.
- `CodeCard` owns transient animation state for code typing.
- `TerminalView` owns transient terminal animation state.

### Data flow

API skills are normalized once in `SkillsSection` by resolving icon names to React components. Child components consume normalized `Skill` objects only.

## Proposed Architecture

### Component hierarchy

Keep the current feature boundary, but treat `CodeCard` as a presentation shell and extract typing orchestration into a dedicated hook if code samples become larger.

```text
SkillsSection
├─ useSkillsData + skill normalization
├─ useSkillTabs (future extraction)
└─ CodeCard
   ├─ useCodeTypingTimeline (future extraction)
   ├─ CodeTabBar
   └─ CodeViewport
```

### State ownership

- `SkillsSection`: open tabs and active tab.
- `CodeCard`: code animation presentation state only.
- `TerminalView`: terminal animation presentation state only.

### Hook ownership

- GSAP hooks remain shared but require stable callbacks.
- A future `useSkillTabs` hook should own close/select fallback behavior.
- A future `usePrefersReducedMotion` hook should centralize motion preference detection.

### Rendering strategy

- Derive `openTabs` and `resolvedSkill` with `useMemo`.
- Use stable keys based on skill name plus line index.
- Render small code lists directly; virtualization is unnecessary for current samples.

## Performance Strategy

### Memoization plan

- Memoize expensive skill normalization and handler maps.
- Memoize GSAP setup callbacks with `useCallback`.
- Keep child components memoized where props are stable.

### Virtualization plan

No virtualization is needed for current skill code snippets. If snippets grow beyond roughly 200 rendered lines, introduce a fixed-height virtualized code viewport.

### Animation strategy

- One timeline per skill transition.
- Kill timelines during cleanup.
- Respect `prefers-reduced-motion` by rendering final state immediately.
- Use transform/opacity animation only.

## Accessibility Strategy

- Use actual buttons for chips and tabs.
- Do not nest interactive controls.
- Apply tab ARIA roles and selected state.
- Preserve visible focus outlines.
- Respect reduced motion.

## Responsive Strategy

- Keep card width fluid and constrained by the section container.
- Let tab and content panels scroll independently with visible local scrollbars.
- Hide the language badge on very small screens to preserve tab space.
- Allow code content to scroll horizontally instead of clipping.

## Testing Strategy

- TypeScript build for type safety.
- Biome lint/format checks.
- Manual browser validation at mobile, tablet, laptop, desktop, and ultrawide widths.
- Keyboard checks for chips, tabs, and close buttons.
- Reduced-motion browser setting check.
