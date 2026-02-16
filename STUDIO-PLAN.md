# Studio: Visual Dashboard Design Environment

## Strategic Plan for Development Handoff

**Date:** February 16, 2026
**Status:** Proposal
**Audience:** Development Team

---

## Executive Summary

Studio transforms the JobFlow Pro Dashboard from a "configure in Node-RED, preview in browser" workflow into a unified visual design environment. Users still add dashboard nodes in Node-RED (buttons, charts, gauges, etc.), but once a node exists, **all UX-related work happens in Studio**: positioning, sizing, theming, colors, fonts, text content, spacing, page creation, and layout management.

The core principle: **Node-RED owns behavior. Studio owns appearance.**

---

## The Problem Today

### Current Workflow (7+ steps to build a simple dashboard)

1. Create `ui-base` config node in Node-RED
2. Create `ui-page` config node in Node-RED (configure layout type, path, icon, responsive breakpoints — ~15 properties in a jQuery dialog)
3. Create `ui-theme` config node in Node-RED (manually enter hex colors and pixel spacing values — no live preview)
4. Create `ui-group` config node in Node-RED (set name, width, height, page reference)
5. Create widget nodes in Node-RED (each widget: 10-50+ properties in config dialogs)
6. Deploy the entire flow
7. Open Studio to visually verify and tweak layout

If something looks wrong, go back to step 2-5 and repeat. Every visual change requires a round-trip through Node-RED's config dialogs and a full redeploy.

### What Studio Can Currently Do (limited)

| Capability                         | Available | Notes                              |
| ---------------------------------- | --------- | ---------------------------------- |
| Create/rename/delete pages         | Yes       | Via Studio API                     |
| Drag-reorder groups                | Yes       | WYSIWYG mode                       |
| Drag-reorder widgets within groups | Yes       | WYSIWYG mode                       |
| Resize widgets (width/height)      | Yes       | Drag handles                       |
| Resize groups (width)              | Yes       | Drag handles                       |
| Undo/redo layout changes           | Yes       | Snapshot-based                     |
| Preview at different breakpoints   | Yes       | Zoom + breakpoint selector         |
| **Create groups**                  | **No**    | Must use Node-RED                  |
| **Create/delete widgets**          | **No**    | Must use Node-RED                  |
| **Edit widget visual properties**  | **No**    | Only size, not colors/fonts/labels |
| **Edit theme colors/fonts**        | **No**    | Must use Node-RED                  |
| **Configure page layout type**     | **No**    | Must use Node-RED                  |
| **Edit responsive breakpoints**    | **No**    | Must use Node-RED                  |
| **Multi-select and bulk edit**     | **No**    | Single selection only              |
| **Inline text editing**            | **No**    | No double-click to edit labels     |

### The Root Issue

Studio is currently a **layout arranger**, not a **design environment**. Roughly 90% of visual configuration still requires Node-RED config dialogs.

---

## Vision: What Studio Should Become

### The New Workflow

1. User adds dashboard widget nodes in Node-RED (button, chart, gauge, etc.) — this is the **only** Node-RED step for most users
2. User opens Studio
3. Studio shows all pages with their widgets in a visual canvas
4. User creates new pages, groups, and arranges everything visually
5. User edits all visual properties (colors, fonts, labels, sizes, spacing) in a right-side inspector panel
6. User previews at different breakpoints and adjusts responsive behavior
7. User clicks Save — changes deploy automatically

**Node-RED remains the source of truth for:** data bindings (msg.payload), event wiring, function logic, and flow connections. Studio is the source of truth for everything visual.

---

## Research: Patterns from Best-in-Class Tools

Analysis of Retool, Appsmith, Webflow, Framer, Grafana, Metabase, Figma, and Plasmic reveals consistent patterns that make design tools feel professional and effortless.

### Key Patterns to Adopt

**1. Intent-Driven Grid Layout (from Appsmith)**
Users drag widgets "close enough" and the system snaps them into the correct grid position. No pixel hunting. The grid handles alignment automatically. This is the single biggest UX improvement over manual size/position entry.

**2. Right-Side Inspector Panel (from Retool, Figma)**
A persistent right panel with tabbed sections (Content, Style, Layout) that updates contextually based on what's selected. Every visual property is editable here with immediate canvas preview. Retool's inspector is the gold standard: logically organized tabs, bulk editing support, and expression fields for dynamic values.

