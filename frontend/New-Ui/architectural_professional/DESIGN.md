---
name: Architectural Professional
colors:
  surface: '#f8f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#57423c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#8a726b'
  outline-variant: '#ddc0b8'
  surface-tint: '#a13f1f'
  primary: '#a13f1f'
  on-primary: '#ffffff'
  primary-container: '#e8734f'
  on-primary-container: '#5a1500'
  inverse-primary: '#ffb59f'
  secondary: '#485f86'
  on-secondary: '#ffffff'
  secondary-container: '#b9cffd'
  on-secondary-container: '#42587f'
  tertiary: '#006b5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#4ba491'
  on-tertiary-container: '#00352c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#822809'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b0c7f4'
  on-secondary-fixed: '#001b3e'
  on-secondary-fixed-variant: '#30476d'
  tertiary-fixed: '#9af3de'
  tertiary-fixed-dim: '#7ed6c2'
  on-tertiary-fixed: '#00201a'
  on-tertiary-fixed-variant: '#005144'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  sidebar-width: 280px
  header-height: 64px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The brand personality of this design system is authoritative, warm, and structured. It targets a professional audience that values precision and reliability, evoking an emotional response akin to standing in a well-designed modern gallery: a sense of order, space, and quiet confidence.

The design style is **Corporate / Modern** with a strong **Editorial** influence. It utilizes a sophisticated "Architectural" approach—prioritizing clear structural hierarchies, high-quality typography pairings, and a restrained but purposeful use of color. The interface balances the coldness of professional data with the warmth of coral accents and classical serif headings to ensure the product feels human-centric rather than purely transactional.

## Colors

The palette is anchored by the high-contrast relationship between the deep indigo-blue and the vibrant coral accent. 

- **Primary Accent (#E8734F):** Used sparingly for high-intent actions, active navigation states, and critical links. This color provides the "warmth" in the architectural style.
- **Secondary / Navigation (#1B3358):** Reserved for the sidebar and header elements. This creates a strong "frame" for the content, establishing a clear site structure.
- **Surface & Background:** The main application canvas uses a soft grey (#F4F6F8) to reduce eye strain, while interactive surfaces and cards use pure white (#FFFFFF) to pop against the background.
- **Functional Colors:** Status indicators follow a professional muted tone, ensuring they inform the user without breaking the sophisticated aesthetic.

## Typography

This design system uses a dual-font strategy to reinforce the professional-architectural theme.

**Headings (Source Serif 4):** A professional serif that brings an editorial and authoritative feel to the interface. It should be used for page titles, section headers, and significant data points.

**Body & UI (IBM Plex Sans):** A systematic, high-legibility sans-serif used for all functional text, including tables, labels, and paragraph content. Its technical roots complement the "architectural" style while ensuring maximum readability across dense data.

Hierarchy is maintained through clear weight distinctions. Labels and small UI elements should utilize the Medium or SemiBold weights of IBM Plex Sans to ensure they remain legible against the neutral background.

## Layout & Spacing

The layout follows a **Fixed Grid** model for content, anchored by a persistent structural sidebar.

- **Sidebar:** Positioned on the left, using a deep indigo (#1B3358) background. It features a fixed width of 280px. Navigation items should be vertically stacked and prefixed with subtle numbers (e.g., 01, 02) to emphasize the architectural order.
- **Main Canvas:** Content resides on the light grey background. Cards and modules should be aligned to a 12-column grid on desktop.
- **Header:** A transparent or white top-bar handles global actions. User badges and profile settings are pinned to the top-right corner for consistent access.
- **Responsive Behavior:** 
    - **Desktop:** 12 columns, 24px gutters, 32px margins.
    - **Tablet:** 8 columns, 16px gutters, 24px margins. Sidebar can collapse into an icon-only rail or hamburger menu.
    - **Mobile:** 4 columns, 16px gutters, 16px margins. Sidebar moves to a bottom nav or full-screen overlay.

## Elevation & Depth

Depth in this design system is conveyed through **Tonal Layers** and **Ambient Shadows**.

The primary background (#F4F6F8) acts as the lowest level (Level 0). Cards and interactive surfaces (Level 1) use pure white (#FFFFFF) and are defined by a singular, soft ambient shadow (e.g., `0px 4px 12px rgba(27, 39, 51, 0.08)`).

Avoid heavy dropshadows or neomorphic effects. The goal is to make cards feel like they are resting lightly on the surface. Borders should be minimal; if needed, use a 1px solid stroke in a slightly darker neutral shade (#E2E8F0) instead of a shadow for secondary elements like input fields or table rows.

## Shapes

The shape language is **Rounded**, favoring a 0.5rem (8px) corner radius for most UI components.

This specific radius is chosen to soften the "architectural" rigidity of the layout, adding the "warmth" required by the brand personality. 
- **Buttons & Cards:** 0.5rem (8px).
- **Large Container Surfaces:** 1rem (16px).
- **Small UI Elements (Chips/Tags):** 0.25rem (4px) or full pill-shape depending on the context of the data.

Consistency in corner radii is critical to maintaining the professional look.

## Components

### Buttons
Primary buttons use the Coral (#E8734F) background with white text. Secondary buttons should use a ghost style (Coral border/text) or the Indigo-blue for high-contrast utility.

### Sidebar Navigation
Items are styled with a hover state that lightens the Indigo background. Active states are indicated by a Coral vertical bar on the far left or right of the menu item and a change in text color to Coral. Numbers should be rendered in a muted version of the text color.

### Cards
White background with Level 1 shadows. Headers within cards should use the serif font (Source Serif 4) at a `headline-sm` or `headline-xs` level.

### Inputs & Tables
Tables are high-density, utilizing IBM Plex Sans. Zebra-striping is discouraged; use 1px horizontal dividers in a light neutral gray. Form inputs should have a subtle 1px border that turns Coral on focus.

### User Badge
Located in the top-right of the header. It should feature a circular avatar with a subtle ring in the secondary indigo or primary coral to denote status or active sessions.