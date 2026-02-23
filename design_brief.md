# Design Brief: Buchhaltungs-Manager

## 1. App Analysis

### What This App Does
The Buchhaltungs-Manager (Accounting Manager) is a comprehensive bookkeeping system for small businesses or freelancers. It manages document receipts (Belegbuchungen), organizes them by cost groups (Kostengruppen), and tracks handovers to the tax consultant (Steuerberater-Übergaben). This is a professional accounting tool that needs to convey trust, precision, and clarity.

### Who Uses This
Small business owners, freelancers, or office administrators who need to:
- Track all receipts and invoices
- Categorize expenses by cost groups
- Prepare periodic handovers for their tax consultant
- Maintain a clear overview of their financial documents

### The ONE Thing Users Care About Most
**Total bookings value and recent activity.** Users want to immediately see how much money is flowing through their accounts and what the most recent document entries are. The total sum of all Belegbuchungen is their primary KPI.

### Primary Actions (IMPORTANT!)
1. **Beleg erfassen** (Add receipt) → Primary Action Button - this is done daily
2. Kostengruppe hinzufügen → Secondary (done occasionally to organize)
3. Übergabe erstellen → Periodic (done monthly/quarterly for tax consultant)

---

## 2. What Makes This Design Distinctive

### Visual Identity
This design uses a sophisticated slate-blue palette with warm cream undertones, creating a feeling of professional calm and financial trustworthiness. The accent color is a refined teal that signals "money" without being as generic as green. The overall aesthetic is "premium accounting software" - think of it as the visual equivalent of a well-organized ledger book with quality paper.

### Layout Strategy
- **Hero element:** The total bookings sum is displayed prominently at the top in a large, elegant card that uses size and whitespace to command attention
- **Asymmetric layout on desktop:** 65/35 split with the main content (bookings list, chart) on the left and supporting information (cost groups, handovers) on the right sidebar
- **Visual interest through typography:** Large, bold numbers for KPIs contrast with refined, lighter labels
- **Card grouping:** Related items are grouped with subtle visual connections while maintaining breathing room

### Unique Element
The hero KPI card features a subtle gradient background from the cream base to a slightly cooler tone, with the Euro amount displayed in an oversized, elegant font weight (300 light but large). A thin teal accent line runs along the left edge, giving it a ledger-line aesthetic without being literal.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has excellent number legibility (critical for accounting), a professional but approachable character, and wide weight range allowing for clear typographic hierarchy. It's distinctive without being distracting.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 20% 98%)` | `--background` |
| Main text | `hsl(220 25% 20%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(220 25% 20%)` | `--card-foreground` |
| Borders | `hsl(220 15% 90%)` | `--border` |
| Primary action | `hsl(175 60% 35%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(175 50% 45%)` | `--accent` |
| Muted background | `hsl(220 15% 96%)` | `--muted` |
| Muted text | `hsl(220 10% 50%)` | `--muted-foreground` |
| Success/positive (Einnahmen) | `hsl(160 60% 40%)` | (component use) |
| Error/negative (Ausgaben) | `hsl(0 65% 50%)` | `--destructive` |

### Why These Colors
The warm cream background (`hsl(40 20% 98%)`) creates a paper-like feeling appropriate for document management. The slate-blue text provides excellent readability while feeling more refined than pure black. The teal primary (`hsl(175 60% 35%)`) is a sophisticated alternative to generic greens or blues - it signals financial trustworthiness without clichés.

### Background Treatment
The page background is a warm off-white (`hsl(40 20% 98%)`) that feels like quality paper. Cards sit on pure white with subtle shadows to create layered depth. No gradients on the background - the warmth comes from the hue itself.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile uses a focused, vertical flow where the hero KPI dominates the first viewport. The layout creates hierarchy through size - the total sum is dramatically larger than anything else, immediately answering "how much money?"

### What Users See (Top to Bottom)

**Header:**
- App title "Buchhaltung" in 600 weight, left-aligned
- Primary action button "+" icon (floating action button style) in bottom-right corner

**Hero Section (The FIRST thing users see):**
- Takes approximately 35% of viewport height
- Large card with warm gradient background (cream to slightly cooler cream)
- Thin teal accent line (3px) on left edge
- Label "Gesamtbetrag" in small caps, muted color
- Total sum in 48px, font-weight 300 (light but large), slate-blue
- Subtitle showing count: "aus X Buchungen"
- This answers: "What's my total documented value?"

**Section 2: Quick Stats Row**
- Horizontal scroll with 3 compact stat chips:
  - Einnahmen (income): green tinted chip
  - Ausgaben (expenses): red tinted chip
  - Kostengruppen count: neutral chip
