# JobFlow Pro Dashboard - Widget Visual Properties Audit

## Executive Summary

This document provides a comprehensive audit of all dashboard widgets and config nodes to identify:
1. **Current visual/appearance properties** they support
2. **Missing visual properties** that a design tool should offer for better WYSIWYG editing
3. **Hardcoded styling** in Vue components that should be configurable

This audit was conducted by examining:
- HTML files in `nodes/widgets/` (Node-RED editor configuration)
- HTML files in `nodes/config/` (configuration nodes)
- Vue components in `ui/src/widgets/` (runtime rendering)

---

## WIDGET NODES

### 1. **ui-button**

**File Locations:**
- HTML: `nodes/widgets/ui_button.html`
- Vue: `ui/src/widgets/ui-button/UIButton.vue`

**Current Visual Properties:**
- `label` - Button text
- `icon` - MDI icon name
- `iconPosition` - 'left' or 'right'
- `buttonColor` - Button background color
- `textColor` - Label text color
- `iconColor` - Icon color
- `className` - CSS classes
- `width`, `height` - Element dimensions

**Missing Visual Properties:**
- Border radius (rounded corners)
- Padding (internal spacing)
- Border (style, color, width)
- Font size (label)
- Font family, weight
- Text alignment (hardcoded to center)
- Button variant/style (only "flat" supported)
- Hover effects
- Shadow/elevation
- Disabled state styling
- Min/Max width control
- Icon sizing control
- Opacity/transparency

**Hardcoded Styling in Vue:**
- Line 3: Only `variant="flat"` is available
- Lines 160-166: Icon size multipliers hardcoded (1x for normal, 1.1x for icon-only)

---

### 2. **ui-button-group**

**File Locations:**
- HTML: `nodes/widgets/ui_button_group.html`
- Vue: `ui/src/widgets/ui-button-group/UIButtonGroup.vue`

**Current Visual Properties:**
- `label` - Group label
- `rounded` - Boolean border-radius toggle
- `useThemeColors` - Use theme vs custom colors
- `options[].color` - Custom color per button
- `options[].icon` - Icon per button
- `options[].label` - Label per button
- `className` - CSS classes

**Missing Visual Properties:**
- Button appearance control (variant, shadow, etc.)
- Gap/margin between buttons
- Font properties (size, weight, family)
- Hover/active state colors
- Button padding/height control
- Icon sizing control
- Border style control
- Layout orientation (row/column)
- Text alignment
- Disabled state styling

---

### 3. **ui-text**

**File Locations:**
- HTML: `nodes/widgets/ui_text.html`
- Vue: `ui/src/widgets/ui-text/UIText.vue`

**Current Visual Properties:**
- `label` - Display label
- `format` - Display format (mustache template)
- `layout` - 'row-left', 'row-center', 'row-right', 'row-spread', 'col-center'
- `style` - Boolean to enable styling
- `font` - Font family (predefined: Arial, Georgia, Courier, etc.)
- `fontSize` - Font size (1-100px)
- `color` - Text color
- `wrapText` - Boolean text wrapping
- `className` - CSS classes

**Missing Visual Properties:**
- Font weight (bold, normal, light)
- Font style (italic)
- Letter spacing
- Line height
- Text decoration (underline, strikethrough)
- Text transform (uppercase, lowercase)
- Text shadow
- Text alignment (separate from layout)
- Opacity
- Background color
- Padding/Margin
- Border styling
- Label styling (separate from value)
- Max width/text truncation
- Word break control

**Hardcoded Styling:**
- Font list hardcoded (lines 3-71)
- Only 5 layout options available
- Test text styling via inline JavaScript CSS

---

### 4. **ui-text-input**

**File Locations:**
- HTML: `nodes/widgets/ui_text_input.html`
- Vue: `ui/src/widgets/ui-text-input/UITextInput.vue`