**3. Token-Based Theming (from Retool, Webflow)**
Colors and fonts defined as tokens (e.g., `primary`, `surface`, `heading-font`) rather than hardcoded hex values. Change a token, and every widget using it updates instantly. Component-level overrides are allowed but discouraged. This maintains design coherence while allowing customization.

**4. Responsive Preview with Edit (from Framer)**
Toggle between Desktop, Tablet, and Mobile views directly on the canvas. Layout automatically adapts. Users can override specific properties per breakpoint without re-babysitting the entire layout.

**5. Inline Editing (from Webflow, Framer)**
Double-click a text label to edit it directly on the canvas. No modal dialogs for simple text changes.

**6. Context Menus and Keyboard Shortcuts (from Figma)**
Right-click for duplicate, delete, align, distribute. Cmd+Z for undo. Cmd+D for duplicate. Tab to cycle through widgets. These make power users fast.

---

## Architecture Principle: The Property Split

This is the most important architectural decision for Studio. Every widget property falls into one of two categories:

### Studio-Owned Properties (visual/UX)

These properties can be edited in Studio's inspector panel and saved via the Studio API without touching Node-RED flows.

| Category             | Properties                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Position & Size**  | `width`, `height`, `order` (within group), group assignment                                                                                               |
| **Text Content**     | `label`, `title`, `tooltip`, placeholder text, static text content                                                                                        |
| **Colors**           | `color`, `backgroundColor`, `textColor`, `iconColor`, per-widget color overrides                                                                          |
| **Typography**       | `fontSize`, `fontWeight`, `fontFamily` (where supported)                                                                                                  |
| **Spacing**          | widget gap, group padding, group gap, page padding                                                                                                        |
| **Icons**            | `icon`, icon position, icon size                                                                                                                          |
| **Visibility**       | `visible`, `disabled` (static values, not expression-driven)                                                                                              |
| **Appearance**       | `className`, `variant`, `rounded`, `outlined`, `elevated`, density                                                                                        |
| **Group Properties** | `name`, `width`, `height`, `showTitle`, `groupType`, collapse state                                                                                       |
| **Page Properties**  | `name`, `path`, `icon`, `layout` type, `theme` reference, breakpoints                                                                                     |
| **Theme Properties** | All colors (`bgPage`, `text`, `primary`, `groupBg`, `groupOutline`), all sizes (`pagePadding`, `groupGap`, `groupBorderRadius`, `widgetGap`), font family |

### Node-RED-Owned Properties (behavior/data)

These stay in Node-RED config dialogs. Studio does not attempt to edit them.

| Category                | Properties                                                               |
| ----------------------- | ------------------------------------------------------------------------ |
| **Data Binding**        | `msg.payload`, `msg.topic`, input/output wiring                          |
| **Event Handling**      | click actions, change handlers, submit handlers                          |
| **Dynamic Expressions** | `{{msg.payload}}` bindings, dynamic visibility expressions               |
| **Data Sources**        | chart series config, table column definitions, dropdown options from msg |
| **Flow Logic**          | function nodes, change nodes, switch nodes connected to widgets          |
| **Authentication**      | access control, user permissions                                         |

### The Gray Zone (handled case-by-case)

Some properties blur the line. For example, a dropdown's `options` list could be static (Studio-editable) or dynamic (from msg.payload). Studio should handle the static case and show a "Configured in Node-RED" indicator for dynamic values.

---

## Phased Implementation Plan

### Phase 1: Foundation — Page & Group Management in Studio

**Goal:** Eliminate the need to create pages and groups in Node-RED. Users can build the entire dashboard structure visually.

**Duration estimate:** 4-6 weeks

#### 1.1 Page Creation & Configuration in Studio

**Current state:** Studio can create/rename/delete pages but cannot configure layout type, theme, or breakpoints.

**Target state:** Full page management in Studio with visual configuration.

**Work items:**

