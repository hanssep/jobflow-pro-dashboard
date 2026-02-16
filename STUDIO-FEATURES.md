# Studio-Only Features: The Competitive Advantage

## How This Works

FlowFuse dashboard ignores unknown properties on config nodes. If a `ui-button` has a `borderRadius` property that FlowFuse doesn't recognize, FlowFuse simply skips it — the button renders with default styling. But in Studio/JobFlow Pro, that same `borderRadius` property drives a visual control.

This means every feature below works the same way:

1. Studio stores the value as an extra property on the existing config node
2. The JobFlow Pro Vue component reads and applies it
3. If the flow is exported to stock FlowFuse, the property is ignored — the widget renders with FlowFuse defaults
4. No errors, no crashes, no broken flows

The flow file stays valid. Community nodes stay compatible. But users who run JobFlow Pro get a dramatically better visual experience.

---

## Category 1: Extended Visual Properties Per Widget

The audit found **150+ missing visual properties** across 22 widgets. FlowFuse hardcodes most of these. Studio can expose every single one.

### 1.1 Universal Style Properties (Apply to All Widgets)

These properties don't exist on any widget in FlowFuse today. Studio adds them as extra properties that the JobFlow Pro runtime reads and applies via inline styles or CSS variables.

| Property | Control Type | What It Does | FlowFuse Fallback |
|---|---|---|---|
| `studioFontFamily` | Font picker | Override font per widget | Uses theme default |
| `studioFontSize` | Slider (8-72px) | Override font size per widget | Uses component default |
| `studioFontWeight` | Select (light/normal/bold) | Override weight per widget | Normal |
| `studioBorderRadius` | Slider (0-32px) | Corner rounding per widget | Component default |
| `studioPadding` | 4-value input (top/right/bottom/left) | Internal spacing | Component default |
| `studioMargin` | 4-value input | External spacing | Component default |
| `studioBorderWidth` | Slider (0-8px) | Border thickness | None |
| `studioBorderColor` | Color picker | Border color | None |
| `studioBorderStyle` | Select (solid/dashed/dotted/none) | Border style | None |
| `studioBoxShadow` | Preset select (none/sm/md/lg/xl) | Drop shadow | None |
| `studioOpacity` | Slider (0-100%) | Transparency | 100% |
| `studioBackgroundColor` | Color picker | Background override | Transparent/theme |
| `studioTextTransform` | Select (none/uppercase/lowercase/capitalize) | Text casing | None |
| `studioLetterSpacing` | Slider (-2 to 8px) | Letter spacing | Normal |
| `studioOverflow` | Select (visible/hidden/scroll/ellipsis) | Content overflow behavior | Visible |
| `studioTransition` | Toggle + duration slider | Animate property changes | None |
| `studioHoverEffect` | Select (none/darken/lighten/scale/glow) | Hover interaction | None |

**Namespace convention:** All Studio-only properties prefixed with `studio` to clearly distinguish them from standard FlowFuse properties and avoid future collisions.

**Implementation:** The JobFlow Pro Vue widget wrapper reads `studio*` properties and applies them as inline styles or CSS custom properties. A single mixin/composable handles this for all widgets:

```javascript
// Pseudocode for the Studio style mixin
const studioStyles = computed(() => {
    const s = {}
    if (props.props.studioFontFamily) s.fontFamily = props.props.studioFontFamily
    if (props.props.studioBorderRadius) s.borderRadius = props.props.studioBorderRadius + 'px'
    if (props.props.studioBoxShadow) s.boxShadow = shadowPresets[props.props.studioBoxShadow]
    // ... etc
    return s
})
```

**This is ~200 lines of code in a single composable that makes every widget dramatically more customizable.**

### 1.2 Widget-Specific Extended Properties

Beyond universals, each widget type gets properties that FlowFuse hardcodes.