**Current Visual Properties:**
- `label` - Input label
- `placeholder` - Placeholder text
- `clearable` - Show clear button
- `disabled` - Disable input
- `className` - CSS classes

**Missing Visual Properties:**
- Font properties (size, family, weight)
- Input height control
- Border style control
- Border radius
- Background color
- Text color
- Placeholder color
- Focus state styling
- Error state styling
- Label positioning
- Label styling (separate)
- Padding/Margin
- Icon support (prepend/append)

---

### 5. **ui-number-input**

**File Locations:**
- HTML: `nodes/widgets/ui_number_input.html`

**Current Visual Properties:**
- `label` - Input label
- `min`, `max` - Value range
- `step` - Step increment
- `unit` - Unit text
- `className` - CSS classes

**Missing Visual Properties:**
- All same as ui-text-input, plus:
- Number format control (thousand separators, decimals)
- Increment/decrement button styling
- Unit text styling

---

### 6. **ui-chart**

**File Locations:**
- HTML: `nodes/widgets/ui_chart.html`
- Vue: `ui/src/widgets/ui-chart/UIChart.vue`

**Current Visual Properties:**
- `label` - Chart title
- `chartType` - 'line', 'bar', 'pie', 'doughnut', 'histogram', etc.
- `colors` - Series colors array
- `textColor` - Axis label color
- `gridColor` - Grid line color
- `showLegend` - Show/hide legend
- `xAxisLabel`, `yAxisLabel` - Axis labels
- `pointShape` - Point style
- `pointRadius` - Point size (4px default)
- `interpolation` - 'linear', 'smooth', 'step'
- `stackSeries` - Stack data
- `className` - CSS classes

**Missing Visual Properties:**
- Title font (size, weight, color, family)
- Legend positioning (top/bottom/left/right)
- Legend font control
- Axis font control
- Axis line styling
- Grid line styling (width, dash pattern)
- Background color
- Border/padding around chart
- Tooltip styling
- Series line width control
- Bar width control
- Animation control
- Responsive sizing/aspect ratio
- Click/highlight colors

**Hardcoded Styling:**
- Default colors array (9 colors hardcoded)
- eCharts manages all visual rendering
- Title font/size via eCharts defaults

---

### 7. **ui-gauge**

**File Locations:**
- HTML: `nodes/widgets/ui_gauge.html`
- Vue: `ui/src/widgets/ui-gauge/UIGauge.vue`

**Current Visual Properties:**
- `gtype` - 'gauge-half', 'gauge-donut', 'gauge-tile', 'gauge-battery'
- `title` - Gauge title
- `alwaysShowTitle` - Boolean
- `units` - Units label
- `icon` - Display icon
- `prefix`, `suffix` - Value prefix/suffix
- `min`, `max` - Value range
- `segments` - Segments array with colors
- `sizeThickness` - Gauge thickness (16 default)
- `sizeGap` - Gap size (4 default)
- `sizeKeyThickness` - Key thickness (8 default)
- `styleRounded` - Rounded corners
- `styleGlow` - Glow effect
- `className` - CSS classes
- `floatingTitlePosition` - Title position

**Missing Visual Properties:**
- Title font (size, weight, color, family)
- Value font control
- Units font control
- Segment color preview during config
- Segment count dynamic control
- Icon sizing control
- Icon color control
- Background color
- Border styling
- Animation speed
- Needle color (for needle style)
- Label positioning
- Padding/margin

---

### 8. **ui-slider**

**File Locations:**
- HTML: `nodes/widgets/ui_slider.html`
- Vue: `ui/src/widgets/ui-slider/UISlider.vue`

**Current Visual Properties:**
- `label` - Slider label
- `min`, `max` - Value range
- `step` - Step increment
- `thumbLabel` - Show value label
- `showTicks` - 'always', 'hover', 'never'
- `color` - Track/thumb color
- `colorTrack` - Track specific color
- `colorThumb` - Thumb specific color
- `iconPrepend`, `iconAppend` - Icons before/after
- `showTextField` - Show numeric input
- `className` - CSS classes