- **Page creation dialog** — When user clicks "New Page," show a dialog with: page name (text input), URL path (auto-generated from name, editable), icon picker (MDI icon grid/search), layout type selector (Grid / Flex / Tabs / Notebook with visual previews of each), theme selector (dropdown of existing themes)
- **Page settings panel** — Clicking the page settings icon opens an inspector panel showing all page properties. Editable in-place with immediate preview on canvas.
- **Responsive breakpoints editor** — Replace the raw editable-list from Node-RED with a visual breakpoint manager. Show preset options (Mobile 3-col / Tablet 6-col / Desktop 12-col) with a visual column preview. Allow custom breakpoints with a slider for pixel width and column count. Show a minimap preview of how the layout looks at each breakpoint.
- **Page reordering** — Drag pages in the sidebar navigation to reorder. Already partially implemented; ensure it works reliably.

**API changes needed:**

- Extend `ui_studio_api.js` PATCH endpoint for pages to accept: `layout`, `theme`, `icon`, `path`, `breakpoints`, `className`, `visible`, `disabled`
- Currently only handles `name` and `order`

#### 1.2 Group Creation & Management in Studio

**Current state:** Groups can only be created in Node-RED. Studio can reorder and resize them but not create, delete, or configure them.

**Target state:** Full group CRUD in Studio.

**Work items:**

- **"Add Group" button on canvas** — Appears at the bottom of the page canvas (below existing groups) and between groups. Clicking creates a new group with sensible defaults (name: "Group N", width: 6, height: 1).
- **Group creation API** — New endpoint: `POST /dashboard/api/v1/:dashboardId/studio/pages/:pageId/groups` that creates a `ui-group` config node in Node-RED, wired to the correct page.
- **Group settings in inspector** — When a group is selected, the right panel shows: name (editable), width (slider 1-12 with column preview), height (number input or auto), show title toggle, group type (standard / dialog), visibility, disabled state, custom CSS class.
- **Group deletion** — Right-click group → Delete, or select group → press Delete key. Confirmation dialog: "Delete group and move widgets to ungrouped, or delete group and all widgets?"
- **Group duplication** — Right-click group → Duplicate. Creates a new group with the same settings and cloned widgets.

**API changes needed:**

- New POST endpoint for group creation
- Extend PATCH endpoint for groups to accept all visual properties
- DELETE endpoint for groups (already exists, verify it handles widget cleanup)

#### 1.3 Save & Deploy Improvements

**Current state:** Every save triggers a full Node-RED deployment. Users must click "Deploy" and wait.

**Target state:** Faster, more granular saves.

**Work items:**

- **Batch save** — Collect all pending changes (page settings, group settings, widget positions) and submit as a single API call that triggers one deploy.
- **Save indicator** — Show a clear "Unsaved changes" badge in the toolbar. Auto-save draft to localStorage so work isn't lost on accidental navigation.
- **Deploy feedback** — Show a progress indicator during deploy. On success, briefly flash "Saved" confirmation. On failure, show error with option to retry.

---

### Phase 2: Visual Property Editing — The Inspector Panel

**Goal:** Edit all visual widget properties without leaving Studio. This is where Studio becomes a real design tool.

**Duration estimate:** 6-8 weeks

#### 2.1 Inspector Panel Architecture

**Design:** A persistent right-side panel (300-360px wide) with three tabs: **Content**, **Style**, **Layout**.

**Content Tab** — Properties that affect what the widget displays:

- Label / title text (inline-editable text field)
- Tooltip text
- Icon picker (MDI icon search grid)
- Placeholder text (for inputs)
- Static options (for dropdowns, radio groups — editable list)
- Static text content (for ui-text, ui-markdown)

**Style Tab** — Properties that affect how the widget looks:

- Color pickers for: background, text, icon, border (with theme token quick-select)
- Font size (slider or select: Small / Medium / Large / Custom)
- Font weight (Normal / Bold toggle)
- Border radius (slider)
- Variant selector (for buttons: default / outlined / text / elevated / tonal / flat — shown as visual chips)
- Density (comfortable / compact / default)
- Custom CSS class (text input with autocomplete for existing classes)

**Layout Tab** — Properties that affect positioning:

- Width (slider 1-12 columns, or "Auto")
- Height (number input in row spans, or "Auto")
- Order within group (drag handle or number)
- Group assignment (dropdown to move widget between groups)

**Implementation approach:**