- Chips are pill-shaped with icon + number
- ~60px height each

**Section 3: Letzte Buchungen (Recent Bookings)**
- Section header with "Alle anzeigen" link
- List of 5 most recent Belegbuchungen
- Each item: compact card showing:
  - Belegnummer + Belegart badge (right-aligned)
  - Beschreibung truncated
  - Betrag (prominent, right-aligned)
  - Belegdatum (small, muted)
- Cards have subtle left border in teal when hovered/tapped

**Section 4: Kostengruppen**
- Collapsible section (default collapsed on mobile to save space)
- When expanded: grid of cost group cards (2 columns)
- Each card shows name + number of linked bookings

**Section 5: Steuerberater-Übergaben**
- Collapsible section
- When expanded: list of handover records with period dates

**Bottom Navigation / Action:**
- Fixed FAB (Floating Action Button) in bottom-right
- Teal color, "+" icon
- Opens bottom sheet dialog for "Neuen Beleg erfassen"

### Mobile-Specific Adaptations
- Cost groups and handovers are collapsed by default to keep focus on bookings
- Quick stats use horizontal scroll instead of grid
- Table-like views become card lists
- All forms open in bottom sheets instead of centered dialogs

### Touch Targets
- All interactive elements minimum 44px height
- FAB is 56px diameter
- List items have full-width tap area

### Interactive Elements
- Booking cards open detail sheet showing all fields
- Cost group cards show linked bookings when tapped
- Handover cards show full details when tapped

---

## 5. Desktop Layout

### Overall Structure
Asymmetric 65/35 two-column layout:
- **Left column (65%):** Hero KPI card, trend chart, bookings table
- **Right column (35%):** Stats, cost groups list, handovers list

Eye flow: Hero (top-left) → Stats (top-right) → Chart (mid-left) → Lists (both columns)

### Section Layout

**Top Area (full width):**
- Header bar with app title "Buchhaltungs-Manager" and primary action button "Neuen Beleg erfassen" (right-aligned)

**Left Column:**
- **Hero KPI Card:** Large card spanning full width of left column
  - Same styling as mobile but more horizontal layout
  - Betrag on left, trend sparkline on right
  - Below: count of bookings text

- **Trend Chart:** Area chart showing daily totals over last 30 days
  - Title: "Buchungsverlauf"
  - X-axis: dates
  - Y-axis: EUR amounts
  - Teal fill with darker teal line

- **Buchungen Table:** Full table with columns:
  - Datum | Belegnummer | Beschreibung | Belegart | Kostengruppe | Betrag | Actions
  - Actions: Edit (pencil) and Delete (trash) icons
  - Sortable by date (default: newest first)
  - Pagination or infinite scroll

**Right Column:**
- **Stats Cards:** Two small cards stacked
  - Einnahmen (green accent)
  - Ausgaben (red accent)

- **Kostengruppen Section:**
  - Header with "+ Neue Kostengruppe" button
  - List of all cost groups
  - Each shows name, number, count of linked bookings
  - Click to view/edit

- **Übergaben Section:**
  - Header with "+ Neue Übergabe" button
  - List of handovers
  - Each shows Stichtag, Periode von-bis
  - Click to view/edit

### What Appears on Hover
- Table rows: subtle background highlight + action icons become fully opaque
- Cards: slight shadow increase
- Buttons: color darkens slightly

### Clickable/Interactive Areas
- Booking rows: click to open edit dialog
- Cost group items: click to view linked bookings + edit
- Handover items: click to view details + edit

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Gesamtbetrag
- **Data source:** Belegbuchungen app
- **Calculation:** Sum of all `betrag` fields
- **Display:** Large number (48px mobile, 56px desktop), font-weight 300, formatted as EUR with German locale (e.g., "12.345,67 €")
- **Context shown:** Count of total bookings ("aus 47 Buchungen")
- **Why this is the hero:** Users need to immediately see the total value of documented transactions - this validates their bookkeeping effort

### Secondary KPIs

**Einnahmen (Income)**
- Source: Belegbuchungen where belegart = "ausgangsrechnung" OR "gutschrift"
- Calculation: Sum of betrag
- Format: EUR currency
- Display: Compact card with green accent, small icon (TrendingUp)

**Ausgaben (Expenses)**
- Source: Belegbuchungen where belegart = "eingangsrechnung" OR "quittung" OR "kassenbeleg" OR "bankbeleg"
- Calculation: Sum of betrag
- Format: EUR currency
- Display: Compact card with red accent, small icon (TrendingDown)

**Kostengruppen Count**
- Source: Kostengruppen
- Calculation: Count of records
- Format: Number
- Display: Simple number in stats row