**ui-button — 8 new properties:**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioVariant` | Visual chips | Only "flat" (hardcoded) | flat, outlined, text, elevated, tonal, plain |
| `studioSize` | Select | Only one size | x-small, small, default, large, x-large |
| `studioRounded` | Select | No control | pill, rounded, square, 0/sm/lg/xl |
| `studioElevation` | Slider 0-24 | No control | Material elevation levels |
| `studioBlock` | Toggle | No control | Full-width button |
| `studioIconSize` | Slider | Hardcoded 1x/1.1x multiplier | Any size |
| `studioTextAlign` | Select | Hardcoded center | left, center, right |
| `studioRipple` | Toggle | Always on | Enable/disable ripple effect |

**ui-chart — 12 new properties:**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioTitleFontSize` | Slider | eCharts default | 8-32px |
| `studioTitleFontWeight` | Select | eCharts default | light/normal/bold |
| `studioTitleAlign` | Select | Left | left/center/right |
| `studioLegendPosition` | Select | Hardcoded | top/bottom/left/right |
| `studioLegendFontSize` | Slider | eCharts default | 8-20px |
| `studioAxisFontSize` | Slider | eCharts default | 8-16px |
| `studioGridLineStyle` | Select | Solid | solid/dashed/dotted/none |
| `studioGridLineWidth` | Slider | 1px | 0-4px |
| `studioSeriesLineWidth` | Slider | eCharts default | 1-8px |
| `studioBarWidth` | Slider | Auto | 10-80% |
| `studioAnimationDuration` | Slider | eCharts default | 0-2000ms |
| `studioChartBackground` | Color picker | Transparent | Any color |

**ui-gauge — 6 new properties:**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioTitleFontSize` | Slider | Hardcoded | 8-28px |
| `studioValueFontSize` | Slider | Hardcoded | 12-72px |
| `studioValueFontWeight` | Select | Hardcoded | light/normal/bold |
| `studioIconColor` | Color picker | No control | Any color |
| `studioIconSize` | Slider | Hardcoded | 16-64px |
| `studioAnimationSpeed` | Slider | Hardcoded | 0-2000ms |

**ui-table — 10 new properties (addresses top community complaint):**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioHeaderBgColor` | Color picker | Theme default | Any color |
| `studioHeaderTextColor` | Color picker | Theme default | Any color |
| `studioHeaderFontSize` | Slider | Hardcoded | 10-18px |
| `studioRowHeight` | Slider | Hardcoded | 32-64px |
| `studioStripedRows` | Toggle | No | Alternating row colors |
| `studioStripedColor` | Color picker | N/A | Stripe color |
| `studioHoverHighlight` | Toggle + color | No | Row hover effect |
| `studioCellPadding` | Slider | Hardcoded | 4-24px |
| `studioBorderStyle` | Select | Default | none/horizontal/vertical/all |
| `studioTextWrap` | Toggle | Truncates (user complaint) | Wrap text in cells |

**ui-text — 6 new properties:**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioFontStyle` | Toggle | No italic support | normal/italic |
| `studioTextDecoration` | Select | None | none/underline/strikethrough |
| `studioLineHeight` | Slider | Browser default | 1.0-3.0 |
| `studioLabelColor` | Color picker | Same as value color | Separate label color |
| `studioLabelFontSize` | Slider | Same as value | Different label size |
| `studioValueFormat` | Text input | Basic mustache | Number formatting patterns |

**ui-switch — 5 new properties:**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioOnColor` | Color picker | Theme primary only | Custom on color |
| `studioOffColor` | Color picker | Grey only | Custom off color |
| `studioSize` | Select | One size | small/default/large |
| `studioLabelColor` | Color picker | Theme text | Custom label color |
| `studioInset` | Toggle | No | Inset switch style |

**ui-slider — 4 new properties:**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioTrackSize` | Slider | Hardcoded 4px | 2-16px |
| `studioThumbSize` | Slider | Hardcoded | 12-32px |
| `studioTickColor` | Color picker | Theme default | Custom tick color |
| `studioVertical` | Toggle | Horizontal only | Vertical orientation |

**ui-spacer — 3 new properties (currently has ZERO visual properties):**

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioBackgroundColor` | Color picker | Transparent | Any color (decorative dividers) |
| `studioBorderBottom` | Toggle + color | None | Bottom border (horizontal rule) |
| `studioMinHeight` | Slider | Row-based only | Explicit pixel height |

---

## Category 2: Group-Level Visual Enhancements

Groups in FlowFuse have minimal visual configuration. Studio can make them first-class design elements.