- **Widget schema service** — Extend `WidgetSchemaService.js` to categorize every widget property into Content / Style / Layout. Currently it only extracts defaults and skips internal properties. Enhance it to include metadata about each property: type (color, text, number, select, icon, toggle), tab (content, style, layout), and display label.
- **Property controls library** — Build a set of reusable Vue components for the inspector: `ColorPicker.vue` (with theme token swatches), `IconPicker.vue` (MDI grid with search), `SliderInput.vue` (for numeric ranges), `ToggleGroup.vue` (for variant/density selection), `EditableList.vue` (for static options), `TextInput.vue`, `NumberInput.vue`, `SelectInput.vue`.
- **Two-way binding** — When a property changes in the inspector, update the widget in the Vuex store immediately (for live preview) and mark the change as pending. On save, batch-send all property changes to the Studio API.
- **Dynamic vs static indicator** — If a widget property is bound to a dynamic expression (e.g., `{{msg.payload}}`), show a small "dynamic" badge next to it in the inspector. The value is read-only in Studio; user must edit in Node-RED. If the value is static, it's fully editable in Studio.

**API changes needed:**

- New endpoint or extend existing: `PATCH /dashboard/api/v1/:dashboardId/studio/widgets/:widgetId` that accepts any visual property update
- The backend must update the corresponding Node-RED config node's properties and trigger redeploy

#### 2.2 Widget-Specific Property Panels

Each widget type needs a tailored inspector layout. The schema service should provide this. Examples:

**ui-button:**

- Content: label, icon, icon position (left/right), tooltip
- Style: button color, text color, icon color, variant (default/outlined/text/elevated/tonal/flat), rounded toggle, size (small/default/large)
- Layout: width, height

**ui-chart:**

- Content: chart type (line/bar/scatter), chart title, axis labels, show legend toggle
- Style: colors (line colors, fill colors), chart background, grid line color
- Layout: width, height

**ui-gauge:**

- Content: title, min, max, segments (color ranges), unit label
- Style: gauge colors per segment, text color, background
- Layout: width, height

**ui-text:**

- Content: text content (rich text editor or markdown), font family, font size
- Style: text color, background color, alignment, padding
- Layout: width, height

**ui-slider:**

- Content: label, min, max, step, show ticks toggle, show value toggle
- Style: color, track color, thumb color
- Layout: width, height

**ui-switch:**

- Content: label, on label, off label, on icon, off icon
- Style: on color, off color, text color
- Layout: width, height

**ui-dropdown:**

- Content: label, options (static list editor), placeholder, allow multiple toggle
- Style: color, text color, chip color (if multi-select)
- Layout: width, height

For each widget type, create a JSON schema mapping that defines which properties go in which tab, what control type to use, and valid value ranges. Store these schemas alongside the widget definitions so community nodes can provide their own Studio schemas.

#### 2.3 Inline Text Editing

**Target:** Double-click any text-bearing widget on the canvas to edit its label/content directly.

**Supported widgets:** ui-button (label), ui-text (content), ui-markdown (content), group titles, page titles.

**Implementation:** On double-click, replace the rendered text with a contenteditable span or text input. On blur or Enter, save the value. On Escape, revert. Show a subtle text cursor and highlight to indicate edit mode.

#### 2.4 Multi-Select and Bulk Edit

**Target:** Select multiple widgets (Shift+click or drag-select) and edit shared properties in the inspector.

**Implementation:**

- When multiple widgets are selected, the inspector shows only properties that are **common** across all selected widgets.
- Mixed values show as "Mixed" placeholder. Changing a value applies to all selected.
- Bulk operations in context menu: Delete all, Align (left/center/right/top/bottom), Distribute (horizontal/vertical), Set same width, Set same height.

---

### Phase 3: Visual Theme Editor

**Goal:** Design and preview themes entirely within Studio. No hex codes in Node-RED config dialogs.

**Duration estimate:** 3-4 weeks

#### 3.1 Theme Editor Panel

**Access:** New "Theme" tab in Studio sidebar, or a dedicated "Edit Theme" button in the toolbar.

**Interface:**

- **Color palette section** — Shows all theme colors as swatches: page background, text color, primary, secondary, group background, group outline, surface, accent, success, warning, error, info. Each swatch is a click-to-open color picker. Changing a color immediately updates the entire canvas preview.
- **Typography section** — Font family selector (dropdown with preview of each font), base font size (slider), heading scale (preset: Default / Compact / Large).
- **Spacing section** — Page padding (slider with pixel value), group gap (slider), widget gap (slider), group border radius (slider with corner preview).
- **Presets** — One-click presets: "Light Modern", "Dark Mode", "Minimal", "Corporate". Each preset sets all colors, fonts, and spacing at once. Users can customize after applying a preset.
- **Dark mode toggle** — Generate a dark variant of the current theme automatically (invert backgrounds, adjust text contrast, keep accent colors). Allow per-color overrides.

