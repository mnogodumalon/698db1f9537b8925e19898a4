# Design Brief: Buchhaltungs-Manager

## 1. App Analysis

### What This App Does
The Buchhaltungs-Manager is a bookkeeping management system for small businesses or freelancers in Germany. It tracks financial documents (Belegbuchungen) categorized into cost groups (Kostengruppen), and manages handovers of bookkeeping data to tax advisors (Steuerberater-Übergaben). It's the digital equivalent of a well-organized filing cabinet for receipts and invoices.

### Who Uses This
A small business owner or freelancer in Germany who handles their own bookkeeping. They're not an accountant - they just need to log receipts, categorize expenses, and periodically hand everything over to their Steuerberater. They want to see their financial health at a glance and quickly log new documents.

### The ONE Thing Users Care About Most
**Total spending overview** - "Wie viel habe ich diesen Monat ausgegeben?" They want to immediately see their current financial position: total amounts booked, broken down by cost groups, and whether they're on track. The hero is the total Betrag (amount) across all Belegbuchungen.

### Primary Actions (IMPORTANT!)
1. **Neue Buchung erfassen** (Log a new receipt/invoice) - This is the #1 action. Every time a user gets a receipt, they need to log it. This becomes the Primary Action Button.
2. Manage Kostengruppen (less frequent - setting up categories)
3. Create Steuerberater-Übergabe (periodic - quarterly or monthly handover)

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design evokes a **modern German finance office** - clean, precise, trustworthy. A cool slate-blue base with a deep teal accent creates a sense of financial stability and professionalism without being cold or corporate. The warm off-white background with subtle blue undertones keeps it approachable. Think of a premium banking app, not an enterprise ERP system.

### Layout Strategy
- **Asymmetric layout on desktop**: A wide left column (65%) holds the hero KPI and the expense chart, while a narrower right column (35%) shows recent bookings and quick stats by document type. This creates natural visual flow from "big picture" (left) to "recent activity" (right).
- **Hero element emphasized** through a large card with generous padding, oversized typography (48px bold for the amount), and a subtle gradient border-left accent in teal.
- **Size variation**: The hero card is 2x the height of the secondary KPI cards. The chart section gets generous vertical space. The recent bookings list uses compact rows to contrast with the spacious hero area.
- **Typography hierarchy**: Large weight differences (700 for hero value, 300 for labels) create clear scanning patterns.

### Unique Element
The **Kostengruppen breakdown bar** - a horizontal stacked bar below the hero KPI showing the proportional spending across all cost groups. Each segment uses a different shade from the teal palette, and hovering reveals the exact amount and percentage. This gives an instant visual "fingerprint" of where money is going, replacing the typical pie chart with something more space-efficient and modern.

---

## 3. Theme & Colors

