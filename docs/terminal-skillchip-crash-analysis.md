# Terminal SkillChip Crash Analysis

## Error Summary

Clicking a terminal-mode SkillChip mounted `TerminalView` and triggered React's `Maximum update depth exceeded` guard. The stack pointed at `TerminalView` state setters invoked from the shared GSAP timeline hook.

## Root Cause

`TerminalView` passed a fresh inline setup function to `useGsapTypingEffect` on every render. The shared hook correctly includes `setup` in its dependency list, so each render changed the dependency identity and recreated the GSAP context/timeline.

Inside that inline setup function, `TerminalView` synchronously reset state with:

```txt
setDoneBlocks([])
setActiveCommand("")
setActiveBlock(null)
setActiveOutputs([])
setDone(false)
```

Those setters caused a render. The render created a new inline setup function. The hook saw a new `setup` dependency, ran again, executed the setters again, and repeated until React stopped the loop.

## Render Loop Diagram

```text
SkillChip click
↓
SkillsSection sets activeName/openTabNames
↓
CodeCard renders terminal skill
↓
TerminalView renders
↓
TerminalView creates a new inline setup function
↓
useGsapTypingEffect layout effect sees setup dependency
↓
gsap.context() creates timeline and calls setup
↓
setup synchronously calls TerminalView setState
↓
TerminalView renders again
↓
new inline setup function identity
↓
useGsapTypingEffect runs again
↓
Maximum update depth exceeded
```

## State Flow Diagram

```text
activeName/openTabNames (SkillsSection)
  -> resolved terminal Skill
  -> CodeCard skill prop
  -> TerminalView props: skillName, commands, color, isActive
  -> TerminalView state: doneBlocks, activeCommand, activeBlock, activeOutputs, done, cursor
```

The loop occurred inside the terminal presentation state, not in the section tab state.

## GSAP Flow Diagram

```text
useGsapTypingEffect(scopeRef, deps, setup, paused)
  -> useLayoutEffect([...deps, setup])
  -> gsap.context(() => timeline = gsap.timeline(...))
  -> setup(timeline)
  -> timeline callbacks update terminal state during playback
  -> cleanup kills timeline and reverts context
```

The hook's dependency behavior is correct; the caller must provide a stable setup callback.

## Why React Exceeds Maximum Depth

React never stabilized because each state reset created a render, and each render produced a new setup callback. Since the effect depended on that callback, the effect continuously restarted and fired more state updates.

## Strict Mode Compatibility

React Strict Mode makes layout effects mount, cleanup, and remount in development. That exposed the issue more reliably, but it was not the root cause. The production bug was the unstable setup callback plus synchronous state updates during timeline setup.