### 2.1 Group Card Styling

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioCardVariant` | Select | Default card only | flat, elevated, outlined, tonal |
| `studioCardElevation` | Slider 0-24 | Hardcoded | Material elevation |
| `studioHeaderBgColor` | Color picker | No control | Colored group headers |
| `studioHeaderTextColor` | Color picker | Theme text | Custom header text color |
| `studioHeaderFontSize` | Slider | Hardcoded | 12-24px |
| `studioHeaderIcon` | Icon picker | No icon support | Icon next to group title |
| `studioCollapsible` | Toggle | No (GitHub issue #406) | Click header to collapse/expand |
| `studioCollapsedDefault` | Toggle | N/A | Start collapsed |
| `studioContentPadding` | Slider | Hardcoded | 0-32px |
| `studioGap` | Slider | Theme default | Per-group widget gap |
| `studioBackgroundImage` | URL input | None | Background image/gradient |
| `studioBackgroundOverlay` | Color picker + opacity | N/A | Overlay on background image |
| `studioMinHeight` | Slider | Auto | Minimum group height |

### 2.2 Collapsible Groups (Addresses GitHub Issue #406)

This is one of the most requested features for Dashboard 2.0. FlowFuse doesn't support collapsible groups (accordion behavior) — it's been an open issue since early 2024.

Studio can implement this entirely as a visual enhancement:

- `studioCollapsible: true` adds a chevron to the group header
- Clicking the header toggles visibility of the group content
- `studioCollapsedDefault` controls initial state
- Collapse state persists in the browser (localStorage)
- In FlowFuse, these properties are ignored — group always shows open

**This single feature alone could drive adoption** from users who need accordion-style dashboards for complex IoT/monitoring setups.

### 2.3 Group Layout Modes

FlowFuse groups always use CSS Grid internally. Studio could add alternative internal layouts:

| Mode | Description | Use Case |
|---|---|---|
| `grid` (default) | CSS Grid, same as FlowFuse | Standard dashboard |
| `stack-vertical` | Widgets stack top-to-bottom, full width | Sidebar panels, settings forms |
| `stack-horizontal` | Widgets flow left-to-right, wrap | Tag clouds, button bars |
| `center` | Single widget centered in group | Hero sections, KPI spotlights |

Stored as `studioLayout` on the group. FlowFuse ignores it, defaults to grid.

---

## Category 3: Page-Level Design Features

### 3.1 Page Background & Branding

| Property | Control | FlowFuse Today | Studio Adds |
|---|---|---|---|
| `studioBackgroundImage` | URL/upload | Solid color only | Background image |
| `studioBackgroundSize` | Select | N/A | cover/contain/auto |
| `studioBackgroundPosition` | Select | N/A | center/top/bottom |
| `studioBackgroundOverlay` | Color + opacity | N/A | Overlay for readability |
| `studioBackgroundGradient` | Gradient editor | Solid color only | Linear/radial gradients |
| `studioHeaderHeight` | Slider | Fixed | Custom header height |
| `studioHeaderBgColor` | Color picker | Theme color | Per-page header color |
| `studioLogoUrl` | URL input | None | Logo in header |
| `studioHideNavigation` | Toggle | Always shows | Hide nav for single-page dashboards |
| `studioFullWidth` | Toggle | Max-width container | Full viewport width |

### 3.2 Per-Page Theme Overrides

FlowFuse uses a single theme for the entire dashboard. Studio can allow per-page theme overrides:

- A page can override specific theme tokens (e.g., this page has a dark background while others are light)
- Stored as `studioThemeOverrides: { bgPage: '#1a1a2e', text: '#ffffff' }` on the page node
- FlowFuse ignores it, uses the global theme
- Studio renders the page with the overrides applied

Use case: A monitoring dashboard where the "Alerts" page has a dark/red theme while the "Overview" page is light/blue.

---

## Category 4: Advanced Layout Features

### 4.1 Widget Absolute Positioning Within Groups

FlowFuse forces widgets into CSS Grid cells. Studio could offer a "freeform" mode where widgets can be positioned anywhere within a group using absolute coordinates.

- `studioPosition: 'absolute'` switches a widget from grid-flow to absolute
- `studioX`, `studioY` define position within the group
- Only works in JobFlow Pro — in FlowFuse, the widget falls back to normal grid position
- Useful for: overlaying a status indicator on a map widget, placing a label at a specific position on an image, creating custom HMI-style layouts

### 4.2 Widget Z-Index (Layering)

Currently impossible to overlap widgets. Studio adds `studioZIndex` so widgets can layer:

- A gauge widget overlapping a background image
- A notification badge positioned over a button
- FlowFuse: ignored, widgets render in normal grid order

### 4.3 Conditional Visibility Classes

Studio can pre-define CSS utility classes that hide/show widgets at specific breakpoints:

- `studio-hide-mobile` — hidden below 576px
- `studio-hide-tablet` — hidden between 576-1024px
- `studio-hide-desktop` — hidden above 1024px
- `studio-show-mobile-only` — only visible below 576px

These are applied via the existing `className` property (which FlowFuse already supports). The utility classes are defined in JobFlow Pro's CSS bundle. On FlowFuse, the classes don't exist, so they're ignored — widget shows everywhere.

This gives users responsive show/hide without writing CSS or dynamic expressions.

---

## Category 5: Interaction & Motion

### 5.1 Hover Effects

No FlowFuse widget supports hover styling. Studio adds:

| Effect | Implementation | Use Case |
|---|---|---|
| `studioHoverScale` | CSS transform scale(1.02) | Cards that "lift" on hover |
| `studioHoverShadow` | CSS box-shadow increase | Depth effect |
| `studioHoverBgColor` | Background color change | Button/card hover state |
| `studioHoverTextColor` | Text color change | Link-style text |
| `studioHoverBorderColor` | Border highlight | Input focus indication |

All applied via CSS `:hover` pseudo-class. Zero JavaScript. FlowFuse: no hover effects, static display.

### 5.2 Entry Animations

Widgets appear with animations when the page loads or when data updates:

| Animation | CSS Implementation |
|---|---|
| `fade-in` | opacity 0→1 |
| `slide-up` | translateY(20px)→0 |
| `slide-left` | translateX(20px)→0 |
| `scale-in` | scale(0.95)→1 |
| `none` | No animation (FlowFuse default) |

Stored as `studioEntryAnimation` with `studioAnimationDelay` (for staggered effects).

FlowFuse: no animations, instant render.

### 5.3 Data Update Flash

When a widget receives new data (via Socket.IO msg), briefly flash a visual indicator:

- `studioDataFlash: 'border'` — border briefly highlights
- `studioDataFlash: 'background'` — background pulses
- `studioDataFlash: 'glow'` — outer glow effect
- `studioDataFlashColor` — color of the flash
- `studioDataFlashDuration` — duration in ms (200-1000)

Extremely useful for monitoring dashboards where users need to see which values just updated. FlowFuse: no flash, silent update.

---

## Category 6: Dashboard-Level Features

### 6.1 Dashboard-Wide Style Presets

Studio ships with curated presets that set theme tokens, group styling, and widget defaults in one click:

| Preset | Description | Target User |
|---|---|---|
| **Clean Modern** | White background, subtle shadows, rounded corners, Inter font | General purpose |
| **Dark Ops** | Dark background, neon accents, sharp corners, monospace values | Monitoring/NOC |
| **Industrial HMI** | Grey background, flat groups, high-contrast values, no decoration | Factory/SCADA |
| **Soft Pastel** | Light colored backgrounds, rounded everything, friendly typography | Consumer IoT |
| **Data Dense** | Compact spacing, small fonts, minimal decoration, max information | Analytics |
| **Presentation** | Large fonts, big padding, hero-style groups, clean spacing | Demo/kiosk |

Each preset sets 20-30 properties across theme, groups, and widget defaults. Users can customize after applying.

### 6.2 Custom CSS Editor

For power users who want beyond what the visual controls offer:

- Studio includes a Monaco-based CSS editor panel
- CSS is stored as `studioCustomCSS` on the `ui-base` node
- JobFlow Pro injects it as a `<style>` tag in the dashboard
- FlowFuse: ignored, no custom CSS injected
- Editor provides autocomplete for widget class names (`.nrdb-ui-button`, `.nrdb-ui-group`, etc.)

### 6.3 Favicon and Meta Tags

- `studioFavicon` — Custom favicon URL
- `studioPageTitle` — Browser tab title (currently hardcoded to "Node-RED Dashboard")
- `studioMetaDescription` — Meta description for SEO
- `studioManifestName` — PWA app name

Small touches that make a dashboard feel like a real product, not a Node-RED addon.

---

## Category 7: Addressing Community Pain Points

### 7.1 Text Wrapping in Tables (GitHub Issue #392 Adjacent)

The table widget currently truncates text. Community repeatedly asks for wrapping. Studio's `studioTextWrap: true` on ui-table enables CSS `word-wrap: break-word` on all cells. FlowFuse: truncates as before.

### 7.2 Value Formatting on ui-text (GitHub Issue #390)

Users request flexible value formatting. Studio adds `studioValueFormat` with patterns like:

- `#,##0.00` — Thousand separators with 2 decimals
- `0.0%` — Percentage with 1 decimal
- `$#,##0` — Currency
- `HH:mm:ss` — Time formatting

