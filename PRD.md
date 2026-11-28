# AVERON AI — Frontend Redesign PRD
## Product Requirements Document
**Project:** AVERON AI  
**Product Category:** AI-Powered Cybersecurity & Threat Intelligence Platform  
**Design Direction:** OBSIDIAN GRID  
**Theme:** Dark Mode Only  
**Primary Objective:** Transform the existing website into a premium, professional, app-like cybersecurity SaaS product.

---

# 1. PROJECT VISION

Redesign the entire frontend of AVERON AI into a high-quality cybersecurity application that looks and feels like a professionally engineered commercial product.

The interface must communicate:
- Security
- Intelligence
- Reliability
- Technical sophistication
- Precision
- Professionalism

The result must NOT look like a generic AI-generated website, a template dashboard, or a typical vibe-coded project.

Every component must feel intentional and belong to one unified design system.

The application should feel closer to a premium desktop security application than a conventional marketing website.

## Most important requirements

1. Preserve all existing backend functionality.
2. Preserve the existing threat-scanning workflow.
3. Do not break existing API integrations.
4. Do not remove existing working features.
5. Prioritise performance over decorative effects.
6. Build a consistent design system.
7. Make desktop and mobile experiences equally polished.
8. Use carefully implemented liquid-glass elements.
9. Use professional typography and high-quality icons.
10. Ensure all interactions and navigation actually work.

This is a FRONTEND REDESIGN, not a backend rewrite.

---

# 2. BRAND IDENTITY — OBSIDIAN GRID

Create a distinct and recognisable visual identity for AVERON AI.

## Colour palette

Use a sophisticated dark palette.

### Primary colours

- Main background: #080B10
- Secondary background: #0D1219
- Elevated surfaces: #111923
- Card background: #141E29
- Border: rgba(255,255,255,0.08)
- Primary emerald: #20D6A0
- Secondary emerald: #10B981
- Primary text: #F4F7FA
- Secondary text: #A0AAB8
- Muted text: #687586

### Semantic colours

- Critical: #FF4D5E
- High: #FF8A4C
- Medium: #F4BD50
- Low: #48BFA0
- Safe: #28D99A
- Information: #63A9FF

### Colour usage rules

- Emerald should represent protection, trusted actions and positive security states.
- Red should represent critical threats and dangerous activities.
- Amber should represent warnings and suspicious activity.
- Blue should represent neutral information.
- Avoid excessive colourful gradients.
- Avoid rainbow effects.
- Avoid bright neon backgrounds.
- Never use too many accent colours within one component.

The overall application must remain dark.

Do not introduce a light theme or a light/dark theme switcher.

## Typography

Use a professional combination of:

**Primary font: Inter**
- Dashboard content
- Navigation
- Buttons
- Body text
- Tables
- Forms

**Secondary font: Space Grotesk**
- Main headings
- Brand typography
- Important section headings
- Hero headlines

**Monospace font: JetBrains Mono**
- URLs
- IP addresses
- Hashes
- Technical identifiers
- Scan IDs
- Risk scores where appropriate

Typography must have a clear hierarchy.

Avoid unnecessarily large headings, inconsistent font sizes and excessive font weights.

Use readable line heights and balanced letter spacing.

---

# 3. VISUAL DESIGN LANGUAGE

## General appearance

Use:
- Matte black and charcoal surfaces.
- Subtle emerald accents.
- Thin borders.
- Carefully controlled shadows.
- Premium spacing.
- Rounded but not excessively rounded corners.
- Consistent component sizing.
- Clean alignment.
- High-quality icons.
- Restrained animations.

Avoid:
- Excessive glowing effects.
- Giant gradients.
- Unnecessary floating elements.
- Random decorative circles.
- Excessive background particles.
- Too many glass cards.
- Oversized headings.
- Excessive animations on every element.

The interface should be visually rich without becoming visually noisy.

## Liquid glass design system

Liquid glass should be used selectively in important interface areas.

Use actual glass-like rendering and refractive highlights wherever practical.

Do NOT simply apply CSS backdrop-filter blur and call it liquid glass.

Preferred techniques:
- WebGL-based refraction.
- Shader-generated reflections.
- Subtle specular highlights.
- Transparent layered surfaces.
- Thin luminous edges.
- Controlled light distortion.
- Realistic liquid-metal reflections.

