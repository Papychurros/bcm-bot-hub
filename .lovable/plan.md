

# Plan: Integrate Finalized HTML Features into B.C.M Hub

## Summary
The two uploaded HTML files are the polished, standalone versions of the Guide and QA Hub. The current React app already has the right structure and data, but needs significant visual and feature upgrades to match these finalized HTML versions. This plan covers all the differences.

---

## 1. Lockscreen / Home Page (Guide Section)

**Current:** Simple centered page with bot cards and background glow.
**HTML version:** Full lockscreen overlay with floating particles, pulsing hint text, large bot logos with hover glow effects, divider lines between bots, and an unlocking animation (scale + fade out).

**Changes:**
- Rewrite `Index.tsx` as a lockscreen-style overlay with particle animation
- Add animated particles (small colored dots floating upward)
- Add "Bienvenue" title top, "Guide d'utilisation des Bots Telegram" as main title, "Selectionne un bot pour commencer" as subtitle
- Add divider lines between bot cards
- Add pulsing "blink" hint text at the bottom
- Add unlock transition: clicking a bot triggers a scale+fade animation before navigating
- Bot logos use base64 images from the HTML files (or emoji with styled backgrounds matching the HTML)

---

## 2. Light/Dark Theme Toggle

**Current:** Dark only.
**HTML version (guide):** Has a full light theme with toggle button, storing preference in localStorage.

**Changes:**
- Add theme toggle button in the header (sun/moon icon)
- Add complete light theme CSS variables
- Store theme preference in localStorage
- All components adapt: cards, sidebar, callouts, search dropdown, etc.

---

## 3. Search Bar in Header

**Current:** No functional search bar.
**HTML version (guide):** Has a search bar in the header with dropdown, filtering commands across all bots with keyboard navigation (arrow keys, Enter, Escape), highlighting matches, showing bot tag + command + label.

**Changes:**
- Add search input in the top header bar
- Create searchable index from `guide-content.ts` commands and pages
- Build dropdown with filtered results showing bot tag, highlighted match text, and page label
- Add keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
- Clicking a result navigates to the corresponding guide page
- Close dropdown when clicking outside

---

## 4. Sidebar Styling Improvements

**Current:** Basic sidebar with tabs and nav links.
**HTML version (guide):** Sidebar items have colored left border when active, colored dots next to items, emoji icons for each page, "hidden by default" behavior, bot-tab styling with glow effects.
**HTML version (QA):** Sidebar has B.C.M logo with colored letters, mini bot logos, navigation items with colored dots and live badges.

**Changes:**
- Add emoji icons to sidebar navigation items (matching HTML: house, mode dots, calendar, music, sunrise, gear, clipboard, warning, book icons)
- Active sidebar items get colored left border (not just background)
- Bot tabs get glow/colored border styling when active
- Sidebar closed by default (already implemented)
- QA sidebar: add B.C.M styled header with colored letters and mini bot icon row
- QA nav items get colored dot indicators and live stat badges

---

## 5. Bot Home Pages Styling

**Current:** Basic centered hero with animated stat counters.
**HTML version:** Much larger hero title (clamp 72px-108px), bot-specific filter drop-shadow glow on title, badge with dot separator styling, stats in bordered cards (not just numbers), suite complete section with styled bot cards.

**Changes:**
- Increase hero title size significantly
- Add drop-shadow glow filter on bot title (per bot color)
- Stats displayed in bordered cards with bot-colored numbers (instead of plain centered text)
- Add "SUITE COMPLETE" label styling to match HTML

---

## 6. Guide Content Page Improvements

**Current:** Basic section renderer with commands, callouts, tables, timelines, flowcharts, limits, glossary.
**HTML version:** More polished styling: command rows with colored arrows per bot, mode badges (Normal=green, Precis=red, Auto=blue), architecture pages with SVG diagrams and detailed workflow node chains, agent cards grid with tools, stack grids, styled confirm boxes, category rows with colored tags (notif, silent, read).

**Changes:**
- Add `mode-badge` component (green for Normal, red for Precis, blue for Auto)
- Add colored arrow indicators on command rows per bot
- Improve architecture flowchart: replace simple node list with vertical flow diagram (numbered steps, arrow connectors, bot-colored nodes)
- Add agent cards grid for architecture pages
- Add stack grid for tech info display
- Add category row component for M.A.G categories (with colored tags: notif, silent, read)
- Add notification preview component for M.A.G
- Add confirm-box style callout (bot-colored left border with arrow bullet points)

---

## 7. QA Hub Home Page

**Current:** Basic progress bar and bot cards.
**HTML version:** More detailed: global summary with segmented progress bar (green+orange+red sections), "last save" info display, bot cards with bot logos, gradient top bar, per-bot mini progress (3 stat boxes for green/orange/red counts), multi-segment card bar, "Ouvrir les tests" arrow link.

**Changes:**
- Add segmented global progress bar (green, orange, red sections instead of single color)
- Add "last save" info section showing date/time
- Bot cards: add gradient top bar (3px colored stripe), mini stat boxes (3 separate green/orange/red counters), segmented card progress bar
- Toast notification for save actions ("Progression sauvegardee" / "Progression restauree")

---

## 8. QA Bot Test Pages

**Current:** Basic test cards with emoji buttons.
**HTML version:** Test cards have colored left border indicator based on status (green/orange/red), green tests get dimmed (opacity 0.65), status buttons are round circles with different active states, command is click-to-copy with visual feedback, recap sections are more polished with section info and note display.

**Changes:**
- Test cards: add 3px left border that changes color based on status
- Green-completed tests get reduced opacity (0.65)
- Status buttons: round (28px circle), with bot-colored border, filled when active
- Click-to-copy on command text with brief color flash feedback
- Recap sections: show section name, test label, command, expected result, and any note in each recap item
- Add toast notification system for copy/save feedback

---

## 9. Bot Logo Images

**HTML versions** use base64-encoded PNG images for bot logos (B.O.B brain icon, C.A.S.H money icon, M.A.G mail icon). The current React app uses emoji only.

**Changes:**
- Extract and save the 3 bot logo images from the HTML files as assets
- Use them in lockscreen, bot home pages, sidebar headers, and QA home cards
- Apply themed background tints and border styling per bot (dark purple bg for BOB, dark green for CASH, dark blue for MAG)

---

## 10. Section Transition Animations

**Current:** Basic fade-in.
**HTML version:** Staggered fade-in-up animations for page elements (title row, subtitle, stats, feature blocks) with increasing delays.

**Changes:**
- Add staggered animation delays to content page sections
- Page title animates first, then subtitle, then content blocks with increasing delay

---

## Technical Notes

- All changes are CSS/component level -- no new dependencies needed
- Data files (bots.ts, guide-content.ts, qa-tests.ts) remain mostly unchanged (content already matches)
- Theme toggle uses localStorage and CSS variables, no library needed
- Search index built at runtime from existing guide-content data
- Toast system uses existing sonner dependency
- Images extracted from base64 data in HTML files

