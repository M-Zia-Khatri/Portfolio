# Terminal SkillChip Crash Fix

## Problem

Terminal-mode skills crashed with `Maximum update depth exceeded` when selected from the Skills section.

## Root Cause

`TerminalView` used an inline GSAP timeline setup function. Because the shared animation hook depends on that setup function, every render recreated the timeline. The setup function also performed terminal state resets, causing another render and another setup identity.

## Solution

- Replaced the inline setup function with `useCallback` so the timeline lifecycle is stable.
- Kept `blocks` memoized from `commands` and used it as the setup callback's only data dependency.
- Moved terminal state reset into the GSAP timeline as the first timeline callback, so reset participates in the same lifecycle as the rest of the terminal animation.
- Added stable block ids for rendered terminal output and duplicate protection when committing completed blocks.
- Preserved GSAP animations and existing cleanup through `useGsapTypingEffect`.

## Files Modified

- `client/src/features/skills/components/TerminalView.tsx`
- `docs/terminal-skillchip-crash-analysis.md`
- `docs/terminal-skillchip-fix.md`

## Before vs After

| Area | Before | After |
| --- | --- | --- |
| Timeline setup | Fresh inline function each render | Memoized `useCallback` setup |
| State reset | Synchronous inside unstable setup | First callback in stable timeline |
| Effect lifecycle | Recreated after every state update | Recreated only when skill/block data changes |
| Terminal output keys | Text-derived, duplicate-prone | Stable block ids plus output index |
| Crash behavior | Maximum update depth exceeded | Stable render cycle |

## Validation Steps

1. Click a code skill and verify code typing still works.
2. Click a terminal skill and verify no maximum-depth error appears.
3. Switch between terminal and code skills repeatedly.
4. Verify terminal output animates and completes.
5. Run client lint and production build with `VITE_API_URL` set.
