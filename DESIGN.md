# AmenBox Design System

> A comprehensive reference for designers and developers building with the AmenBox brand.

---

## Brand Overview

**AmenBox** is a modern, trust-forward platform brand. Its identity is built around forward momentum (the arrow motif in the logo), clarity, and a dual-tone palette that balances authority with approachability.

---

## Logo

### Variants

| Variant             | File                               | Usage                              |
| ------------------- | ---------------------------------- | ---------------------------------- |
| Main (horizontal)   | `Logo_AmenBox__Main_.png`          | Primary usage across most contexts |
| Secondary (stacked) | `Logo_AmenBox__Secondary_.png`     | Compact/square layouts, app icons  |
| White version       | `Logo_AmenBox__white_version_.png` | Dark backgrounds                   |
| Icon only (color)   | `Logo_AmenBox__Icon_.png`          | Favicons, app icons, small spaces  |
| Icon only (white)   | `Logo_AmenBox__Icon_white_.png`    | Dark background icon-only contexts |

### Logo Anatomy

The AmenBox logomark is composed of two distinct elements:

- **Arrow cluster (blue)** — `#2B3497` — Represents direction, movement, and decisiveness
- **Sparkle/asterisk (teal)** — `#4BBFA0` — Represents connection, possibility, and value

The wordmark splits into `Amen` (blue) and `Box` (teal), reinforcing the dual-color brand identity.

### Clear Space

Maintain a minimum clear space equal to the height of the "A" in the wordmark on all sides of the logo. Never crowd the logo with other elements.

### ❌ Logo Don'ts

- Do not recolor the logo outside the brand palette
- Do not stretch or distort the logo
- Do not use the color logo on busy/photographic backgrounds (use white version instead)
- Do not separate "Amen" from "Box" typographically
- Do not apply drop shadows or effects to the logo

---

## Color Palette

### Primary Colors

| Name             | Hex       | Usage                                                  |
| ---------------- | --------- | ------------------------------------------------------ |
| **AmenBox Blue** | `#2B3497` | Primary brand, headings, CTAs, nav backgrounds         |
| **AmenBox Teal** | `#4BBFA0` | Accents, highlights, secondary buttons, success states |

> **Note:** The charter also references `#2c398f` and `#4db99d` as close variants — treat these as equivalent to the above.

### Extended Palette (from charter)

| Name                    | Hex       | Usage                                        |
| ----------------------- | --------- | -------------------------------------------- |
| **Coral / Error**       | `#ec6062` | Error states, alerts, destructive actions    |
| **Off-white / Surface** | `#f5f5f4` | Page backgrounds, card surfaces, input fills |

### Semantic Color Usage

```
Background:        #f5f5f4
Primary action:    #2B3497
Secondary action:  #4BBFA0
Danger / Error:    #ec6062
Text primary:      #2B3497  (or #1a1a2e for dark text on light bg)
Text on dark:      #ffffff
Borders / Dividers: rgba(43, 52, 151, 0.12)
```

### CSS Variables

```css
:root {
	--color-primary: #2b3497;
	--color-secondary: #4bbfa0;
	--color-danger: #ec6062;
	--color-surface: #f5f5f4;
	--color-white: #ffffff;
	--color-text: #1a1a2e;
	--color-text-muted: rgba(26, 26, 46, 0.55);
}
```

---

## Typography

### Typefaces

| Font           | Weight         | Script | Role                                     |
| -------------- | -------------- | ------ | ---------------------------------------- |
| **Montserrat** | SemiBold (600) | Latin  | Headings, display, brand text            |
| **DM Sans**    | Medium (500)   | Latin  | Body copy, UI labels, descriptions       |
| **Cairo**      | Medium (500)   | Arabic | All Arabic / RTL content                 |
| _(Poppins)_    | —              | Latin  | Supplemental / alternative to Montserrat |

> **Poppins** is listed in the design system file as the font — use it where Montserrat is unavailable or as an alternative heading font.

### Type Scale (8pt grid)

| Token            | Size | Usage                              |
| ---------------- | ---- | ---------------------------------- |
| `--text-display` | 36px | Hero headlines, major display text |
| `--text-h1`      | 26px | Page titles                        |
| `--text-h2`      | 20px | Section headings                   |
| `--text-h3`      | 16px | Card titles, sub-sections          |
| `--text-body`    | 14px | Body text, descriptions            |
| `--text-small`   | 11px | Captions, labels, metadata         |

### CSS Variables

```css
:root {
	--font-heading: 'Montserrat', 'Poppins', sans-serif;
	--font-body: 'DM Sans', sans-serif;
	--font-arabic: 'Cairo', sans-serif;

	--text-display: 36px;
	--text-h1: 26px;
	--text-h2: 20px;
	--text-h3: 16px;
	--text-body: 14px;
	--text-small: 11px;
}
```