Applied client-side by the JobFlow Pro Vue component. FlowFuse: shows raw value.

### 7.3 Collapsible Groups (GitHub Issue #406)

Already covered in Category 2. This is significant enough to highlight again — it's one of the most requested features in the FlowFuse repo and has been open since early 2024.

### 7.4 Better ui-template JavaScript Support

Community users migrating from Dashboard 1.0 report that `ui-template` doesn't properly support JavaScript execution. Studio can enhance the template node with:

- `studioAllowScripts: true` — Enable `<script>` tag execution in templates
- A built-in code editor (Monaco) for editing template HTML/CSS/JS within Studio
- Live preview of template rendering on the canvas

FlowFuse: renders template as-is (current behavior).

---

## Category 8: Visual Enhancements for Community Nodes

### 8.1 Studio Styling for Any Community Node

The universal style properties (Category 1.1) apply to ANY `ui-*` widget, including community nodes. A community LED widget, webcam widget, or table widget automatically gets:

- Border radius, shadows, opacity, padding, margin
- Font overrides
- Hover effects
- Entry animations
- Data update flash

Community node authors don't need to do anything. The JobFlow Pro wrapper applies Studio styles around any widget component.

### 8.2 Community Node Showcase

Studio can include a "Community Widgets" section in the widget palette that shows available community nodes for Dashboard 2.0 with one-click install links. This drives discovery and makes the ecosystem feel richer.