### Chart
- **Type:** AreaChart - because we want to show cumulative flow over time, and area fills create visual weight appropriate for financial data
- **Title:** Buchungsverlauf (letzte 30 Tage)
- **What question it answers:** "How has my booking activity trended recently?"
- **Data source:** Belegbuchungen
- **X-axis:** belegdatum, grouped by day, formatted as "DD.MM"
- **Y-axis:** Sum of betrag per day, formatted as EUR
- **Mobile simplification:** Reduce to last 14 days, hide Y-axis labels, show only key points

### Lists/Tables

**Belegbuchungen Table (Desktop)**
- Purpose: Full overview and management of all document entries
- Source: Belegbuchungen
- Fields shown: belegdatum, belegnummer, belegbeschreibung (truncated), belegart (badge), kostengruppe (linked name), betrag
- Desktop style: Table with hover states
- Sort: By belegdatum descending (newest first)
- Limit: 20 items per page with pagination

**Belegbuchungen List (Mobile)**
- Purpose: Quick overview of recent entries
- Source: Belegbuchungen
- Fields shown: belegnummer, belegart badge, betrag (prominent), belegdatum (small)
- Mobile style: Compact cards
- Sort: By belegdatum descending
- Limit: 5 most recent, with "Alle anzeigen" link

**Kostengruppen List**
- Purpose: Organize and manage expense categories
- Source: Kostengruppen
- Fields shown: kostengruppenname, kostengruppennummer, count of linked Belegbuchungen
- Mobile style: Grid cards (2 columns)
- Desktop style: Compact list
- Sort: By kostengruppenname alphabetically
- Limit: All (typically small number)

**Steuerberater-Übergaben List**
- Purpose: Track handovers to tax consultant
- Source: SteuerberaterUebergaben
- Fields shown: stichtag, periode_von, periode_bis
- Mobile style: Simple list cards
- Desktop style: Compact list
- Sort: By stichtag descending
- Limit: All

### Primary Action Button (REQUIRED!)

- **Label:** "Neuen Beleg erfassen" (desktop) / "+" icon (mobile FAB)
- **Action:** add_record
- **Target app:** Belegbuchungen
- **What data:** Form with:
  - belegdatum (date picker, default: today)
  - belegnummer (text input)
  - belegbeschreibung (textarea)
  - betrag (number input with EUR formatting)
  - belegart (select dropdown with all options)
  - kostengruppe (select dropdown, populated from Kostengruppen)
  - notizen (optional textarea)
  - belegdatei (file upload - optional)
- **Mobile position:** bottom_fixed (FAB)
- **Desktop position:** header (right side)
- **Why this action:** Adding new receipts is the most frequent action - users do this every time they receive an invoice or make a purchase

### CRUD Operations Per App (REQUIRED!)

**Belegbuchungen CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** FAB button on mobile, "Neuen Beleg erfassen" button in header on desktop
  - **Form fields:**
    - belegdatum (date, required, default: today)
    - belegnummer (text, required)
    - belegbeschreibung (textarea, optional)
    - betrag (number, required)
    - belegart (select: ausgangsrechnung, quittung, kassenbeleg, bankbeleg, gutschrift, eingangsrechnung, sonstiger_beleg)
    - kostengruppe (select from Kostengruppen, optional)
    - notizen (textarea, optional)
    - belegdatei (file, optional)
  - **Form style:** Dialog/Modal on desktop, Bottom sheet on mobile
  - **Required fields:** belegdatum, belegnummer, betrag
  - **Default values:** belegdatum = today's date

- **Read (Anzeigen):**
  - **List view:** Table on desktop, card list on mobile
  - **Detail view:** Click on row/card opens Dialog showing all fields
  - **Fields shown in list:** belegdatum, belegnummer, belegbeschreibung (truncated), belegart, kostengruppe name, betrag
  - **Fields shown in detail:** All fields including notizen and link to belegdatei
  - **Sort:** belegdatum descending
  - **Filter/Search:** Filter by belegart, kostengruppe

- **Update (Bearbeiten):**
  - **Trigger:** Click pencil icon in table row, or "Bearbeiten" button in detail view
  - **Edit style:** Same dialog as Create but pre-filled with current values
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Click trash icon in table row, or "Löschen" button in detail view
  - **Confirmation:** AlertDialog with destructive action
  - **Confirmation text:** "Möchtest du den Beleg '{belegnummer}' wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."

**Kostengruppen CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "+ Neue Kostengruppe" button in section header
  - **Form fields:**
    - kostengruppenname (text, required)
    - kostengruppennummer (text, optional)
    - beschreibung (textarea, optional)
    - kostengruppenbild (file/image, optional)
  - **Form style:** Dialog/Modal
  - **Required fields:** kostengruppenname
  - **Default values:** None