**API changes:**

- `PATCH /dashboard/api/v1/:dashboardId/studio/themes/:themeId` — update any theme property
- `POST /dashboard/api/v1/:dashboardId/studio/themes` — create new theme
- Theme changes must update the `ui-theme` config node in Node-RED and trigger a redeploy

#### 3.2 Live Theme Preview

When a theme color or spacing value changes, update the Vuex store immediately so all widgets on the canvas re-render with the new values. The save/deploy only happens when the user explicitly saves.

#### 3.3 Per-Widget Theme Overrides

In the Style tab of the widget inspector, show theme token values as defaults. A "Custom" toggle next to each color/font property allows the user to override the theme for that specific widget. Overridden properties show a small indicator (dot or icon) so users know which widgets deviate from the theme.

---

### Phase 4: Advanced Design Features

**Goal:** Polish and power-user features that make Studio competitive with commercial dashboard builders.

**Duration estimate:** 4-6 weeks

#### 4.1 Spacer Widget Creation from Studio

**Current state:** Users must add `ui-spacer` nodes in Node-RED to create empty space.

**Target:** Right-click between widgets → "Add Spacer" creates a spacer widget visually. Also support dragging a "Spacer" item from a minimal palette in Studio.

**Implementation:** Studio API creates a `ui-spacer` node in the Node-RED flow, assigned to the correct group, at the correct order position.

#### 4.2 Widget Palette in Studio

A collapsible left panel showing available widget types that the user has already added to Node-RED. This is NOT about creating new widget nodes (that stays in Node-RED), but about visibility: "You have 3 unassigned widgets — drag them into a group."

Additionally, show a small set of "structure widgets" that Studio can create directly without Node-RED: **Spacer**, **Text Block** (static ui-text), **Divider** (horizontal rule spacer), **Image** (static image display). These are simple enough that no Node-RED wiring is needed.

#### 4.3 Responsive Editing Per Breakpoint

**Current state:** Studio can preview at different breakpoints but cannot edit layout per breakpoint.

**Target:** When viewing at a specific breakpoint (e.g., Tablet), allow users to adjust widget width and group width for that breakpoint specifically.

**Implementation:**

- Store per-breakpoint overrides in widget/group properties (e.g., `widthTablet`, `widthMobile`)
- In the Layout tab of the inspector, show the current breakpoint's value with an option to "Customize for this breakpoint"
- Falls back to default if no override is set
- This requires schema changes in widget and group config nodes to support per-breakpoint properties

#### 4.4 Keyboard Shortcuts

| Shortcut               | Action                                   |
| ---------------------- | ---------------------------------------- |
| `Cmd/Ctrl + S`         | Save all changes                         |
| `Cmd/Ctrl + Z`         | Undo                                     |
| `Cmd/Ctrl + Shift + Z` | Redo                                     |
| `Delete / Backspace`   | Delete selected widget/group             |
| `Cmd/Ctrl + D`         | Duplicate selected                       |
| `Cmd/Ctrl + A`         | Select all widgets on page               |
| `Tab`                  | Cycle selection to next widget           |
| `Shift + Tab`          | Cycle selection to previous widget       |
| `Arrow keys`           | Nudge selected widget position (reorder) |
| `Escape`               | Deselect / exit edit mode                |
| `Double-click`         | Inline edit text content                 |

#### 4.5 Context Menus

Right-click on a **widget**: Duplicate, Delete, Move to Group → (submenu of groups), Bring to Front, Send to Back, Copy Style, Paste Style, Edit in Node-RED (opens Node-RED editor for this node).

Right-click on a **group**: Rename, Duplicate (with widgets), Delete, Add Spacer, Collapse/Expand, Change Width → (quick-select 3/4/6/9/12 columns).

Right-click on **canvas** (empty area): Add Group, Paste Widget, Toggle Grid Overlay, Zoom to Fit.

#### 4.6 Copy/Paste Style

Select a widget → Cmd+Shift+C copies its style properties (colors, font, variant, density). Select another widget → Cmd+Shift+V applies those styles. Works across widget types where properties are compatible (e.g., color applies to both buttons and text widgets).