### Font
- **Family:** Source Sans 3
- **URL:** `https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap`
- **Why this font:** Source Sans 3 is professional and readable, perfect for financial data. It has excellent number rendering and clear distinction between similar characters - critical for bookkeeping. Its slightly humanist character keeps it from feeling too cold.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(210 25% 97%)` | `--background` |
| Main text | `hsl(215 25% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(215 25% 15%)` | `--card-foreground` |
| Borders | `hsl(210 18% 90%)` | `--border` |
| Primary action | `hsl(185 62% 34%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(185 45% 92%)` | `--accent` |
| Muted background | `hsl(210 20% 95%)` | `--muted` |
| Muted text | `hsl(215 15% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(152 55% 40%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The slate-blue base (`hsl(210 25% 97%)`) creates a calm, professional canvas that reduces eye strain during extended bookkeeping sessions. The deep teal primary (`hsl(185 62% 34%)`) is distinctive without being flashy - it signals trustworthiness and financial competence. The accent is a very light teal wash used for hover states and selected items, maintaining the color story without competing with data.

### Background Treatment
Subtle cool-toned off-white (`hsl(210 25% 97%)`) - not pure white, giving depth when cards (pure white) sit on top. This creates a natural layering effect without needing heavy shadows.

---

## 4. Mobile Layout (Phone)

### Layout Approach
The hero dominates the first viewport fold. Below it, a compact horizontal pill-bar shows document type distribution. Then a scrollable list of recent bookings with swipe actions. The FAB (Floating Action Button) sits at bottom-right for the primary "Neue Buchung" action.

### What Users See (Top to Bottom)

**Header:**
A simple top bar with the app title "Buchhaltung" (left-aligned, 20px, font-weight 600) and a small gear icon for settings on the right. No navigation tabs - this is a single-page dashboard.

**Hero Section (The FIRST thing users see):**
- A full-width card taking about 35% of the viewport height
- Label "Gesamtbetrag" in small caps (12px, font-weight 300, muted-foreground color, letter-spacing 1px)
- The total amount in large bold text (40px, font-weight 700, foreground color)
- Below the amount: a subtitle showing the count of bookings, e.g. "aus 47 Buchungen" (14px, muted-foreground)
- The Kostengruppen breakdown bar sits below: a thin (8px tall) rounded horizontal stacked bar showing proportional spending by category
- Below the bar: a small legend with category names and amounts (12px, two columns)
- Why hero: Users open the app to check "how much have I spent?" - this answers it instantly

**Section 2: Quick Stats Row**
- A horizontally scrollable row of 3 compact stat pills (not full cards):
  - "Einnahmen" (sum of Ausgangsrechnung + Gutschrift amounts) with a small green up-arrow
  - "Ausgaben" (sum of Eingangsrechnung + other expense types) with a small red down-arrow
  - "Belege diese Woche" (count of bookings from current week)
- Each pill: rounded background (muted), bold number, small label below
- Horizontal scroll with snap-to-item behavior

**Section 3: Monatsverlauf Chart**
- A compact area chart (200px height) showing monthly totals
- X-axis: months (abbreviated, e.g. "Jan", "Feb")
- Y-axis: hidden on mobile (space constraint), tooltip shows values
- Fill color: primary with 20% opacity, stroke: primary
- Title "Monatsverlauf" above (16px, font-weight 600)

**Section 4: Letzte Buchungen**
- Title "Letzte Buchungen" with a "Alle anzeigen" text button on the right
- A list of the 10 most recent Belegbuchungen, sorted by belegdatum descending
- Each item shows: Belegnummer (bold), Beschreibung (truncated), Betrag (right-aligned, bold), Belegart badge (small colored pill)
- Tapping an item opens a detail sheet (bottom sheet on mobile) showing all fields
- Swipe left reveals Edit (pencil) and Delete (trash) action buttons

**Section 5: Kostengruppen**
- Title "Kostengruppen" with a "+" button to add new ones
- Compact card list showing each Kostengruppe with name, number, and total amount from linked Belegbuchungen
- Tapping opens detail with edit/delete options

**Section 6: Steuerberater-Übergaben**
- Title "Übergaben" with a "+" button
- List of handover records showing Stichtag, Periode, and linked booking count
- Tapping opens detail view

**Bottom Navigation / Action:**
- Fixed FAB button at bottom-right corner: teal circle with white "+" icon
- Label "Neue Buchung" appears on long-press
- Tapping opens the create Belegbuchung dialog (bottom sheet on mobile)

### Mobile-Specific Adaptations
- Hero card has reduced padding (16px instead of 24px)
- Chart height reduced to 200px
- Kostengruppen breakdown bar legend wraps to 2 columns
- All lists use compact row height (56px)
- Detail views use bottom sheet (Sheet component) instead of dialog

### Touch Targets
- All action buttons minimum 44x44px
- FAB is 56x56px
- List items have full-row tap area
- Swipe actions have 80px wide reveal area

### Interactive Elements
- Booking list items: tap to open detail bottom sheet
- Kostengruppen cards: tap to see linked bookings
- Chart: tap on data point to see tooltip
- Stacked bar segments: tap to highlight that category

---

## 5. Desktop Layout

### Overall Structure
Two-column layout with max-width 1280px, centered:
- **Left column (65%)**: Hero KPI card, then Monatsverlauf chart, then Belegbuchungen table
- **Right column (35%)**: Quick stats column (3 stacked cards), then Kostengruppen list, then Steuerberater-Übergaben list

The eye goes: Hero amount (top-left, largest) → Breakdown bar → Quick stats (top-right) → Chart → Recent bookings table.

### Section Layout

**Top Area:**
- Full-width header bar: "Buchhaltungs-Manager" title (24px, weight 700) left-aligned. Primary action button "Neue Buchung erfassen" (with Plus icon) right-aligned in the header.
- 24px gap below header

**Left Column (65%):**
1. **Hero KPI Card** - Large card with:
   - Left border accent (4px solid primary color)
   - "Gesamtbetrag" label (14px, weight 300, letter-spacing 1px, muted-foreground)
   - Total amount (48px, weight 700, foreground)
   - Subtitle: "aus {n} Buchungen" (14px, muted-foreground)
   - Below: Kostengruppen stacked bar (12px height, rounded-full)
   - Below bar: legend in a flex row with wrapping

2. **Monatsverlauf Chart** - Card with:
   - Title "Monatsverlauf" (18px, weight 600)
   - Area chart, 320px height
   - X-axis with month labels, Y-axis with EUR values
   - Tooltip on hover showing exact amount

3. **Belegbuchungen Table** - Card with:
   - Header: "Belegbuchungen" title + "Neue Buchung" secondary button
   - Full table with columns: Datum, Belegnummer, Beschreibung, Belegart (badge), Kostengruppe, Betrag (right-aligned)
   - Sortable by Datum (default: newest first)
   - Row hover: light muted background + Edit/Delete icon buttons appear
   - Pagination or "Load more" if >20 records

**Right Column (35%):**
1. **Quick Stats** - 3 stacked cards (no gap between, connected look):
   - Einnahmen (green accent border-left, amount bold, small trend indicator)
   - Ausgaben (red accent border-left, amount bold)
   - Offene Belege diese Woche (primary accent border-left, count bold)

2. **Kostengruppen** - Card with:
   - Header: "Kostengruppen" + "+" icon button
   - List of categories with name, number, total amount
   - Click to expand inline showing linked bookings count
   - Edit/Delete on hover

3. **Steuerberater-Übergaben** - Card with:
   - Header: "Übergaben" + "+" icon button
   - List showing: Stichtag, Periode (von-bis), Bemerkungen preview
   - Click to open detail dialog
   - Edit/Delete on hover

### What Appears on Hover
- Table rows: subtle muted background, Edit (pencil) and Delete (trash) icon buttons slide in from right
- Kostengruppen items: muted background, Edit/Delete icons appear
- Übergaben items: muted background, Edit/Delete icons appear
- Stacked bar segments: tooltip with category name, amount, percentage
- Chart data points: tooltip with month and exact amount

### Clickable/Interactive Areas
- Belegbuchungen table rows: click to open edit dialog
- Kostengruppen items: click to see detail with linked bookings
- Übergaben items: click to open detail dialog
- Chart: hover for tooltips (no click action needed)

---

## 6. Components

### Hero KPI
- **Title:** Gesamtbetrag
- **Data source:** Belegbuchungen app - sum all `betrag` fields
- **Calculation:** `SUM(belegbuchungen.betrag)` across all records
- **Display:** Large number (48px desktop / 40px mobile, weight 700), formatted as EUR currency (Intl.NumberFormat de-DE, currency EUR)
- **Context shown:** Count of total bookings ("aus {n} Buchungen"), plus Kostengruppen breakdown bar
- **Why this is the hero:** Every bookkeeper's first question is "what's my total?" - this answers it before anything else loads

### Secondary KPIs

**Einnahmen (Income)**
- Source: Belegbuchungen where belegart = 'ausgangsrechnung' OR 'gutschrift'
- Calculation: SUM(betrag) for those records
- Format: currency (EUR)
- Display: Stacked card with green left-border (4px, `hsl(152 55% 40%)`)

**Ausgaben (Expenses)**
- Source: Belegbuchungen where belegart = 'eingangsrechnung' OR 'quittung' OR 'kassenbeleg' OR 'bankbeleg' OR 'sonstiger_beleg'
- Calculation: SUM(betrag) for those records
- Format: currency (EUR)
- Display: Stacked card with red left-border (4px, `hsl(0 72% 51%)`)

**Belege diese Woche (Receipts This Week)**
- Source: Belegbuchungen where belegdatum is within current week (Monday to Sunday)
- Calculation: COUNT of matching records
- Format: number
- Display: Stacked card with teal left-border (4px, primary color)

### Chart
- **Type:** AreaChart - because it shows cumulative financial flow over time, and the filled area gives a sense of volume/weight to the amounts, which is more intuitive for financial data than a bare line
- **Title:** Monatsverlauf
- **What question it answers:** "How has my bookkeeping volume changed month over month?" - helps users spot trends and seasonality
- **Data source:** Belegbuchungen, grouped by month of belegdatum
- **X-axis:** Month (formatted as "MMM yyyy" using date-fns, e.g. "Jan 2026")
- **Y-axis:** Total amount (EUR) per month
- **Mobile simplification:** Y-axis hidden, height reduced to 200px, fewer X-axis labels (every other month)

### Lists/Tables

**Belegbuchungen (Main List)**
- Purpose: Users need to see, search, and manage all their bookings
- Source: Belegbuchungen app
- Fields shown in list: belegdatum (formatted dd.MM.yyyy), belegnummer, belegbeschreibung (truncated 50 chars), belegart (as badge), kostengruppe (resolved name from Kostengruppen), betrag (EUR formatted, right-aligned)
- Mobile style: compact list cards (one booking per row)
- Desktop style: full table with sortable columns
- Sort: belegdatum descending (newest first)
- Limit: Show 10 on mobile, 20 on desktop, with "Alle anzeigen" / "Mehr laden" button

**Kostengruppen (Category List)**
- Purpose: Users manage their expense categories
- Source: Kostengruppen app
- Fields shown: kostengruppenname, kostengruppennummer, calculated total from linked Belegbuchungen
- Mobile style: compact cards
- Desktop style: list items within a card
- Sort: kostengruppenname alphabetical
- Limit: Show all (typically <20 categories)

**Steuerberater-Übergaben (Handover List)**
- Purpose: Track what was handed to the tax advisor
- Source: Steuerberater-Übergaben app
- Fields shown: stichtag (formatted), periode_von - periode_bis, bemerkungen (truncated)
- Mobile style: compact cards
- Desktop style: list items within a card
- Sort: stichtag descending
- Limit: Show 5 most recent, "Alle anzeigen" for more

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Buchung erfassen"
- **Action:** add_record
- **Target app:** Belegbuchungen
- **What data:** Form with fields:
  - Belegdatum (date input, default: today)
  - Belegnummer (text input)
  - Beschreibung (textarea)
  - Betrag EUR (number input, step 0.01)
  - Belegart (select dropdown with lookup_data options)
  - Kostengruppe (select dropdown populated from Kostengruppen records)
  - Notizen (textarea, optional)
- **Mobile position:** FAB (bottom-right, fixed, 56px circle, primary color, white Plus icon)
- **Desktop position:** Header (right-aligned button with Plus icon + text)
- **Why this action:** Logging receipts is the most frequent bookkeeping task. Users do it daily or multiple times per day. One-tap access is essential.

### CRUD Operations Per App (REQUIRED!)

**Kostengruppen CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" icon button in the Kostengruppen section header
  - Form fields: Kostengruppenname (text, required), Kostengruppennummer (text), Beschreibung (textarea)
  - Form style: Dialog/Modal
  - Required fields: Kostengruppenname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Cards on mobile, list items on desktop, showing name, number, and total linked amount
  - Detail view: Click opens inline expand (desktop) or bottom sheet (mobile) showing all fields + list of linked Belegbuchungen
  - Fields shown in list: kostengruppenname, kostengruppennummer, calculated total
  - Fields shown in detail: All fields + linked bookings count and total
  - Sort: Alphabetical by kostengruppenname
  - Filter/Search: No (typically <20 categories)

- **Update (Bearbeiten):**
  - Trigger: Pencil icon on hover (desktop) or in detail view (mobile)
  - Edit style: Same dialog as Create, pre-filled with current values
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash icon on hover (desktop) or in detail view (mobile)
  - Confirmation: Always required
  - Confirmation text: "Möchtest du die Kostengruppe '{name}' wirklich löschen?"

**Belegbuchungen CRUD Operations**

- **Create (Erstellen):**
  - Trigger: Primary action button "Neue Buchung erfassen" (FAB on mobile, header button on desktop)
  - Form fields: Belegdatum (date), Belegnummer (text), Beschreibung (textarea), Betrag EUR (number), Belegart (select), Kostengruppe (select from Kostengruppen), Notizen (textarea)
  - Form style: Dialog/Modal (desktop), Bottom Sheet (mobile)
  - Required fields: Belegdatum, Betrag
  - Default values: Belegdatum = today's date

- **Read (Anzeigen):**
  - List view: Table on desktop, compact list on mobile
  - Detail view: Click row opens Dialog showing all fields including resolved Kostengruppe name
  - Fields shown in list: belegdatum, belegnummer, belegbeschreibung, belegart (badge), kostengruppe (name), betrag
  - Fields shown in detail: All fields including notizen and belegdatei link
  - Sort: belegdatum descending
  - Filter/Search: Filter by Belegart (select dropdown above table)

- **Update (Bearbeiten):**
  - Trigger: Pencil icon on hover (desktop), swipe or detail view button (mobile)
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash icon on hover (desktop), swipe or detail view button (mobile)
  - Confirmation: Always required
  - Confirmation text: "Möchtest du die Buchung '{belegnummer}' wirklich löschen?"

**Steuerberater-Übergaben CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" icon button in the Übergaben section header
  - Form fields: Stichtag (date), Periode von (date), Periode bis (date), Bemerkungen (textarea)
  - Form style: Dialog/Modal
  - Required fields: Stichtag, Periode von, Periode bis
  - Default values: Stichtag = today, Periode von = first of current month, Periode bis = today

- **Read (Anzeigen):**
  - List view: Compact items showing stichtag, periode range, bemerkungen preview
  - Detail view: Dialog showing all fields + resolved linked Belegbuchung info
  - Fields shown in list: stichtag (formatted), "Periode: von - bis", bemerkungen (truncated)
  - Fields shown in detail: All fields
  - Sort: stichtag descending
  - Filter/Search: No

- **Update (Bearbeiten):**
  - Trigger: Pencil icon on hover (desktop) or in detail view
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash icon on hover (desktop) or in detail view
  - Confirmation: Always required
  - Confirmation text: "Möchtest du die Übergabe vom '{stichtag}' wirklich löschen?"

---

## 7. Visual Details

### Border Radius
Rounded (8px) - professional and modern without being too playful. Cards use `rounded-lg` (8px). Badges and pills use `rounded-full`. Input fields use `rounded-md` (6px).

### Shadows
Subtle - Cards have `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)). On hover, cards elevate to `shadow-md` (0 4px 6px rgba(0,0,0,0.07)). The FAB has `shadow-lg` for floating effect.

### Spacing
Normal with generous hero spacing:
- Page padding: 16px mobile, 32px desktop
- Card padding: 16px mobile, 24px desktop
- Gap between cards: 16px mobile, 20px desktop
- Hero card internal padding: 24px mobile, 32px desktop
- Between sections: 24px mobile, 32px desktop

### Animations
- **Page load:** Stagger fade-in (cards appear one by one, 50ms delay between each, 300ms fade duration)
- **Hover effects:** Cards: subtle shadow elevation (transition-shadow 200ms). Table rows: background color change to muted (transition-colors 150ms). Buttons: slight scale (scale-[1.02]) on hover.
- **Tap feedback:** Active state: scale-[0.98] for 100ms on buttons and interactive items

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(210 25% 97%);
  --foreground: hsl(215 25% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(215 25% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(215 25% 15%);
  --primary: hsl(185 62% 34%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(210 20% 95%);
  --secondary-foreground: hsl(215 25% 20%);
  --muted: hsl(210 20% 95%);
  --muted-foreground: hsl(215 15% 50%);
  --accent: hsl(185 45% 92%);
  --accent-foreground: hsl(185 62% 24%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(210 18% 90%);
  --input: hsl(210 18% 90%);
  --ring: hsl(185 62% 34%);
  --chart-1: hsl(185 62% 34%);
  --chart-2: hsl(152 55% 40%);
  --chart-3: hsl(210 25% 55%);
  --chart-4: hsl(35 85% 55%);
  --chart-5: hsl(280 45% 55%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Source Sans 3)
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5
- [ ] Hero element is prominent as described
- [ ] Colors create the calm, professional mood described in Section 2
- [ ] CRUD patterns are consistent across all apps
- [ ] Delete confirmations are in place
- [ ] Belegart filter works on the bookings table
- [ ] Kostengruppen breakdown bar renders correctly
- [ ] Area chart shows monthly aggregation
- [ ] All amounts formatted as EUR with de-DE locale