**Missing Visual Properties:**
- Label font control
- Tick styling (color, size, spacing)
- Track height control (hardcoded to 4px, line 12)
- Thumb size control (hardcoded, line 12)
- Text field styling
- Padding/margin
- Icon sizing control
- Vertical slider appearance
- Disabled state styling
- Range mode support
- Animation control

**Hardcoded Styling (Vue):**
- `:tick-size="4" :track-size="4"` (line 12)
- CSS variables for some control via `--nrdb-slider-track-color`, etc.

---

### 9. **ui-switch**

**File Locations:**
- HTML: `nodes/widgets/ui_switch.html`

**Current Visual Properties:**
- `label` - Switch label
- `layout` - 'row-spread', 'row-center', 'row-left', 'col-center'
- `clickableArea` - 'switch' or 'full'
- `style` - Custom style string
- `className` - CSS classes
- `onvalue`, `offvalue` - State values

**Missing Visual Properties:**
- Font properties
- Label color
- Switch size (height/width)
- On/off state colors
- Border styling
- Padding/margin
- Text alignment
- Disabled appearance
- Hover effects
- Animation speed

---

### 10. **ui-dropdown**

**File Locations:**
- HTML: `nodes/widgets/ui_dropdown.html`

**Current Visual Properties:**
- `label` - Dropdown label
- `multiple` - Allow multiple selections
- `chips` - Show as chips
- `clearable` - Show clear button
- `options` - Options array
- `typeIsComboBox` - Enable filtering
- `className` - CSS classes

**Missing Visual Properties:**
- Font properties
- Label styling
- Option appearance
- Dropdown menu styling (bg, border, shadow)
- Selected item styling
- Chip styling
- Placeholder color
- Disabled state
- Focus state
- Max height for dropdown
- Icon per option support
- Option grouping

---

### 11. **ui-radio-group**

**File Locations:**
- HTML: `nodes/widgets/ui_radio_group.html`

**Current Visual Properties:**
- `label` - Group label
- `columns` - Column layout
- `options` - Radio options array
- `className` - CSS classes

**Missing Visual Properties:**
- Font properties
- Option styling
- Radio button color
- Label color
- Border styling
- Option spacing
- Selected state styling
- Disabled state
- Hover effects

---

### 12. **ui-table**

**File Locations:**
- HTML: `nodes/widgets/ui_table.html`

**Current Visual Properties:**
- `label` - Table title
- `showSearch` - Show search box
- `deselect` - Allow deselection
- `selectionType` - 'none', 'single', 'multi'
- `autocols` - Auto-detect columns
- `columns` - Custom columns definition
- `className` - CSS classes
- `maxrows` - Max rows display

**Missing Visual Properties:**
- Header styling (font, color, background)
- Row styling (color, hover, border)
- Cell styling (padding, color, background)
- Alternating row colors
- Font properties
- Table border control
- Column width control
- Text alignment per column
- Pagination styling
- Selection styling
- Sort indicator styling

---

### 13. **ui-form**

**File Locations:**
- HTML: `nodes/widgets/ui_form.html`

**Current Visual Properties:**
- `label` - Form title
- `options` - Form fields array
- `submit` - Submit button text
- `cancel` - Cancel button text
- `className` - CSS classes

**Missing Visual Properties:**
- Field label styling
- Input field styling
- Required indicator styling
- Button styling
- Form layout control
- Field spacing
- Error message styling
- Font properties
- Background color
- Border styling

---

### 14. **ui-markdown**

**File Locations:**
- HTML: `nodes/widgets/ui_markdown.html`

**Current Visual Properties:**
- `content` - Markdown content
- `className` - CSS classes