- **Read (Anzeigen):**
  - **List view:** Grid on mobile, list on desktop
  - **Detail view:** Click opens Dialog showing all fields + count of linked Belegbuchungen
  - **Fields shown in list:** kostengruppenname, kostengruppennummer, linked bookings count
  - **Fields shown in detail:** All fields + list of linked bookings
  - **Sort:** kostengruppenname alphabetically
  - **Filter/Search:** None (typically small list)

- **Update (Bearbeiten):**
  - **Trigger:** Click on list item, then "Bearbeiten" button in detail view
  - **Edit style:** Same dialog as Create, pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** "Löschen" button in detail view
  - **Confirmation:** AlertDialog warning about orphaning linked bookings
  - **Confirmation text:** "Möchtest du die Kostengruppe '{kostengruppenname}' wirklich löschen? Verknüpfte Buchungen verlieren ihre Zuordnung."

**Steuerberater-Übergaben CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "+ Neue Übergabe" button in section header
  - **Form fields:**
    - stichtag (date, required)
    - periode_von (date, required)
    - periode_bis (date, required)
    - uebergebene_buchungen (multi-select from Belegbuchungen, optional)
    - bemerkungen (textarea, optional)
  - **Form style:** Dialog/Modal
  - **Required fields:** stichtag, periode_von, periode_bis
  - **Default values:** stichtag = today, periode_von = first of current month, periode_bis = today

- **Read (Anzeigen):**
  - **List view:** Compact list on both mobile and desktop
  - **Detail view:** Click opens Dialog showing all fields
  - **Fields shown in list:** stichtag, periode (formatted as "von - bis")
  - **Fields shown in detail:** All fields + linked bookings count
  - **Sort:** stichtag descending
  - **Filter/Search:** None

- **Update (Bearbeiten):**
  - **Trigger:** Click on list item, then "Bearbeiten" button in detail view
  - **Edit style:** Same dialog as Create, pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** "Löschen" button in detail view
  - **Confirmation:** AlertDialog
  - **Confirmation text:** "Möchtest du diese Übergabe vom {stichtag} wirklich löschen?"

---

## 7. Visual Details

### Border Radius
- rounded (8px) - Professional but not too sharp or too playful
- Cards: 12px radius for a slightly softer feel
- Buttons: 8px
- Badges/chips: pill (full radius)

### Shadows
- subtle - Cards have `shadow-sm` with slight warmth
- On hover: `shadow-md` transition
- Shadow color should have slight warm tint: `0 2px 8px hsl(40 10% 70% / 0.15)`

### Spacing
- spacious - Generous padding inside cards (p-6), comfortable gaps between sections (gap-6)
- Hero card has extra vertical padding (py-8)

### Animations
- **Page load:** Stagger fade-in for cards (100ms delay between)
- **Hover effects:** Smooth shadow transition (150ms), subtle background color shift
- **Tap feedback:** Scale down to 0.98 briefly on mobile

---

## 8. CSS Variables (Copy Exactly!)

```css
:root {
  --background: hsl(40 20% 98%);
  --foreground: hsl(220 25% 20%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(220 25% 20%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(220 25% 20%);
  --primary: hsl(175 60% 35%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(220 15% 96%);
  --secondary-foreground: hsl(220 25% 20%);
  --muted: hsl(220 15% 96%);
  --muted-foreground: hsl(220 10% 50%);
  --accent: hsl(175 50% 45%);
  --accent-foreground: hsl(220 25% 15%);
  --destructive: hsl(0 65% 50%);
  --border: hsl(220 15% 90%);
  --input: hsl(220 15% 90%);
  --ring: hsl(175 60% 35%);
  --radius: 0.5rem;
  --chart-1: hsl(175 60% 35%);
  --chart-2: hsl(160 60% 40%);
  --chart-3: hsl(220 20% 60%);
  --chart-4: hsl(40 50% 55%);
  --chart-5: hsl(0 65% 50%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans with weights 300-700)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5 (65/35 split)
- [ ] Hero element is prominent as described (large amount, teal accent line)
- [ ] Colors create warm, professional mood
- [ ] CRUD patterns are consistent across all apps (Dialog style)
- [ ] Delete confirmations are in place for all apps
- [ ] FAB on mobile for primary action
- [ ] Header button on desktop for primary action
- [ ] All belegart options are available in select
- [ ] Kostengruppen dropdown populated in booking form
- [ ] Date formatting uses German locale (DD.MM.YYYY)
- [ ] Currency formatting uses German locale (1.234,56 €)