Glass elements must remain readable against the dark background.

For browsers or devices that cannot support the effects, provide a lightweight non-blurred fallback using translucent gradients, highlights and borders.

Do not allow the glass effects to reduce readability or performance.

---

# 4. TECHNICAL REQUIREMENTS

First inspect the existing codebase before making changes.

The target architecture should support:

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Responsive layouts

If the existing project already uses these technologies, retain the current configuration.

Do not unnecessarily reinstall, migrate or replace the existing stack.

## Component directory

Use:

`/components/ui/`

This should contain reusable UI components.

If the existing component directory differs, inspect the current project structure and configure the appropriate aliases rather than creating duplicate component systems.

Keep application-specific components separate from reusable UI primitives.

Recommended organisation:

```text
src/
  components/
    ui/
      liquid-metal-button.tsx
      liquid-glass-navbar.tsx
    layout/
      AppHeader.tsx
      Sidebar.tsx
      MobileNavigation.tsx
    dashboard/
      OverviewCards.tsx
      RiskChart.tsx
      RecentScans.tsx
      ThreatAlerts.tsx
    scanner/
      URLScanner.tsx
      ScanProgress.tsx
      ScanResults.tsx
    shared/
      StatusBadge.tsx
      EmptyState.tsx
      LoadingState.tsx
  pages/
  hooks/
  lib/
  styles/
```

Adapt paths to the actual application architecture.

---

# 5. LIQUID METAL BUTTON INTEGRATION

Integrate the supplied React component:

`liquid-metal-button.tsx`

Use the exact implementation supplied with this specification as the starting point.

Install:

```bash
npm install clsx lucide-react tailwind-merge @paper-design/shaders
```

Place the component in:

`/components/ui/liquid-metal-button.tsx`

Use its existing props:

- label
- onClick
- viewMode

Use the component for:
- Primary scan actions.
- Important hero CTA.
- Get Started.
- Other high-priority actions where its visual treatment adds value.

Example:

```tsx
<LiquidMetalButton
  label="Scan URL"
  onClick={handleScan}
/>
```

Use icon mode only where a standalone icon action makes sense.

## Performance requirements

The supplied button uses a WebGL shader.

Do not create dozens of independent shader instances.

- Prioritise the main CTA.
- Reuse standard lightweight buttons for ordinary actions.
- Clean up shader instances on unmount.
- Prevent memory leaks.
- Ensure click handlers remain functional.
- Keep the supplied fallback behaviour.
- Respect reduced-motion preferences.
- Prevent unnecessary component re-renders.

Fix any accessibility or lifecycle issues discovered during integration without changing the component's visual identity.

Do not use the liquid-metal button for every small action.

---

# 6. LIQUID GLASS NAVBAR INTEGRATION

Integrate the supplied:

`liquid-glass-navbar.tsx`

Place it in:

`/components/ui/liquid-glass-navbar.tsx`

The supplied component includes:
- Liquid movement.
- WebGL water rendering.
- Active navigation indicator.
- Interactive liquid deformation.
- Ripple effects.
- Icon animations.
- Reduced-motion handling.
- A CSS fallback when WebGL is unavailable.

Use the supplied implementation as the starting point.

The navbar must be adapted to AVERON AI's dark design system.

## Important modifications

1. Use dark tone.
2. Replace the sample navigation items with actual application navigation.
3. Use professional Lucide icons.
4. Keep labels short and meaningful.
5. Ensure keyboard navigation works.
6. Ensure active states match the current route.
7. Avoid playing audio.
8. Avoid unnecessary shader rendering.
9. Respect reduced-motion settings.
10. Ensure all navigation destinations are real.

The supplied navbar currently includes backdrop-filter blur in its glass layer. Replace that blur-based treatment with the actual liquid/WebGL rendering where supported.

Use a translucent, non-blurred fallback when WebGL is unavailable.

Do not rely on CSS blur as the main glass effect.

## Desktop navigation

Use the liquid-glass navigation treatment for the main application navigation where it fits the layout.

## Mobile navigation

Use a compact icon-first navigation.

Recommended destinations:

- Overview
- Scanner
- History
- Intelligence
- Profile

