# Financial Education Module Builder

A block-based interactive module builder for creating financial education content. Built for non-technical content creators to assemble rich, interactive learning modules with calculators, quizzes, and multimedia — no coding required.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18+ (functional components + hooks) |
| Language | TypeScript 5.3+ (strict mode) |
| Editor Core | TipTap (ProseMirror-based block system) |
| State | Zustand 4.x + Immer |
| Styling | Tailwind CSS 3.4+ |
| Animation | Framer Motion 10.x+ |
| Drag & Drop | dnd-kit |
| Charts | Recharts |
| Testing | Vitest + Playwright |
| Build | Vite 5.x+ |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

## Testing

```bash
pnpm test              # Unit tests with coverage
pnpm test:watch        # Watch mode
pnpm test:e2e          # E2E tests (Playwright)
pnpm test:e2e:ui       # Playwright UI mode
```

## Linting & Formatting

```bash
pnpm lint              # ESLint check
pnpm lint:fix          # ESLint auto-fix
pnpm typecheck         # TypeScript check
pnpm format            # Prettier check
pnpm format:fix        # Prettier write
```

## Block Types

| Block | Description |
|---|---|
| Rich Text | Bold, italic, headings, lists, blockquotes, code, links |
| Image | Upload or URL, alt text, alignment |
| Video Embed | YouTube/Vimeo URL parsing with thumbnail preview |
| Quiz (MCQ) | 2–6 options, single/multi correct, scoring, timer |
| Quiz (True/False) | Binary quiz with scoring |
| EMI Calculator | Loan EMI with amortization table and pie chart |
| SIP Calculator | SIP returns with year-by-year growth table |
| Compound Interest | 4 compounding frequencies with line chart |
| Callout | Info, warning, tip, important, danger variants |
| Divider | Solid, dashed, dotted, gradient styles |
| Accordion/FAQ | Expandable items with smooth animation |
| Progress Tracker | Linear and branching step navigation |
| Achievement Badge | 20+ icons, locked/unlocked states |
| Code Snippet | Syntax highlighting, copy-to-clipboard |
| Concept Explainer | Multi-step animated walkthrough |

## Project Structure

```
src/
  app/            # App shell, layout
  blocks/         # Block components (15 types)
  editor/         # Editor panel, block list, canvas
  preview/        # Preview panel, device frame
  store/          # Zustand store slices
  history/        # Undo/redo middleware
  export/         # JSON export/import, validation
  calculators/    # Pure math functions
  components/     # Shared UI components
  hooks/          # Custom hooks
  types/          # TypeScript definitions
  lib/            # Utilities
```

## Key Features

- **Block-based editor** with slash commands and toolbar
- **Live preview** with device toggle (Desktop / Tablet / Mobile)
- **Interactive calculators** with Indian number formatting
- **Quiz system** with scoring, timers, and feedback modes
- **Undo/redo** with 50-step history and visual panel
- **JSON export/import** with validation and schema migration
- **Drag-and-drop** reordering with keyboard support
- **WCAG 2.1 AA** accessibility compliance
- **Dark mode** support

## License

Private — for internal use only.