---

## Spacing

All spacing follows an **8pt grid system**.

| Token        | Value | Usage                              |
| ------------ | ----- | ---------------------------------- |
| `--space-xs` | 8px   | Tight inner padding, icon gaps     |
| `--space-sm` | 16px  | Standard inner padding, small gaps |
| `--space-md` | 24px  | Card padding, form field gaps      |
| `--space-lg` | 32px  | Section gaps, large padding        |
| `--space-xl` | 48px  | Major section separations          |

```css
:root {
	--space-xs: 8px;
	--space-sm: 16px;
	--space-md: 24px;
	--space-lg: 32px;
	--space-xl: 48px;
}
```

---

## Border Radius

| Token           | Value | Usage                               |
| --------------- | ----- | ----------------------------------- |
| `--radius-xs`   | 4px   | Small tags, chips                   |
| `--radius-sm`   | 8px   | Inputs, small cards                 |
| `--radius-md`   | 12px  | Buttons, standard cards             |
| `--radius-lg`   | 16px  | Large cards, modals                 |
| `--radius-xl`   | 24px  | Hero sections, feature panels       |
| `--radius-full` | 999px | Pills, avatar bubbles, rounded tags |

```css
:root {
	--radius-xs: 4px;
	--radius-sm: 8px;
	--radius-md: 12px;
	--radius-lg: 16px;
	--radius-xl: 24px;
	--radius-full: 999px;
}
```

---

## Components

### Buttons

Three height tiers based on context:

| Tier    | Height | Usage                        |
| ------- | ------ | ---------------------------- |
| Small   | h:32px | Inline actions, table rows   |
| Default | h:40px | Standard CTAs                |
| Large   | h:52px | Hero CTAs, prominent actions |

```css
/* Primary Button */
.btn-primary {
	background: var(--color-primary);
	color: #fff;
	font-family: var(--font-heading);
	font-size: var(--text-body);
	font-weight: 600;
	border-radius: var(--radius-md);
	padding: 0 var(--space-sm);
	height: 40px;
	border: none;
	cursor: pointer;
}

/* Secondary Button */
.btn-secondary {
	background: var(--color-secondary);
	color: #fff;
	/* ... same structure */
}

/* Outline Button */
.btn-outline {
	background: transparent;
	color: var(--color-primary);
	border: 2px solid var(--color-primary);
	/* ... same structure */
}
```

### Icons

| Size | Value | Usage                            |
| ---- | ----- | -------------------------------- |
| XS   | 24px  | Inline / text-adjacent           |
| SM   | 32px  | List items, form fields          |
| MD   | 48px  | Feature cards, section icons     |
| LG   | 64px  | Hero illustrations, empty states |

---

## Iconography Style

Icons should be **rounded**, with **thick strokes** and **pill-shaped ends** — consistent with the AmenBox logo motif. Avoid sharp-cornered or thin-line icon sets.

Recommended libraries: **Phosphor Icons** (rounded), **Lucide** (rounded variant), or custom SVG following the logo's stroke style.

---

## Elevation & Shadow

```css
:root {
	--shadow-sm: 0 1px 4px rgba(43, 52, 151, 0.08);
	--shadow-md: 0 4px 16px rgba(43, 52, 151, 0.12);
	--shadow-lg: 0 8px 32px rgba(43, 52, 151, 0.16);
	--shadow-xl: 0 16px 48px rgba(43, 52, 151, 0.2);
}
```

Use blue-tinted shadows (derived from `--color-primary`) rather than grey shadows to keep UI on-brand.

---

## RTL / Arabic Support

AmenBox supports Arabic content. When rendering Arabic:

- Switch font to `Cairo` (medium weight)
- Set `direction: rtl` and `text-align: right` on the root or page-level container
- Mirror directional icons (arrows, chevrons) using `transform: scaleX(-1)`
- The logo is **not mirrored** in RTL contexts — use the same logo file

---

## Quick Reference Card

```
COLORS
  Primary:    #2B3497
  Secondary:  #4BBFA0
  Danger:     #ec6062
  Surface:    #f5f5f4

FONTS
  Heading:    Montserrat SemiBold / Poppins
  Body:       DM Sans Medium
  Arabic:     Cairo Medium

TYPE SCALE    36 · 26 · 20 · 16 · 14 · 11px
SPACING       8 · 16 · 24 · 32 · 48px  (8pt grid)
RADIUS        4 · 8 · 12 · 16 · 24 · 999px
BUTTONS       h:32 · h:40 · h:52
ICONS         24 · 32 · 48 · 64px
```

---

_AmenBox Design System — last updated May 2026_
