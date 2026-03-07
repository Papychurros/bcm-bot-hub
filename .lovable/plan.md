

## Problems identified

From the screenshots:

1. **Step 1**: The `data-tour="bot-bob"` is on the `<button>` element which includes the card + text (B.O.B + Assistant Personnel). The circle uses `Math.max(width, height)` which on mobile makes a huge circle since the button is tall (image + name + subtitle stacked vertically). The circle should target only the logo/card box (`w-28 h-28` div), not the entire button.

2. **Step 2**: The circle targets `[data-tour="bottom-nav"]` on the mobile bottom nav container, but uses `Math.max(width, height) / 2 + 16` which creates a circle centered on the nav. The nav is wide and short, so using `Math.max` makes the radius way too large (half the screen width). Should use a horizontal ellipse or a rectangle-based approach, or simply use the width as the diameter for a wider but tighter circle. Actually, the real fix is to use a **rounded rectangle** cutout instead of a circle for the bottom nav.

## Plan

### 1. Fix Step 1 targeting — move `data-tour="bot-bob"` to the inner card div

In `src/pages/Index.tsx`, move the `data-tour="bot-bob"` attribute from the outer `<button>` to the inner `<div>` (the `w-28 h-28` card box). This way the circle targets just the square logo card, not the full button with text.

### 2. Fix Step 2 — use a rounded rectangle cutout for the bottom nav

In `src/components/OnboardingTour.tsx`:
- For step 2 (bottom nav), replace the circular SVG mask cutout with a **rounded rectangle** that tightly fits the nav bar with small padding.
- Keep the dashed border animation but as a rounded rectangle instead of a circle.
- Adjust the arrow and tooltip positioning so the tooltip + arrow appear clearly above the nav bar, pointing down toward it.

### 3. Tooltip positioning adjustments

- For step 2 on mobile, position the tooltip higher up in the viewport so it's clearly separated from the nav bar, with the arrow pointing down to the bar.