Use the liquid-glass navigation component only if its rendering remains smooth on mobile devices. Otherwise, retain the same visual language with a lightweight static glass surface and clean active indicator.

---

# 7. APPLICATION LAYOUT

The application must have a unified structure.

## Desktop layout

Use:

- A professional header.
- A collapsible sidebar.
- A central content area.
- Consistent content widths.
- A structured dashboard grid.

Suggested layout:

```text
------------------------------------------------
 AVERON AI        Navigation       Profile
------------------------------------------------
 Sidebar       | Main Application Content
               |
 Overview      | Page Heading
 URL Scanner   | Page Description
 History       |
 Intelligence  | Dashboard / Scanner / Reports
 Settings      |
               |
------------------------------------------------
```

The layout must feel like a real security application.

Avoid making every section a separate oversized card.

Use a combination of open layouts, subtle separators and elevated surfaces.

## Header

The header must include:

- AVERON AI brand identity.
- A professional shield-inspired logo.
- Application navigation or relevant navigation controls.
- System status indicator.
- Notification icon.
- User profile.
- Responsive mobile behaviour.

Header design:
- Dark translucent surface.
- Thin border.
- Carefully controlled reflections.
- Optional liquid-glass treatment.
- Consistent height.
- Proper alignment.

The header must not occupy excessive vertical space.

---

# 8. BRAND LOGO AND APPLICATION IDENTITY

Create a consistent AVERON AI identity.

Use a custom shield-inspired visual mark or a carefully selected Lucide icon.

Suggested icons:
- ShieldCheck
- Shield
- Fingerprint
- ScanSearch
- Radar

Use the shield mark consistently across:
- Header.
- Sidebar.
- Login screen.
- Loading states.
- Favicon where practical.
- Mobile navigation where appropriate.

The brand name must always be displayed consistently as:

AVERON AI

Do not randomly change the logo or brand colours between pages.

---

# 9. DASHBOARD REDESIGN

The dashboard is one of the most important parts of this redesign.

It must look like a premium cybersecurity command centre.

Do not create a dashboard consisting only of four generic statistic cards.

Create a meaningful visual hierarchy.

## Dashboard heading

Title:

Security Overview

Subtitle:

Monitor threats, analyse suspicious URLs and track your security activity.

Include a small system-status indicator.

## Main statistics

Create professional metric components for:

1. Total URLs Scanned.
2. Safe URLs.
3. Suspicious URLs.
4. Critical Threats.

Each metric should display:
- Main value.
- Relevant icon.
- Short description.
- Optional comparison with a previous period, only if real data exists.

Use real backend data wherever available.

Do not invent statistics or display fake live activity.

## Risk distribution

Create a professional risk-distribution visualisation.

Possible categories:
- Safe.
- Low.
- Medium.
- High.
- Critical.

Use a clean chart with a restrained colour palette.

Charts must have:
- Clear labels.
- Tooltips.
- Readable values.
- Responsive sizing.
- Empty states when data is unavailable.

## Recent scans

Create a professional recent-scans table.

Columns:
- URL / Domain.
- Risk Score.
- Threat Level.
- Scan Status.
- Date.
- Action.

Include:
- Search.
- Filtering.
- Sorting where appropriate.
- Pagination if required.
- Clickable scan details.

Do not overload the table with unnecessary information.

## Threat activity

Add a recent threat activity section.

Display:
- Threat name or category.
- Affected domain.
- Severity.
- Detection time.
- Status.

Only show actual available data.

## Dashboard visual hierarchy

The most important information should be immediately visible.

Use consistent card heights, spacing and typography.

Do not make every metric glow or animate.

---

# 10. URL SCANNER EXPERIENCE

The URL scanner is the core feature of AVERON AI.

Give it a dedicated, polished interface.

## Scanner layout

Create a clean scanning workspace.

Include:

- Clear heading.
- Short explanation.
- URL input field.
- Scan button.
- URL validation feedback.
- Loading and scanning states.
- Scan results.

The URL input should feel like a professional security tool, not a generic contact form.

## Scanning workflow

Preserve the existing scanner logic and its five-stage architecture:

1. URL Extraction / Submit.
2. Domain Investigation / Extract.
3. Threat Intelligence / Investigate.
4. Risk Evaluation / Evaluate.
5. Security Verdict / Protect.