#### 4.7 Alignment and Distribution Tools

When multiple widgets are selected within the same group, show alignment buttons in the toolbar: Align Left, Align Center, Align Right, Distribute Evenly, Match Width, Match Height.

---

### Phase 5: Community Node Compatibility

**Goal:** Ensure third-party dashboard nodes work seamlessly in Studio.

**Duration estimate:** 2-3 weeks

#### 5.1 Generic Property Inspector

For community nodes that don't provide a Studio schema, auto-generate an inspector panel from the node's `defaults` object. Map property types to appropriate controls:

| Node Default Type  | Inspector Control                  |
| ------------------ | ---------------------------------- |
| String             | Text input                         |
| Number             | Number input with optional min/max |
| Boolean            | Toggle switch                      |
| Color string (hex) | Color picker                       |
| Array              | Editable list                      |
| Object             | JSON editor (for advanced users)   |
| Unknown            | Raw text input                     |

This ensures every community node gets at least a basic property panel in Studio, even without explicit Studio support.

#### 5.2 Studio Schema Extension Point

Define a convention for community node authors to provide Studio metadata:

```javascript
// In the node's .js file or a companion studio-schema.json
module.exports.studioSchema = {
    tabs: {
        content: ['label', 'options', 'placeholder'],
        style: ['color', 'textColor', 'backgroundColor'],
        layout: ['width', 'height']
    },
    properties: {
        label: { type: 'text', label: 'Button Label' },
        color: { type: 'color', label: 'Background Color', themeToken: 'primary' },
        options: { type: 'list', label: 'Options', itemType: 'text' }
    }
}
```

Document this convention and provide a template for node authors. Nodes without a Studio schema fall back to the generic inspector (5.1).

---

## Technical Architecture

### API Layer Extension

All Studio operations go through the Studio API (`ui_studio_api.js`), which translates visual changes into Node-RED config node updates.

**Current endpoints:**

```
POST   /studio/pages              → create page
PATCH  /studio/pages/:id          → update page (name, order only)
DELETE /studio/pages/:id          → delete page
PATCH  /studio/pages/:id/groups/:gid → update group (limited)
DELETE /studio/pages/:id/groups/:gid → delete group
PATCH  /studio/:id/reorder        → reorder pages
```

**New/extended endpoints needed:**

```
POST   /studio/pages/:id/groups           → create group
PATCH  /studio/groups/:id                 → update group (all visual props)
PATCH  /studio/widgets/:id                → update widget (all visual props)
POST   /studio/widgets                    → create structure widget (spacer, text)
DELETE /studio/widgets/:id                → delete widget
PATCH  /studio/themes/:id                 → update theme
POST   /studio/themes                     → create theme
POST   /studio/batch                      → batch update (multiple changes in one deploy)
GET    /studio/widget-schemas             → get Studio schemas for all registered widget types
```

### State Management

The Vuex store already has the right modular structure. Key changes:

- **`store/wysiwyg.mjs`** — Extend dirty tracking to cover all property changes, not just position/size.
- **`store/designer.mjs`** — Extend selection model to support multi-select. Add clipboard state for copy/paste style.
- **`store/studio.mjs`** — Add theme editing state, inspector panel state, and active tab tracking.
- **New: `store/inspector.mjs`** — Dedicated module for the property inspector: current selection, active tab, pending changes, validation state.

### Widget Schema Service

Extend `WidgetSchemaService.js` to:

1. Load Studio schemas from widget definitions (new `studioSchema` property)
2. Auto-generate schemas from `defaults` for widgets without explicit Studio support
3. Categorize properties into Content / Style / Layout tabs
4. Provide validation rules (min/max for numbers, regex for colors, allowed values for selects)
5. Indicate which properties are currently bound to dynamic expressions (read-only in Studio)

---

## Priority Matrix

