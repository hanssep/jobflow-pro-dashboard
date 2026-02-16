# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **JobFlow Pro Dashboard** — a fork of [FlowFuse/node-red-dashboard](https://github.com/FlowFuse/node-red-dashboard) (Dashboard 2.0). It's a Node-RED plugin that renders Vue 3 dashboards from Node-RED flows. The fork adds a visual design environment called **Studio** for WYSIWYG layout editing, a **Designer** for three-panel visual design, and responsive breakpoint support.

Published as `@hanssep/jobflow-pro-dashboard`.

## Commands

```bash
# Build
npm run build              # Production build (Vite)
npm run build:dev          # Development build (unminified)
npm run dev                # Dev build with watch mode

# Lint
npm run lint               # Run all linters (JS + HTML + package.json sort)
npm run lint:fix           # Auto-fix all lint issues

# Unit Tests (Mocha)
npm test                   # Run all tests: mocha "test/**/*.spec.js"
npm run test:debug         # Debug tests with inspector on port 9226

# E2E Tests (Cypress)
npm run cy:server          # Start Node-RED test server on port 1881
npm run cy:open            # Open Cypress interactive runner
npm run cy:run             # Run Cypress headless

# Docs (VitePress)
npm run docs:dev           # Local docs dev server
npm run docs:build         # Build docs site

# Watch (parallel dev + Node-RED restart)
npm run watch              # Runs both watch:dashboard and watch:node-red
```

## Architecture

### Two-Runtime Split

The codebase runs in two separate runtimes that communicate via Socket.IO:

1. **Server-side (Node.js/Node-RED)** — `nodes/` directory, CommonJS modules
   - `nodes/config/` — Config node types: `ui_base`, `ui_page`, `ui_group`, `ui_theme`, `ui_link`
   - `nodes/widgets/` — Widget node types: each has `.js` (server logic) + `.html` (Node-RED editor UI)
   - `nodes/config/ui_base.js` — Singleton that initializes Express, Socket.IO server, and serves the Vue app from `dist/`
   - `nodes/config/ui_designer_api.js` — REST API for the visual Designer
   - `nodes/config/ui_studio_api.js` — REST API for Studio (page/group CRUD, reorder, deploy)
   - `nodes/store/data.js` + `state.js` — Server-side data and state persistence
   - `nodes/utils/index.js` — Shared utilities

2. **Client-side (Vue 3 SPA)** — `ui/src/` directory, ES modules, built by Vite into `dist/`
   - `ui/src/main.mjs` — App bootstrap: Vue + Vuetify + Vue Router + Vuex + Socket.IO client
   - `ui/src/store/` — Vuex modules: `ui`, `data`, `setup`, `wysiwyg`, `designer`, `widgetTypes`, `studio`
   - `ui/src/widgets/` — Vue components for each widget type (e.g., `ui-button/UIButton.vue`)
   - `ui/src/layouts/` — Layout types: Grid, Flex, Tabs, Notebook, plus WYSIWYG editing system
   - `ui/src/studio/` — Studio visual design environment (page management, canvas, toolbar)
   - `ui/src/designer/` — Three-panel Designer (palette, canvas, property editor)

### Data Flow

1. Node-RED deploys → `ui_base.js` collects all registered pages/groups/widgets
2. Vue app fetches `/_setup` endpoint for Socket.IO config
3. Socket.IO pushes widget configs and data updates to the Vue app
4. Vuex store manages all client-side state
5. Studio/Designer changes go through REST API → update Node-RED config nodes → trigger redeploy

### Key Conventions

- **Widget pattern**: Each widget has a server `.js` file, an editor `.html` file, and a Vue `.vue` component
- **Node-RED globals**: `RED` and `$` (jQuery) are available as globals in `.html` editor files
- **Vuetify**: The UI framework — use Vuetify 3 components and Material Design Icons (`@mdi/font`)
- **Theme**: Custom Vuetify theme named `nrdb` with colors derived from Node-RED `ui-theme` config
- **Third-party widget support**: `window.Vue` and `window.vuex` are exposed globally for community nodes
- **i18n**: Locale files in `nodes/*/locales/` (en-US, de, ja) — help docs in `.html`, UI strings in `.json`

### Fork-Specific Features

- **Studio** (`ui/src/studio/`): Visual page management, WYSIWYG drag/reorder, inline editing
- **Designer** (`ui/src/designer/`): Three-panel layout with widget palette, canvas, and property editor
- **Responsive breakpoints**: `breakpoints` property on `ui-page` nodes (not in upstream FlowFuse)
- **Dialog groups**: `groupType: 'dialog'` on `ui-group` nodes (not in upstream FlowFuse)
- **WYSIWYG editing** (`ui/src/layouts/wysiwyg/`): Drag-reorder widgets/groups, resize handles, undo/redo

## Lint Rules

- 4-space indentation
- ESLint Standard config with import ordering (alphabetical, with newlines between groups)
- Vue files: `plugin:vue/vue3-recommended` with relaxed `max-attributes-per-line` and `singleline-html-element-content-newline`
- Node files: `plugin:n/recommended` with CommonJS environment
- No `.only()` in tests (`no-only-tests` plugin)

## Testing

- **Unit tests**: Mocha + `node-red-node-test-helper` + Should.js + Sinon — test files in `test/`
- **E2E tests**: Cypress — test files in `cypress/tests/`, fixtures with flow JSON in `cypress/fixtures/flows/`
- **CI**: Node 20, runs lint + unit tests via GitHub Actions shared workflow

## Runtime Environment

- **This is JobFlow Pro, NOT vanilla Node-RED** — it runs as an embedded Node-RED inside the JobFlow Pro engine
- **Base URL**: `https://localhost:8888/jobflowengine/api`
- **Dashboard URL**: `https://localhost:8888/jobflowengine/api/dashboard/`
- **Studio URL**: `https://localhost:8888/jobflowengine/api/dashboard/_studio`
- **Self-signed HTTPS** — always use HTTPS, never plain HTTP

## Active Development: Studio Plan

See `STUDIO-PLAN.md` for the strategic roadmap to evolve Studio from a layout arranger into a full visual design environment. Core principle: **Node-RED owns behavior, Studio owns appearance.**