Display these stages in a clean progress interface.

Each stage should have:
- Icon.
- Stage name.
- Status.
- Progress indicator.
- Optional short description.

Possible statuses:
- Pending.
- Processing.
- Completed.
- Failed.

Do not simulate progress as real intelligence analysis.

Connect each status to actual application events.

## Scanner result screen

The result should be detailed, professional and easy to understand.

Include:

### Risk score

A prominent 0–100 risk score.

Use a clear visual indicator.

### Threat classification

Possible results:
- Safe.
- Low Risk.
- Suspicious.
- High Risk.
- Critical Threat.

### Evidence

Display available evidence, such as:
- HTTPS status.
- Domain information.
- Certificate information.
- Threat-intelligence matches.
- DNS information.
- Reputation indicators.

Only display fields supported by the current backend.

### Recommendations

Provide clear, actionable security recommendations based on the scan findings.

### Technical details

Allow users to expand additional technical information.

Avoid showing excessive technical information by default.

Make the results understandable to both technical and non-technical users.

---

# 11. SCAN HISTORY

Create a dedicated scan-history page.

Features:

- List previous scans.
- Search by URL or domain.
- Filter by severity.
- Filter by scan status.
- Sort by date.
- View detailed reports.
- Display risk scores.
- Navigate to previous results.

Maintain the existing data model and backend connections.

Provide a professional empty state when no scan history exists.

---

# 12. THREAT INTELLIGENCE PAGE

Create a dedicated intelligence section if supported by the existing product.

It should provide a structured view of threat information.

Possible content:
- Threat intelligence sources.
- Reputation findings.
- Malware indicators.
- Suspicious domains.
- Threat categories.
- Detection information.

Do not display integrations as active unless they are actually configured and functioning.

Potential future integrations discussed for AVERON AI include:

- VirusTotal.
- URLhaus.
- Google Web Risk.

Do not assume these are already operational.

Keep API credentials and intelligence-service requests on the backend.

Never expose private API keys in frontend code.

---

# 13. MOBILE APPLICATION EXPERIENCE

Mobile is NOT an afterthought.

The application must look like a professional mobile security app.

It should not simply be a desktop website squeezed into a small screen.

## Mobile layout

Use:
- Compact top header.
- Brand mark.
- Profile or notification action.
- Main content area.
- Bottom navigation.
- Responsive cards.
- Properly sized touch targets.

## Mobile navigation icons

Use Lucide React.

Recommended icon mapping:

| Destination | Icon |
|---|---|
| Overview | LayoutDashboard |
| Scanner | ScanSearch |
| History | History |
| Intelligence | Radar |
| Profile | UserRound |

Icons must be:
- Consistent in stroke weight.
- Properly sized.
- Visually balanced.
- Clean and recognisable.
- Accompanied by short labels where space permits.

Avoid emoji icons.

Avoid random icon libraries.

Use one consistent icon family throughout the application.

## Mobile bottom navigation

Create a premium floating bottom navigation bar.

Design:
- Dark translucent surface.
- Subtle border.
- Small controlled reflections.
- Clearly highlighted active item.
- Smooth transitions.
- Consistent spacing.
- Safe-area support for modern phones.

The navigation must not cover important content.

## Mobile scanner

The scanner must be fully usable on small screens.

Requirements:
- Full-width URL input.
- Easy-to-tap scan button.
- No horizontal scrolling.
- Readable scanning stages.
- Compact risk score.
- Stacked result sections.
- Expandable technical details.

## Mobile dashboard

Reorganise dashboard cards into a responsive single-column or two-column grid depending on available width.

Avoid:
- Tiny text.
- Overflowing tables.
- Cut-off charts.
- Overlapping navigation.
- Horizontal scrolling.
- Excessively large cards.

Use horizontally scrollable tables only where absolutely necessary. Prefer responsive row layouts on narrow screens.

---

# 14. ANIMATIONS AND TRANSITIONS

The application must feel smooth and responsive.

Use animations with restraint.

## Recommended transitions

- Navigation transitions.
- Button hover and press states.
- Card hover effects.
- Sidebar collapse.
- Modal opening and closing.
- Dropdown transitions.
- Tab transitions.
- Scan progress transitions.
- Risk indicator transitions.
- Toast notifications.