**Missing Visual Properties:**
- Font properties
- Text color
- Background color
- Link color
- Code block styling
- Heading styling
- List styling
- Padding/margin
- Border styling

---

### 15. **ui-template**

**File Locations:**
- HTML: `nodes/widgets/ui_template.html`

**Current Visual Properties:**
- `templateScope` - Scope level
- `template` - Custom HTML/Vue template
- `className` - CSS classes

**Note:** Custom content widget; styling is user-defined.

---

### 16. **ui-notification**

**File Locations:**
- HTML: `nodes/widgets/ui_notification.html`

**Current Visual Properties:**
- `position` - Toast position
- `displayTime` - Duration in ms
- `showCountdown` - Show countdown
- `color` - Notification color
- `colorDefault` - Use theme color
- `allowDismiss` - Allow dismiss
- `dismissText` - Dismiss button text
- `allowConfirm` - Show confirm button
- `confirmText` - Confirm button text
- `className` - CSS classes

**Missing Visual Properties:**
- Title font
- Message font
- Button styling
- Border styling
- Shadow control
- Icon support
- Background color override
- Animation control
- Countdown bar styling

---

### 17. **ui-spacer**

**File Locations:**
- HTML: `nodes/widgets/ui_spacer.html`

**Current Visual Properties:**
- `width`, `height` - Element dimensions

**Missing Visual Properties:**
- Background color (for visible spacing)
- Border (for layout debugging)
- Padding control

---

### 18. **ui-file-input**

**File Locations:**
- HTML: `nodes/widgets/ui_file_input.html`

**Current Visual Properties:**
- `label` - Input label
- `icon` - Button icon
- `allowMultiple` - Allow multiple files
- `accept` - File type filter
- `className` - CSS classes

**Missing Visual Properties:**
- Button styling (color, size, border)
- Font properties
- Icon color/size
- Disabled appearance
- Hover effects
- Padding/margin
- File list styling

---

### 19. **ui-progress**

**File Locations:**
- HTML: `nodes/widgets/ui_progress.html`

**Current Visual Properties:**
- `label` - Progress label
- `color` - Bar color
- `className` - CSS classes

**Missing Visual Properties:**
- Background color (unfilled)
- Height control
- Border radius
- Label font
- Value display control
- Stripe/pattern styling
- Animation control

---

### 20. **ui-audio**

**File Locations:**
- HTML: `nodes/widgets/ui_audio.html`

**Current Visual Properties:**
- Minimal; essentially a media player

**Missing Visual Properties:**
- Player control styling
- Volume slider styling
- Timeline appearance

---

## CONFIG NODES

### 1. **ui-page**

**File Locations:**
- HTML: `nodes/config/ui_page.html`

**Current Visual Properties:**
- `name` - Page name
- `path` - URL path
- `icon` - Navigation icon
- `layout` - 'grid', 'flex', 'tabs', 'notebook'
- `theme` - Theme selection
- `breakpoints` - Responsive breakpoints array
- `className` - CSS classes
- `visible` - Visibility toggle
- `disabled` - Disabled state

**Missing Visual Properties:**
- Background color
- Padding/margin control
- Font properties
- Text color
- Header/navigation styling
- Footer styling
- Min/max width control
- Border styling
- Shadow/elevation

---

### 2. **ui-group**

**File Locations:**
- HTML: `nodes/config/ui_group.html`

**Current Visual Properties:**
- `name` - Group name
- `width`, `height` - Grid size
- `showTitle` - Show title
- `className` - CSS classes
- `visible` - Visibility toggle
- `disabled` - Disabled state
- `groupType` - 'default' or 'dialog'

**Missing Visual Properties:**
- Title styling (font, color, size)
- Background color
- Border (color, style, width)
- Border radius
- Shadow/elevation
- Padding (internal)
- Margin (external)
- Typography defaults
- Icon support
- Gradient/fill options

---

### 3. **ui-theme**

**File Locations:**
- HTML: `nodes/config/ui_theme.html`

