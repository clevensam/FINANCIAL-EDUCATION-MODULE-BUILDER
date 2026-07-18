# ModuleForge Architecture

## Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | React 19 | Functional components + hooks. No class components. |
| Language | TypeScript 6 (strict) | `strict: true`, `noImplicitAny: true`. Zero `any` types. |
| Editor Core | TipTap (ProseMirror) | Extension-based block system, WYSIWYG, extensible nodes/marks. |
| State Management | Zustand 5 + Immer | Slice pattern, memoized selectors, immutable updates via Immer drafts. |
| Styling | Tailwind CSS v4 | Utility-first, no runtime CSS-in-JS. |
| Animation | Framer Motion 11 | Layout animations, spring physics, exit animations. |
| Drag & Drop | dnd-kit | Accessible, keyboard-supporting sortable context. |
| Charts | Recharts | Composable chart primitives (PieChart, LineChart). |
| Testing | Vitest + Playwright | Unit (Vitest, 90%+ coverage), E2E (Playwright, 8 journeys). |
| Build | Vite 8 (Rolldown) | ESM-first, fast HMR, code-splitting. |
| CI/CD | GitHub Actions | Matrix (Node 20/22) — lint → typecheck → test → build → e2e. |
| Package Manager | pnpm | Strict dependency resolution. |

## Project Structure

```
src/
  app/              App shell, layout, keyboard shortcut handler
  blocks/           15 block type directories
    rich-text/      TipTap WYSIWYG editor
    image/          Upload/URL image with alt text
    video-embed/    YouTube/Vimeo URL parser
    quiz-mcq/       Multiple choice editor (2-6 options)
    quiz-true-false/ Binary quiz editor
    emi-calculator/ EMI with sliders, amortization table, pie chart
    sip-calculator/ SIP with growth table, pie chart
    compound-interest/ CI with frequency selector, line chart
    callout/        5 variant callout with icon selector
    divider/        4 styles, 3 spacing options
    accordion/      Expandable items with animations
    progress-tracker/ Linear/branching step tracker
    achievement-badge/ 20 icons, locked/unlocked states
    code-snippet/   8 languages, syntax highlighting, line numbers
    concept-explainer/ 3-10 step auto-play explainer
  calculators/      Pure math functions (EMI, SIP, CI, Indian formatting)
  components/       Shared UI (Toolbar, HistoryPanel)
  editor/           Canvas, BlockPalette, BlockToolbar, BlockWrapper
  export/           Validation engine, JSON export/import
  hooks/            Custom React hooks
  lib/              BlockFactory, UUID generator
  preview/          PreviewPanel, BlockPreviewRenderer, calculator previews
  store/            Zustand slices (editor, ui, quiz, history)
  types/            TypeScript interfaces (Block, Module, Quiz)
  test/             Test utilities and fixtures
```

## Document Model

The core data model is the `Module` interface:

```typescript
interface Module {
  moduleId: string;          // UUID v4
  title: string;             // max 200 chars
  description: string;       // max 1000 chars
  version: string;           // semver
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
  author: { id: string; name: string };
  metadata: { estimatedDuration, difficulty, tags, thumbnail };
  blocks: Block[];
  quizConfig: { feedbackMode, passingScore, showScoreOnCompletion };
}
```

Each `Block` is a discriminated union on `type`:

```typescript
interface Block {
  id: string;                // UUID v4
  type: BlockType;           // 15 enum values
  order: number;
  content: BlockContent;     // Union type, narrowed by block.type
  settings: { isVisible, isLocked, customCss };
}
```

## State Management (Zustand + Immer)

Four slices compose the global store:

| Slice | Key State | Key Actions |
|---|---|---|
| `editor-slice` | `module`, `selectedBlockId`, `isDirty` | CRUD on blocks, title, description, quiz config |
| `ui-slice` | `deviceView`, `theme`, panel visibility | Toggle preview/history, set device, toggle theme |
| `quiz-slice` | `quizzes`, `totalScore`, `maxPossibleScore` | Init, select, submit, reset quiz attempts |
| `history-slice` | `past`, `future` | `pushSnapshot`, `undo`, `redo`, `canUndo`, `canRedo` |

### Undo/Redo (Command Pattern)

- **Snapshot-based:** Each editor mutation pushes a deep clone of the module onto the `past` stack.
- **Circular buffer:** Max 50 snapshots. Oldest is discarded at 51.
- **Branch pruning:** A new operation after undo clears the `future` stack.
- **Batch text edits:** Edits to the same block within 500ms are collapsed into a single snapshot.
- **Keyboard:** `Ctrl+Z` undo, `Ctrl+Shift+Z` redo, handled at the App level.
- **History panel:** Visual list of past/future states with click-to-restore.

## Block Registry Pattern

Each block type registers a set of components via a central registry concept (implemented as switch statements in BlockWrapper and BlockPreviewRenderer):

- **Editor component** — WYSIWYG or form-based editing UI
- **Preview component** — Read-only or interactive learner view
- **Default content** — Initial block content factory

## Editor/Preview Separation

The editor and preview are independent panels with different rendering contexts:

