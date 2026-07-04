---
name: Luminous Scholar
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  container-max: 1280px
---

## Brand & Style

The design system adopts a **Luminous Academic** aesthetic, blending the precision of high-end research tools with the clarity of a modern editorial gallery. The personality is intellectual, serene, and highly organized, designed to reduce cognitive load while maintaining a premium feel.

The style is a refined mix of **Minimalism** and **Glassmorphism**, optimized for a light environment. It utilizes vast amounts of white space ("breathing room"), razor-sharp typography, and translucent layers that catch "light" rather than casting shadows. The result is a UI that feels weightless and transparent, encouraging deep focus and systematic thinking.

## Colors

The palette is anchored in **Pure White (#FFFFFF)** and **Slate Gray (#F8FAFC)** to create a high-key, luminous foundation. 

- **Primary Accent:** A focused Intellectual Blue (#2563EB) is used sparingly for interactive cues and critical data highlights.
- **Secondary:** A muted Steel (#64748B) provides structural contrast without overwhelming the white space.
- **Surfaces:** Containers use semi-transparent whites with high-saturation background blurs, creating a "frosted pane" effect that feels airy and modern.

## Typography

This design system exclusively employs **Hanken Grotesk** to achieve a clean, sharp, and contemporary academic look. 

- **Headlines:** Use Bold and Semi-Bold weights with slight negative letter-spacing for a sophisticated, "pressed-ink" feel.
- **Body:** Standard reading text utilizes a 400 weight with generous line heights (1.5x) to maximize legibility against the light background.
- **Labels:** Small caps with increased tracking are used for metadata, references, and categorization, mimicking traditional scholarly citations.

## Layout & Spacing

The system follows a **Fluid Grid** philosophy with expansive margins to emphasize the content's importance. 

- **Desktop:** A 12-column layout with wide 24px gutters. The margins are generous (64px) to push the eye toward the center of the screen.
- **Mobile:** Scales down to a 4-column layout with 20px margins.
- **Rhythm:** All spacing—padding, margins, and component heights—is derived from a 4px base unit to ensure mathematical harmony.

## Elevation & Depth

In light mode, depth is created through **Glassmorphism** and subtle **Tonal Layers** rather than traditional shadows.

- **The Glass Effect:** Elevated panels use a `backdrop-filter: blur(12px)` combined with a 70% opaque white background. 
- **The Glow Border:** Instead of drop shadows, use a 1px inner border in a slightly brighter white or a very faint secondary color (`rgba(0,0,0,0.05)`) to define edges.
- **Tonal Stepping:** The background is #F8FAFC, while primary cards are #FFFFFF. This creates a natural hierarchy of information without visual clutter.

## Shapes

The shape language is consistently **Rounded (Level 2)**. 

- **Standard Components:** Buttons and inputs use a 0.5rem (8px) radius, providing a soft but disciplined look.
- **Large Containers:** Cards and modal dialogs use 1rem (16px) or 1.5rem (24px) for a more welcoming, organic feel.
- **Interaction:** Pill-shaped elements (Level 3) are reserved specifically for non-essential decorative tags or status indicators.

## Components

- **Buttons:** Primary buttons are solid Blue (#2563EB) with white text. Secondary buttons are glass-based with a subtle 1px border. Use a slight "lift" (scale 1.02) on hover.
- **Input Fields:** Use a #F1F5F9 background with a 1px bottom border. On focus, the border transitions to Primary Blue with a very soft outer glow.
- **Cards:** White or Glass containers with a 1px border (`#E2E8F0`). Do not use drop shadows; rely on the background blur to separate the card from the canvas.
- **Chips:** Small, rounded-full elements with light gray backgrounds and dark gray text. Use for tags, authors, or categories.
- **Lists:** Clean rows separated by 1px light gray dividers. Use generous vertical padding (16px+) to maintain the airy aesthetic.
- **Data Tables:** High-density Hanken Grotesk typography, minimal borders, and a light-gray zebra striping for readability.