**Current Visual Properties:**
- Brand colors (primary, secondary, accent, warning, etc.)
- Neutral colors (background, surface, text)
- Font family
- Text properties (letter spacing, line height)

**Missing Visual Properties:**
- Default button styling
- Default input styling
- Component shadows/depth
- Border radius defaults
- Spacing scale
- Color opacity control
- Gradient presets

---

### 4. **ui-base**

**File Locations:**
- HTML: `nodes/config/ui_base.html`

- Main dashboard configuration
- Limited visual styling options

---

## SUMMARY OF MOST COMMON MISSING FEATURES

### 1. Font Control
- Font family selection
- Font size control
- Font weight (bold, normal, light)
- Font style (italic)
- Line height
- Letter spacing
- Text decoration (underline, strikethrough)

### 2. Color & Background
- Text color control (many widgets)
- Background color (most widgets)
- Hover/focus state colors
- Disabled state colors
- Gradient backgrounds

### 3. Spacing & Sizing
- Padding (internal spacing)
- Margin (external spacing)
- Border radius (rounded corners)
- Min/max widths
- Fixed heights

### 4. Borders & Shadows
- Border color, width, style
- Box shadow
- Text shadow
- Elevation/depth

### 5. States & Interactions
- Hover styling
- Active/selected styling
- Disabled styling
- Focus styling
- Animation/transition control

### 6. Component-Specific
- **Buttons:** Border-radius, padding, variant styles, shadow
- **Inputs:** Border style, focus color, placeholder color
- **Charts:** Title/legend/axis font control, axis styling
- **Tables:** Header/row/cell styling, alternating colors
- **Forms:** Field spacing, error styling
- **Lists:** Item styling, separator control

---

## DESIGN TOOL IMPLICATIONS

For Studio/Designer to be fully functional, it should support:

### 1. Typography Panel
- Font family selector
- Font size spinner
- Font weight selector
- Font style checkbox
- Line height control
- Letter spacing

### 2. Color Panel
- Text color picker
- Background color picker
- Border color picker
- Hover state color picker
- Disabled state color picker
- Opacity slider

### 3. Spacing Panel
- Padding (T, R, B, L)
- Margin (T, R, B, L)
- Gap (for flex)

### 4. Border & Shadow Panel
- Border width control
- Border style selector
- Border radius control
- Box shadow controls
- Text shadow controls

### 5. State Styling Panel
- Hover effects
- Focus effects
- Active/selected effects
- Disabled effects

### 6. Component-Specific Panels
- Button variants
- Input validation styling
- Chart title/legend/axis formatting
- Table cell formatting

---

## RECOMMENDATIONS

1. **Extend defaults objects** in HTML files with visual properties
2. **Create visual property categories** in design tool UI
3. **Implement dynamic styling** via Vue computed properties
4. **Add CSS variable support** for theme-aware styling
5. **Create style presets** for common combinations
6. **Implement style inheritance** from theme/page/group to widgets
7. **Add live preview** in designer
8. **Create style documentation** for each widget
9. **Implement style undo/redo** in designer
10. **Add style consistency checking** across dashboard

---

## File Inventory

### Widget Nodes (22 total)
- ui-audio
- ui-button
- ui-button-group
- ui-chart
- ui-control
- ui-dropdown
- ui-event
- ui-file-input
- ui-form
- ui-gauge
- ui-markdown
- ui-notification
- ui-number-input
- ui-progress
- ui-radio-group
- ui-slider
- ui-spacer
- ui-switch
- ui-table
- ui-template
- ui-text
- ui-text-input

### Config Nodes (5 total)
- ui-base
- ui-link
- ui-page
- ui-group
- ui-theme

---

**Audit Date:** 2026-02-16
**Audit Scope:** Complete codebase audit of visual properties
**Tools Used:** Static code analysis of HTML defaults objects and Vue component templates