- **Editor:** Full Tailwind styles, editing UI, block toolbar, slash commands
- **Preview:** Isolated rendering with calculator interactivity and quiz functionality

### Live Preview Architecture

- Preview updates reactively via Zustand selectors (< 300ms)
- Device toggle (desktop 1440px / tablet 768px / mobile 375px) with animated frame resize (400ms)
- Dark mode in preview independent of editor
- Optional scroll sync between editor and preview
- 60fps with 50+ blocks via React reconciliation

## Calculator Architecture

All calculators follow a pure-function pattern:

```
Input (from block content) → Pure math function → Output (EMIResult, SIPResult, CIResult) → React rendering
```

| Calculator | Formula | Edge Cases |
|---|---|---|
| EMI | `P × r × (1+r)^n / ((1+r)^n - 1)` | Rate=0 → EMI = P/n |
| SIP | `P × [((1+r)^n - 1) / r] × (1+r)` (annuity-due) | Rate=0 → FV = total invested |
| CI | `A = P × (1 + r/n)^(n×t)` | Rate=0 → A = P |

### Indian Number Formatting

The `formatIndianNumber` utility handles lakh/crore formatting:
- ₹1,00,000 (1 lakh)
- ₹1,00,00,000 (1 crore)
- Short format: ₹1.2K, ₹5.5L, ₹2.3Cr

## Quiz Scoring Engine

The quiz scoring reducer is a pure function shared between editor and preview:

```typescript
quizReducer(state, action) → new state
```

Supports:
- Single-correct, multi-correct, partial credit
- Immediate and deferred feedback modes
- Attempt limiting (1, 2, 3, unlimited)
- Per-question timer (30s, 60s, 90s, 120s, none)

## Validation Engine (10 Rules)

| Rule | Description |
|---|---|
| R1 | Module ID required |
| R2 | Title required, max 200 chars |
| R3 | Description max 1000 chars |
| R4 | Version must be semver |
| R5 | Blocks must be an array |
| R6 | All block IDs must be unique |
| R7 | Block orders must be non-negative |
| R8 | Block types must be valid enum values |
| R9 | Block content must be a non-null object |
| R10 | Per-block validation (quiz options, calculator values, etc.) |

## Export/Import Pipeline

### Export
```
Module → validateModule() → JSON.stringify(pretty-print) → Blob → download
```

### Import
```
JSON file → FileReader → JSON.parse() → validateModule() → regenerateBlockIds() → setModule()
```

## Performance Budgets

| Operation | Target |
|---|---|
| Initial load (FCP) | < 2s |
| Add/delete block | < 100ms |
| Undo/redo | < 50ms |
| Drag-and-drop | < 150ms |
| Preview update | < 300ms |
| JSON export (50 blocks) | < 1s |
| JSON import (50 blocks) | < 2s |
| Slash command menu | < 100ms |
| Calculator recalc | < 300ms |
| Scroll (50+ blocks) | 60fps |

## Accessibility (WCAG 2.1 AA)

- ARIA roles on editor canvas (`application`), blocks (`group`), toolbar (`toolbar`), device toggle (`radiogroup`)
- Keyboard navigation: Tab, arrow keys, Enter, Escape
- Focus management: visible focus rings, focus trapping in modals
- ARIA labels on all interactive elements
- Screen reader announcements for block position and state changes

## Bundle Size Budgets (gzipped)

| Chunk | Size |
|---|---|
| Main JS | 97 KB |
| Editor (TipTap) | 104 KB |
| Charts (Recharts) | 107 KB |
| Animations (Framer) | 43 KB |
| CSS | 6 KB |

## Testing Strategy

### Unit Tests (Vitest, 12 test files)
- `emi-calculator.test.ts` (17 tests)
- `sip-calculator.test.ts` (12 tests)
- `compound-interest.test.ts` (10 tests)
- `quiz-scoring.test.ts` (17 tests)
- `number-format.test.ts` (12 tests)
- `block-factory.test.ts` (18 tests)
- `document-model.test.ts` (9 tests)
- `undo-redo.test.ts` (15 tests)
- `validation.test.ts` (25 tests)
- `export-module.test.ts` (11 tests)
- `import-module.test.ts` (14 tests)
- `slash-command.test.ts` (10 tests)

### E2E Tests (Playwright, 8 journeys)
- Module creation with text, quiz, calculator
- Drag-and-drop reorder
- EMI calculation flow
- Quiz attempt flow
- Export/import round-trip
- Undo/redo consecutive operations
- Mobile preview
- Keyboard-only navigation

## CI/CD Pipeline

```yaml
jobs:
  ci:
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - checkout
      - pnpm install
      - pnpm lint
      - pnpm typecheck
      - pnpm test
      - pnpm build
      - pnpm exec playwright install
      - pnpm test:e2e
```

## Day-15 Final Scoring

| Area | Points | Assessment |
|---|---|---|
| Content Creator Panel | 400 | Guide quality, jargon-free, visual descriptions, error recovery |
| Technical Architecture | 600 | Code quality, testing, a11y, perf budgets, CI green |