## Timing

Use approximately:
- Micro-interactions: 120–180ms.
- Normal transitions: 180–250ms.
- Larger transitions: 250–350ms.

Use appropriate easing curves.

## Animation rules

1. Prefer transform and opacity animations.
2. Avoid animating expensive layout properties.
3. Do not animate every card independently.
4. Avoid unnecessary infinite animations.
5. Do not use continuous particles.
6. Avoid multiple simultaneous WebGL animations.
7. Pause animations when elements are off-screen.
8. Respect prefers-reduced-motion.

The application should feel fast, not slow or theatrical.

---

# 15. PERFORMANCE OPTIMISATION

Performance is a major priority.

The redesign must not make AVERON AI laggy.

## Required practices

- Avoid unnecessary React re-renders.
- Use memoisation where beneficial.
- Lazy-load non-essential sections.
- Optimise large charts.
- Clean up event listeners.
- Clean up WebGL resources.
- Avoid duplicate shader instances.
- Avoid unnecessary animation loops.
- Avoid oversized images.
- Avoid excessive dependencies.
- Use code splitting where appropriate.
- Avoid unnecessary state updates.
- Keep transitions lightweight.

## WebGL rules

Liquid effects must:
- Render only where needed.
- Pause when the browser tab is hidden.
- Pause when off-screen.
- Handle WebGL context loss.
- Have graceful fallbacks.
- Avoid blocking application interaction.

Do not compromise scanning functionality for visual effects.

## Performance acceptance

The redesigned application should remain responsive on ordinary laptops and mid-range mobile devices.

Aim for:
- Smooth scrolling.
- No noticeable interaction delay.
- No unnecessary layout shifts.
- No persistent high CPU usage.
- No shader-related memory leaks.

---

# 16. ICONOGRAPHY

Use Lucide React throughout the interface.

Install if not already available:

```bash
npm install lucide-react
```

Suggested icons:

- ShieldCheck
- ShieldAlert
- ShieldX
- ScanSearch
- Radar
- Activity
- LayoutDashboard
- History
- Search
- Bell
- UserRound
- Settings
- Globe
- Lock
- Fingerprint
- CircleCheck
- AlertTriangle
- Info
- ChevronRight
- ExternalLink
- RefreshCw

Use icons with consistent:
- Stroke width.
- Size.
- Alignment.
- Colour.
- Spacing.

Avoid emojis as UI icons.

Do not mix several unrelated icon styles.

---

# 17. LOADING, ERROR AND EMPTY STATES

Every important interface must handle different states professionally.

Create reusable components for:

### Loading
- Skeleton cards.
- Subtle progress indicators.
- Scanner progress.
- Button loading states.

### Error
- Clear error description.
- Appropriate error icon.
- Retry action where applicable.

### Empty
- Relevant icon.
- Short explanation.
- Useful next action.

### Success
- Clear success status.
- Appropriate confirmation.
- No excessive celebratory animation.

Never leave blank sections when data is unavailable.

Never display misleading fake data to fill empty states.

---

# 18. ACCESSIBILITY

Ensure:
- Proper semantic HTML.
- Keyboard-accessible navigation.
- Visible focus states.
- Accessible button labels.
- Sufficient text contrast.
- Proper form labels.
- Screen-reader-friendly status updates.
- Reduced-motion support.
- Touch-friendly controls.

Liquid effects must not interfere with clicking or keyboard interaction.

---

# 19. RESPONSIVE BREAKPOINTS

Support:

- Small mobile: 320–375px.
- Standard mobile: 376–767px.
- Tablet: 768–1023px.
- Desktop: 1024–1439px.
- Large desktop: 1440px and above.

Test layouts at each range.

Do not rely exclusively on CSS scaling.

Use responsive component layouts.

---

# 20. FUNCTIONALITY PRESERVATION

This section is extremely important.

Before changing anything:

1. Inspect the entire existing project.
2. Identify the existing routes.
3. Identify the current scanner components.
4. Identify backend connections.
5. Identify existing API integrations.
6. Identify existing data structures.
7. Identify the current dashboard functionality.
8. Identify existing state-management logic.
9. Identify existing authentication and user flows, if implemented.

