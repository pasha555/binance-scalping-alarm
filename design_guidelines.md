# Design Guidelines: Crypto Bot Management Dashboard

## Design Approach

**Selected Framework:** Material Design 3 with Trading Platform Aesthetics
**Justification:** Utility-focused dashboard requiring clear data hierarchy, reliable controls, and professional trading interface aesthetics. The dark-themed design system ensures comfortable extended usage while monitoring bots.

**Design Principles:**
- Clarity over decoration - every element serves a functional purpose
- Instant status recognition through color-coded indicators
- Confident, decisive actions with clear feedback
- Professional trading platform aesthetic

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (Default):**
- Background Base: 220 15% 8%
- Surface Cards: 220 15% 12%
- Surface Elevated: 220 15% 16%
- Primary Brand: 200 95% 55% (Cyan-blue for bot controls)
- Success/Long: 140 75% 45% (Green indicators)
- Danger/Short: 0 75% 55% (Red warnings/stop)
- Warning: 45 95% 55% (Orange for blocked items)
- Text Primary: 220 15% 95%
- Text Secondary: 220 10% 70%
- Border Subtle: 220 15% 20%

**Status Indicators:**
- Bot Running: 140 75% 45% with pulse animation
- Bot Stopped: 220 10% 40% (muted gray)
- Coin Blocked: 45 95% 55% (warning orange)

### B. Typography

**Font Family:** 
- Primary: 'Inter' from Google Fonts (system-ui fallback)
- Monospace: 'JetBrains Mono' for coin symbols and technical data

**Type Scale:**
- Headline (Bot Status): 600 weight, 24px/1.2
- Section Headers: 600 weight, 18px/1.3
- Body Text: 400 weight, 15px/1.5
- Data/Numbers: 500 weight, 16px/1.4 (monospace)
- Labels: 500 weight, 13px/1.4 uppercase tracking-wide

### C. Layout System

**Spacing Scale:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6
- Section spacing: space-y-8
- Card spacing: gap-4
- Compact controls: gap-2

**Container Structure:**
- Main viewport: Full height with sidebar navigation
- Content area: max-w-7xl with p-8
- Cards: Rounded-lg (8px) with subtle shadow
- Two-column layout for bot controls (lg:grid-cols-2)

### D. Component Library

**Navigation:**
- Left sidebar (fixed, w-64) with bot overview
- Icons for sections: Dashboard, Blocked Coins, Settings
- Active state: Primary color background with border-l-4 accent

**Bot Control Cards:**
- Elevated surface cards with status indicator (dot with pulse)
- Bot name as header with interval display (1m / 5m)
- Start/Stop toggle buttons (prominent, full-width on mobile)
- Status text with last active timestamp
- Subtle border-l-4 in primary color when active

**Coin Management:**
- Input field with "Add Coin" button (inline, sticky top)
- Symbol format validation (uppercase, e.g., "BTCUSDT")
- Blocked coins as dismissible chips/badges
- List view with hover states for remove action
- Empty state illustration when no coins blocked

**Data Display:**
- Status badges: Rounded-full px-3 py-1 with dot indicator
- Coin symbols: Monospace font, medium weight
- Timestamps: Text-sm text-secondary
- Counts/metrics: Large numbers (text-2xl) with labels

**Buttons:**
- Primary (Start): Solid primary color, shadow-sm
- Danger (Stop): Solid red, shadow-sm
- Secondary (Remove block): Outline with hover:bg-surface
- Icon buttons: Square with rounded-md, hover state

**Forms:**
- Input fields: Dark surface with border, focus:ring-primary
- Consistent height (h-11) for all inputs
- Clear validation states (red border for errors)
- Placeholder text in muted secondary color

### E. Interactions & Feedback

**Micro-interactions:**
- Bot status pulse animation (animate-pulse on running indicator)
- Button press states: scale-95 transform on active
- Smooth transitions: transition-all duration-200
- Loading states: Spinner overlay on async actions

**Notifications:**
- Toast messages (top-right): Success (green), Error (red), Info (blue)
- Auto-dismiss after 4 seconds
- Action confirmation modals for critical operations (Stop All Bots)

---

## Layout Structure

**Dashboard View:**
1. **Header Bar** (sticky top, z-10)
   - App title: "RSI Bot Yönetim Paneli"
   - Status summary: Active bots count
   - Quick action: Emergency Stop All button

2. **Main Content Area** (two-column grid)
   - **Left Column:** Bot Controls
     - 1 Dakikalık Bot card with start/stop
     - 5 Dakikalık Bot card with start/stop
   - **Right Column:** Coin Management
     - Add coin input (sticky)
     - Blocked coins list with remove buttons

3. **Footer** (fixed bottom on mobile)
   - Connection status indicator
   - Last sync timestamp

**Responsive Behavior:**
- Desktop (lg+): Side-by-side two-column layout
- Tablet (md): Stacked cards, full width
- Mobile: Single column, bottom navigation sheet for controls

---

## Visual Hierarchy

**Priority Order:**
1. Bot status indicators (largest, most prominent)
2. Start/Stop controls (primary action buttons)
3. Coin blocking interface (secondary function)
4. System status and metadata (subtle, bottom)

**Data Density:**
- Breathing room between cards (gap-6)
- Generous padding in interactive areas (p-6)
- Compact lists for blocked coins (py-2)
- Clear visual separation with borders/shadows

---

## Accessibility & Polish

- High contrast ratios (WCAG AA minimum)
- Keyboard navigation for all controls (focus:ring-2)
- Screen reader labels for icon-only buttons
- Consistent dark mode throughout (no white backgrounds)
- Smooth state transitions (no jarring changes)
- Clear error messaging in Turkish
- Confirmation dialogs for destructive actions