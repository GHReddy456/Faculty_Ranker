---
name: Ethereal Academic
colors:
  surface: '#111412'
  surface-dim: '#111412'
  surface-bright: '#373a37'
  surface-container-lowest: '#0c0f0d'
  surface-container-low: '#1a1c1a'
  surface-container: '#1e201e'
  surface-container-high: '#282b28'
  surface-container-highest: '#333533'
  on-surface: '#e2e3df'
  on-surface-variant: '#c4c6cc'
  inverse-surface: '#e2e3df'
  inverse-on-surface: '#2f312e'
  outline: '#8e9196'
  outline-variant: '#44474c'
  surface-tint: '#bac8dc'
  primary: '#bac8dc'
  on-primary: '#243141'
  primary-container: '#0d1b2a'
  on-primary-container: '#768497'
  inverse-primary: '#525f71'
  secondary: '#bbc6e2'
  on-secondary: '#263046'
  secondary-container: '#3e4960'
  on-secondary-container: '#adb8d3'
  tertiary: '#afc9ea'
  on-tertiary: '#17324d'
  tertiary-container: '#001b33'
  on-tertiary-container: '#6b85a4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e4f9'
  primary-fixed-dim: '#bac8dc'
  on-primary-fixed: '#0f1c2c'
  on-primary-fixed-variant: '#3a4859'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#bbc6e2'
  on-secondary-fixed: '#101b30'
  on-secondary-fixed-variant: '#3c475d'
  tertiary-fixed: '#d1e4ff'
  tertiary-fixed-dim: '#afc9ea'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#2f4865'
  background: '#111412'
  on-background: '#e2e3df'
  surface-variant: '#333533'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  rating-number:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built on the principles of **Glassmorphism**, specifically tailored for an academic environment that values transparency and modern data visualization. The brand personality is professional yet innovative, moving away from the "stiff" corporate feel of traditional educational software toward a more fluid, digital-first experience.

The target audience consists of students and faculty members who require quick access to performance metrics. The UI evokes a sense of depth and focus through:
- **Translucency:** Layered surfaces that maintain context of the background.
- **Luminosity:** Subtle glows and vibrant accents that highlight key rating data.
- **Clarity:** Sharp typography contrasted against soft, blurred backgrounds to ensure high readability despite the frosted effects.

## Colors

The color palette is divided into two distinct modes to support accessibility and user preference.

**Dark Mode (Primary):**
- **Base:** Deep navy and midnight teals (`#0D1B2A`) provide a stable, low-strain background.
- **Surfaces:** Semi-transparent layers of deep blue allow background "blobs" or gradients to peek through, creating the glass effect.
- **Accents:** High-rating metrics use a vibrant Mint/Teal (`#00F5D4`), while low ratings use a soft Coral/Red (`#FF595E`).

**Light Mode:**
- **Base:** Clean, off-white backgrounds with a soft blue-grey tint.
- **Surfaces:** Frosted white glass with higher opacity (15-20%) to maintain contrast against the light background.
- **Text:** High-contrast charcoal and slate greys for readability.

## Typography

This design system utilizes a trio of sans-serif and monospaced fonts to balance aesthetic appeal with technical precision.

- **Hanken Grotesk:** Used for major headings and rating numbers. Its contemporary proportions feel modern and high-end.
- **Inter:** The workhorse for body copy and faculty descriptions, chosen for its exceptional legibility on variable backgrounds.
- **JetBrains Mono:** Used sparingly for labels, metadata (e.g., student counts), and technical ratings to give a "data-centric" feel.

**Scaling:** On mobile devices, `display-lg` scales down to 32px, and `headline-lg` scales to 24px to prevent horizontal overflow and maintain visual balance.

## Layout & Spacing

The layout follows a **fluid grid** model with generous margins to allow the glass elements room to "breathe."

- **Grid:** A 12-column system is used for desktop. Faculty cards typically span 4 columns (3 per row) or 6 columns (2 per row) depending on the data density required.
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Adaptation:**
    - **Desktop:** 12 columns, 40px side margins.
    - **Tablet:** 8 columns, 24px side margins.
    - **Mobile:** 4 columns, 16px side margins. Cards reflow to a single-column stack.

## Elevation & Depth

Depth is not achieved through traditional black shadows, but through **Backdrop Blurs** and **Luminous Outlines**.

1.  **Backdrop Filter:** All glass cards must have a `blur(12px)` to `blur(20px)` applied to the background.
2.  **Inner Glow:** Use a 1px solid or semi-transparent border on the top and left sides of elements to simulate a light source catching the edge of the glass.
3.  **Shadows:** Shadows should be extremely soft, using the color of the background rather than black (e.g., a deep navy shadow for dark mode) with a 10-15% opacity and a high spread (30px+).
4.  **Z-Index Tiers:** 
    - Base: Background gradients/blobs.
    - Tier 1: Main content cards (Frosted glass).
    - Tier 2: Modals and dropdowns (Thicker blur, lighter border).

## Shapes

The shape language is consistently **Rounded** (Role 2) to complement the organic, fluid nature of glassmorphism.

- **Cards:** 1rem (16px) corner radius.
- **Buttons:** 0.5rem (8px) corner radius for a more structural feel compared to the cards.
- **Inputs:** 0.5rem (8px).
- **Faculty Photos:** Use a slightly tighter radius (12px) than the parent card to create a nested visual harmony.

## Components

### Glass Cards
The core container for faculty info. Features a `rgba(255, 255, 255, 0.05)` background in dark mode, a 1px border `rgba(255, 255, 255, 0.1)`, and a backdrop blur of 16px.

### Translucent Buttons
- **Primary:** Semi-opaque teal or blue background with white text.
- **Secondary/Ghost:** No background fill, 1px white border at 20% opacity, becoming 40% on hover.
- **Submit Button:** Solid accent color (`#00F5D4` or `#4CC9F0`) to ensure clear Call-to-Action visibility.

### Rating Indicators
- **Stars:** Use a simplified geometric star icon. Active stars should have a subtle outer glow in the accent color.
- **Score Badges:** Large, bold numbers using `rating-number` typography, color-coded by performance (Green/Teal for >4.0, Red for <2.5).

### Input Fields
Search bars and text areas should use a "hollow glass" style: a very dark, semi-transparent fill with a highlighted bottom border or a full 1px border that glows when focused.

### Chips/Tags
Small, pill-shaped elements for "Specialization Areas." These should have a slightly higher background opacity than cards to remain legible over the blurred content.