---

## Implementation Priority

### Tier 1: Immediate Differentiators (ship first — biggest impact for least effort)

| Feature | Effort | Impact | Why |
|---|---|---|---|
| Universal style properties (1.1) | Medium | Very High | Single composable, works on ALL widgets including community |
| Collapsible groups (2.2) | Low | High | Most-requested feature, simple CSS toggle |
| Hover effects (5.1) | Low | Medium | Pure CSS, feels polished |
| Data update flash (5.3) | Low | High | Monitoring use case killer feature |
| Dashboard style presets (6.1) | Low | High | Instant "wow" factor on first use |

### Tier 2: Strong Differentiators (ship second)

| Feature | Effort | Impact | Why |
|---|---|---|---|
| Button variants & sizes (1.2 button) | Low | High | Currently hardcoded to "flat" — embarrassing limitation |
| Table styling (1.2 table) | Medium | High | Addresses top community complaint |
| Group card styling (2.1) | Medium | High | Makes groups look professional |
| Entry animations (5.2) | Low | Medium | Feels modern |
| Per-page theme overrides (3.2) | Medium | Medium | Multi-purpose dashboards |
| Conditional visibility classes (4.3) | Low | Medium | Easy responsive design |
| Custom CSS editor (6.2) | Medium | Medium | Power user escape hatch |

### Tier 3: Deep Differentiators (ship when ready)

| Feature | Effort | Impact | Why |
|---|---|---|---|
| Chart extended styling (1.2 chart) | Medium | Medium | eCharts config passthrough |
| Gauge extended styling (1.2 gauge) | Medium | Medium | Popular widget |
| Page backgrounds & branding (3.1) | Medium | Medium | White-label dashboards |
| Absolute positioning (4.1) | High | Medium | HMI use cases |
| Z-index layering (4.2) | Medium | Low | Niche |
| Group layout modes (2.3) | Medium | Medium | Alternative layouts |
| Favicon & meta tags (6.3) | Low | Low | Polish |
| Template JS support (7.4) | High | Medium | Migration incentive |

---

## Technical Note: The `studio*` Namespace

All Studio-only properties use the `studio` prefix. This is important for three reasons:

1. **No collision risk** — FlowFuse will never add a property starting with `studio` (it's our namespace)
2. **Easy to identify** — Developers can instantly see which properties are Studio-only
3. **Easy to strip** — If a user wants to export a "clean" flow for FlowFuse, a simple filter removes all `studio*` properties
4. **Runtime detection** — The Vue wrapper checks for `studio*` properties and only applies styling if they exist — zero overhead for standard properties

---

## Competitive Positioning

With these features, the pitch becomes:

> "JobFlow Pro Dashboard is 100% compatible with FlowFuse Dashboard 2.0 and all community nodes. But when you use Studio, you get visual design features that FlowFuse simply doesn't have: collapsible groups, hover effects, button variants, data flash indicators, table text wrapping, chart typography control, entry animations, custom CSS, style presets, and 150+ visual properties that make your dashboard look like a real product instead of a development tool."

If someone exports a JobFlow Pro flow and imports it into stock FlowFuse, everything works — they just lose the visual polish. That's a strong position: **zero lock-in risk, pure upside.**