| Feature                                            | User Impact | Dev Effort | Priority         |
| -------------------------------------------------- | ----------- | ---------- | ---------------- |
| Page config in Studio (layout, breakpoints, theme) | High        | Medium     | **P0 — Phase 1** |
| Group CRUD in Studio                               | High        | Medium     | **P0 — Phase 1** |
| Inspector panel with Content/Style/Layout tabs     | Very High   | High       | **P0 — Phase 2** |
| Color pickers with theme tokens                    | High        | Medium     | **P0 — Phase 2** |
| Inline text editing (double-click labels)          | High        | Low        | **P1 — Phase 2** |
| Visual theme editor                                | High        | Medium     | **P1 — Phase 3** |
| Theme presets (Light/Dark/Minimal)                 | Medium      | Low        | **P1 — Phase 3** |
| Multi-select and bulk edit                         | Medium      | Medium     | **P2 — Phase 4** |
| Keyboard shortcuts                                 | Medium      | Low        | **P2 — Phase 4** |
| Context menus                                      | Medium      | Low        | **P2 — Phase 4** |
| Spacer/Text creation from Studio                   | Medium      | Low        | **P2 — Phase 4** |
| Copy/paste style                                   | Medium      | Low        | **P2 — Phase 4** |
| Responsive editing per breakpoint                  | Medium      | High       | **P2 — Phase 4** |
| Generic inspector for community nodes              | Medium      | Medium     | **P2 — Phase 5** |
| Studio schema extension point                      | Medium      | Low        | **P2 — Phase 5** |
| Alignment/distribution tools                       | Low         | Low        | **P3 — Phase 4** |
| Widget palette in Studio                           | Low         | Medium     | **P3 — Phase 4** |

---

## Success Criteria

**Phase 1 complete when:** A user can create a new dashboard page with groups entirely from Studio, without opening any Node-RED config dialog for structural setup.

**Phase 2 complete when:** A user can change a button's label, color, and size from Studio's inspector panel, see the change immediately on canvas, and save it — without touching Node-RED.

**Phase 3 complete when:** A user can apply a dark theme to their entire dashboard from Studio's theme editor, see it preview live, and save it.

**Phase 4 complete when:** A power user can build and style a complete dashboard layout in Studio using keyboard shortcuts, context menus, multi-select, and copy/paste style — with the same speed as using tools like Retool or Appsmith.

**Overall success:** The number of times a user must open a Node-RED config dialog for visual/UX work drops from "every change" to "only for data bindings and event logic."

---

## Compatibility with Community Nodes and FlowFuse Flow Imports

### What Works Today (and the Plan Preserves)

The fork maintains the core FlowFuse dashboard contract: widgets register with groups, groups belong to pages, pages belong to a base node. The `register()` method in `ui_base.js` passes through all widget properties unchanged. Community dashboard nodes that follow the standard `ui-*` pattern will continue to work: they render on the canvas, are draggable/resizable in WYSIWYG mode, and their custom properties are preserved during save/deploy.

The Studio plan only modifies **standard node properties** (width, height, order, label, color, className, etc.) through the existing Node-RED admin API. It does not introduce a custom storage layer or modify the widget registration contract.

### Known Compatibility Gaps (Pre-existing in Fork)

The fork already adds two custom properties that stock FlowFuse does not recognize:

| Property      | Node Type | Purpose                                          | Export to FlowFuse                         | Import from FlowFuse                   |
| ------------- | --------- | ------------------------------------------------ | ------------------------------------------ | -------------------------------------- |
| `breakpoints` | ui-page   | Responsive grid column config per viewport width | Safe — FlowFuse ignores unknown properties | Missing — pages lack responsive config |
| `groupType`   | ui-group  | Supports `'dialog'` groups (modal overlays)      | Safe — FlowFuse ignores it                 | Missing — no dialog groups             |

### Required: Flow Import Migration

When Studio detects an imported flow (or a page without `breakpoints`), it must auto-populate defaults so the full Studio experience works immediately. Add this to Phase 1:

**Import migration handler** — In the Studio API or the frontend store initialization, detect pages where `breakpoints` is `undefined` or empty and inject the standard defaults:

```javascript
if (!page.breakpoints || page.breakpoints.length === 0) {
    page.breakpoints = [
        { name: 'Default', px: 0, cols: 3 },
        { name: 'Tablet', px: 576, cols: 6 },
        { name: 'Small Desktop', px: 768, cols: 9 },
        { name: 'Desktop', px: 1024, cols: 12 }
    ]
}
```

This should happen transparently on first load, not requiring user action. The defaults match what Studio already uses for new pages.

### Community Node Inspector Support

The designer already auto-discovers installed `ui-*` nodes (see `ui_designer_api.js` lines 437-464) and provides a default schema with basic layout properties (width, height, order, className). Phase 5 of the plan extends this with a generic property inspector and a schema convention for community node authors.