Create a clear understanding of what currently works.

Then redesign the frontend around the existing functionality.

DO NOT:
- Replace the scanner with a dummy scanner.
- Remove existing backend logic.
- Break API calls.
- Hardcode dashboard statistics.
- Replace real scan results with mock data.
- Remove working routes.
- Introduce unnecessary architectural changes.
- Delete existing functionality because it is difficult to style.

If something is not implemented yet, create an appropriate UI state without pretending the functionality is operational.

---

# 21. IMPLEMENTATION ORDER

Implement the redesign in manageable stages.

### Phase 1 — Audit
- Inspect the existing codebase.
- Understand existing functionality.
- Identify current dependencies.
- Determine component and style paths.
- Identify responsive problems.

### Phase 2 — Design system
- Establish colour variables.
- Establish typography.
- Create reusable spacing and surface rules.
- Create button variants.
- Create status badges.
- Create consistent icon rules.

### Phase 3 — UI components
- Integrate liquid-metal button.
- Integrate liquid-glass navbar.
- Adapt both to the dark design system.
- Create header.
- Create sidebar.
- Create mobile navigation.
- Create reusable cards and tables.

### Phase 4 — Dashboard
- Redesign statistics.
- Redesign risk distribution.
- Redesign recent scans.
- Redesign threat activity.
- Integrate real data.

### Phase 5 — Scanner
- Redesign URL input.
- Redesign scanning progress.
- Redesign risk score.
- Redesign evidence.
- Redesign recommendations.

### Phase 6 — Remaining pages
- Scan history.
- Threat intelligence.
- Profile.
- Settings, if already supported.

### Phase 7 — Mobile
- Implement responsive navigation.
- Redesign mobile dashboard.
- Optimise mobile scanner.
- Test all breakpoints.

### Phase 8 — Performance and QA
- Check all interactions.
- Check routing.
- Check responsiveness.
- Check WebGL fallback.
- Check loading and error states.
- Check console errors.
- Check API functionality.
- Check performance.

Do not attempt to implement everything in one massive component.

---

# 22. FINAL QUALITY STANDARD

Before considering the redesign complete, verify the following:

## Brand and appearance
- [ ] Consistent AVERON AI branding.
- [ ] Professional dark-only colour palette.
- [ ] Consistent typography.
- [ ] Clean visual hierarchy.
- [ ] Premium liquid-glass elements.
- [ ] No excessive gradients or neon.
- [ ] Consistent iconography.

## Desktop
- [ ] Professional header.
- [ ] Functional sidebar.
- [ ] Premium dashboard.
- [ ] Responsive tables and charts.
- [ ] Polished scanner.
- [ ] Functional navigation.

## Mobile
- [ ] App-like appearance.
- [ ] Clean bottom navigation.
- [ ] Professional icons.
- [ ] Fully functional scanner.
- [ ] No horizontal overflow.
- [ ] Proper touch targets.
- [ ] Responsive results.

## Functionality
- [ ] Existing scanner preserved.
- [ ] Existing backend preserved.
- [ ] Existing API connections preserved.
- [ ] Existing routes preserved.
- [ ] Real data displayed correctly.
- [ ] Error states handled.
- [ ] Loading states handled.

## Performance
- [ ] No unnecessary shader instances.
- [ ] No excessive animation loops.
- [ ] No memory leaks.
- [ ] No unnecessary re-renders.
- [ ] No noticeable lag.
- [ ] Reduced-motion support.
- [ ] WebGL fallbacks work.

---

# 23. FINAL DESIGN INSTRUCTION

Think of AVERON AI as a serious cybersecurity company building a commercial-grade security product.

Every screen should look as though it was designed by a dedicated professional product design team.

The interface should be sophisticated but restrained.

The dashboard should communicate intelligence.

The scanner should communicate precision.

The results should communicate trust.

The brand should communicate security.

The mobile application should feel native and purposeful.

Do not sacrifice usability for aesthetics.

Do not sacrifice performance for animations.

Do not sacrifice existing functionality for a visual redesign.

**The final objective: AVERON AI must look like a real, polished, premium cybersecurity product — not a website generated from a single prompt.**

Build with intention. Refine every component. Maintain consistency across the entire application.
