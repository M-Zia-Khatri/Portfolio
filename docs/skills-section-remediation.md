# Skills Section Remediation

## Problems Found

- Code typing timeline restarted on every render.
- Tab scroll synchronization only ran once.
- Tab close controls were nested inside tab buttons.
- Code-line keys and indexes broke with repeated identical lines.
- Code viewport did not auto-scroll as content typed.
- Custom scrollbars were hidden by global scrollbar CSS.
- Reduced-motion preferences were not honored consistently.

## Fixes Applied

- Memoized the code typing timeline setup callback.
- Reset code-card state when the actual skill changes.
- Render full code immediately for reduced-motion users.
- Added active-tab scroll synchronization dependencies.
- Replaced nested tab buttons with sibling tab and close buttons.
- Added ARIA tablist/tab semantics and chip pressed state.
- Replaced duplicate-sensitive `indexOf` line numbering with map indexes.
- Added auto-scroll dependencies for typed content.
- Added Lenis prevention and visible local scrollbars for nested scroll panes.

## Files Modified

- `client/src/shared/components/CodeCard.tsx`
- `client/src/features/skills/components/CodeTabBar.tsx`
- `client/src/features/skills/components/SkillChip.tsx`
- `client/src/shared/hooks/useGsapAnimations.ts`
- `client/src/assets/styles/index.css`
- `docs/skills-section-analysis.md`
- `docs/skills-section-architecture.md`
- `docs/skills-section-remediation.md`

## Before vs After

| Area | Before | After |
| --- | --- | --- |
| Code typing | Timeline restarted during state updates | Timeline is stable per skill |
| Tabs | Active tab could remain offscreen | Active tab scrolls into view |
| Markup | Nested buttons | Valid sibling controls |
| Scrollbars | Globally hidden | Visible in Skills scroll panes |
| Motion | Always animated | Reduced-motion renders final state |
| Keys/indexes | Duplicate-sensitive | Stable by line index |

## Performance Improvements

- Eliminated timeline churn and repeated state resets.
- Removed deferred stale render path for small snippets.
- Avoided O(n) `indexOf` work for each rendered code line.
- Reduced animation work when users prefer reduced motion.

## Accessibility Improvements

- Added tab roles and selected state.
- Added chip pressed state.
- Restored focus-visible outlines.
- Removed invalid nested interactive elements.
- Added reduced-motion support.

## Future Maintenance Notes

- Keep GSAP setup functions stable with `useCallback`.
- Do not store derived skill objects in state.
- Add tests before introducing larger snippets or virtualized code panels.
- Keep nested scroll panes marked with `data-lenis-prevent`.