**Key guarantee:** Studio will never strip or overwrite properties it doesn't understand. The save mechanism in `ui_base.js` explicitly preserves all properties except Node-RED internals (`id`, `type`, `z`, `wires`, `d`, `g`, `_users`). Community node custom properties survive all Studio operations.

### Export Compatibility

Flows created in Studio can be exported and imported into stock FlowFuse dashboard. FlowFuse ignores unknown properties (`breakpoints`, `groupType`), and the core structure (pages, groups, widgets, wires) is identical. Users lose Studio-specific features (responsive breakpoints, dialog groups) but the dashboard functions normally.

---

## Risks and Mitigations

**Risk: Breaking compatibility with upstream FlowFuse**
Studio API changes modify Node-RED config nodes. If the modifications use non-standard properties, syncing with upstream FlowFuse updates becomes harder.
*Mitigation:* Store Studio-specific metadata in existing node properties where possible (colors, labels, sizes are already standard properties). Avoid adding custom fields that upstream won't recognize. Use the same JSON structure FlowFuse uses.

**Risk: Community nodes with non-standard property structures**
Some community dashboard nodes may have unusual config schemas that the generic inspector can't handle well.
*Mitigation:* The generic inspector is a fallback, not the ideal. Document the Studio schema convention early so community authors can opt in. Most community nodes follow the same patterns as built-in widgets.

**Risk: Performance with large dashboards**
Dashboards with 100+ widgets may make the inspector slow if every property change triggers a full Vuex store update and canvas re-render.
*Mitigation:* Debounce property changes in the inspector (50-100ms). Use CSS variable updates for color/spacing changes instead of full component re-renders. Batch save to avoid per-property API calls.

**Risk: Save/deploy latency**
The current save mechanism triggers a full Node-RED deploy, which can take 2-5 seconds on large flows.
*Mitigation:* Implement optimistic UI updates (show changes immediately, deploy in background). Add a batch API endpoint that collects all changes into a single deploy. Explore partial deploy if Node-RED supports it.

---

## Appendix: Current Codebase Reference

### Key Files to Modify

| File                                              | Current Purpose       | Changes Needed                                                         |
| ------------------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `nodes/config/ui_studio_api.js`                   | Studio CRUD endpoints | Add group CRUD, widget property updates, theme updates, batch endpoint |
| `ui/src/studio/StudioView.vue`                    | Main Studio interface | Add inspector panel mounting, group creation UI, theme editor          |
| `ui/src/studio/StudioCanvas.vue`                  | Preview canvas        | Add inline editing, multi-select, drag-drop from palette               |
| `ui/src/store/wysiwyg.mjs`                        | Edit mode state       | Extend dirty tracking for all property types                           |
| `ui/src/store/designer.mjs`                       | Designer state        | Add multi-select, clipboard, inspector state                           |
| `ui/src/designer/properties/`                     | Property editor       | Rebuild as tabbed inspector with per-widget schemas                    |
| `ui/src/designer/services/WidgetSchemaService.js` | Widget metadata       | Add Studio schema loading, property categorization                     |
| `ui/src/layouts/wysiwyg/`                         | Edit mode system      | Add inline text editing, context menus                                 |

### New Files to Create

| File                                          | Purpose                                                     |
| --------------------------------------------- | ----------------------------------------------------------- |
| `ui/src/studio/InspectorPanel.vue`            | Main inspector panel component                              |
| `ui/src/studio/inspector/ContentTab.vue`      | Content properties tab                                      |
| `ui/src/studio/inspector/StyleTab.vue`        | Style properties tab                                        |
| `ui/src/studio/inspector/LayoutTab.vue`       | Layout properties tab                                       |
| `ui/src/studio/inspector/controls/`           | Reusable inspector controls (ColorPicker, IconPicker, etc.) |
| `ui/src/studio/ThemeEditor.vue`               | Visual theme editor panel                                   |
| `ui/src/studio/GroupCreator.vue`              | Group creation dialog/inline UI                             |
| `ui/src/store/inspector.mjs`                  | Inspector Vuex module                                       |
| `ui/src/studio/composables/useInspector.js`   | Inspector composable                                        |
| `ui/src/studio/composables/useThemeEditor.js` | Theme editor composable                                     |
| `ui/src/studio/schemas/`                      | Per-widget Studio schemas                                   |
