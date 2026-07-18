# AGENTS.md — Interactive Financial Education Module Builder

## Project Identity

**Role:** Lead Front-End Developer at EduForge Financial Technologies
**Goal:** Build a block-based interactive module builder for 50+ non-technical content creators
**Deadline:** 15 days
**Scoring:** 1000 points — Content Creator Panel (400) + Technical Architecture Review Board (600)

## Tech Stack (Strict)

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18+ | Functional components + hooks only. No class components. |
| Language | TypeScript 5.3+ (strict) | `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`. Zero `any` types. |
| Editor Core | TipTap | Built on ProseMirror. Extension-based block system. |
| State | Zustand 4.x + Immer | Middleware, slices, memoized selectors. No React Context for global state. |
| Styling | Tailwind CSS 3.4+ | No CSS-in-JS runtimes (no styled-components, Emotion). |
| Animation | Framer Motion 10.x+ | Layout, spring, exit animations per spec. |
| Drag & Drop | dnd-kit | Accessible, keyboard-supporting DnD. |
| Charts | Recharts | Pie/doughnut/line charts for calculators. |
| Testing | Vitest + Playwright | Unit: Vitest with c8/istanbul coverage. E2E: Playwright. |
| Build | Vite 5.x+ | ESM-first, fast HMR. |
| CI/CD | GitHub Actions + Husky + lint-staged | Pre-commit lint/type-check. CI: lint > type-check > test > build. |
| Package Manager | pnpm | Strict dependency resolution. |
| HTML Sanitization | DOMPurify | For pasted content. |

## Project Structure

```
/src
  /app            # App shell, layout
  /blocks         # Block components (15 types)
    /rich-text
    /image
    /video-embed
    /quiz-mcq
    /quiz-true-false
    /emi-calculator
    /sip-calculator
    /compound-interest
    /callout
    /divider
    /accordion
    /progress-tracker
    /achievement-badge
    /code-snippet
    /concept-explainer
  /editor         # Editor panel, block list, canvas
  /preview        # Preview panel, device frame, device toggle
  /store          # Zustand store slices
    editor-slice.ts
    quiz-slice.ts
    history-slice.ts
    ui-slice.ts
  /history        # Undo/redo middleware, history panel
  /export         # JSON export/import, validation engine
  /calculators    # Pure math functions (EMI, SIP, CI, Indian formatting)
  /components     # Shared UI components (Button, Toast, Modal, Toolbar, etc.)
  /hooks          # Custom hooks
  /types          # TypeScript type definitions
  /lib            # Utilities
  /test           # Test utilities, fixtures
/docs             # CONTENT_CREATOR_GUIDE.md, ARCHITECTURE.md
```

## 15 Block Types (by priority)

| Priority | # | Block | Key Requirements |
|---|---|---|---|
| Critical | 4 | Quiz (MCQ) | 2-6 options, single/multi correct, scoring, timer, attempt limit, feedback modes |
| Critical | 6 | EMI Calculator | P x R x (1+R)^N / [(1+R)^N - 1], Indian formatting, amortization table, debounced |
| Critical | 7 | SIP Calculator | FV = P x [((1+r)^n - 1) / r] x (1+r) (annuity-due), year-by-year table |
| Critical | 5 | Quiz (True/False) | Binary, shares scoring system with MCQ |
| High | 1 | Rich Text | Bold/italic/underline/strikethrough, H1-H4, lists, blockquotes, code, links, shortcuts |
| High | 8 | Compound Interest | 4 frequencies, growth line chart, comparison table |
| High | 2 | Image | Upload/URL, alt text, alignment, lazy load, max 5MB, JPG/PNG/WebP/SVG |
| High | 12 | Progress Tracker | Linear + branching, step labels, step navigation |
| High | 15 | Concept Explainer | 3-10 steps, auto-play, manual nav, animated transitions |
| Medium | 3 | Video Embed | YouTube/Vimeo URL parsing, 16:9, thumbnail in editor |
| Medium | 9 | Callout | 5 variants (info/warning/tip/important/danger), icon selector, rich text inside |
| Medium | 11 | Accordion/FAQ | Multiple items, smooth animation, keyboard accessible |
| Medium | 13 | Achievement Badge | 20+ icons, locked/unlocked animation, unlock conditions |
| Low | 10 | Divider | 4 styles (solid/dashed/dotted/gradient), 3 spacing options |
| Low | 14 | Code Snippet | Syntax highlighting, copy-to-clipboard, line numbers, dark mode only |

## Architecture Patterns

### Document Model
```
Module {
  moduleId: uuid-v4
  title: string (max 200)
  description: string (max 1000)
  version: semver
  createdAt: ISO 8601
  updatedAt: ISO 8601
  author: { id: string, name: string }
  metadata: { estimatedDuration, difficulty, tags, thumbnail }
  blocks: Block[]
  quizConfig: { feedbackMode, passingScore, showScoreOnCompletion }
}

Block {
  id: uuid-v4
  type: BlockType enum
  order: number
  content: type-specific object
  settings: { isVisible, isLocked, customCss }
}
```

### Block Registry Pattern
Each block type registers three components in a `BlockRegistry` map:
```
BlockRegistry[type] = { Editor, Preview, Settings, defaultContent, icon, name, description }
```

### Slash Command System
- Trigger: '/' at empty block start or block end
- Search: filter block types by name + keywords
- Navigation: Arrow keys + Enter. Escape to dismiss.
- Icon + description per block type in menu.
- Performance: menu < 100ms, filter < 50ms.

### Block Toolbar (10 Actions)
| Action | Icon | Shortcut |
|---|---|---|
| Drag Handle | Grip dots | Alt+Up/Down |
| Add Block Above | Plus | Ctrl+Shift+Enter |
| Add Block Below | Plus | Ctrl+Enter |
| Duplicate | Copy | Ctrl+D |
| Delete | Trash | Ctrl+Backspace |
| Move Up | Arrow up | Alt+Up |
| Move Down | Arrow down | Alt+Down |
| Lock/Unlock | Lock | Ctrl+L |
| Settings | Gear | Ctrl+/ |
| Visibility | Eye | Ctrl+Shift+H |

### Undo/Redo (Command Pattern)
- Snapshot-based Zustand middleware with Immer
- 50-step circular buffer (oldest discarded at 51)
- Branch pruning: new operation after undo discards future steps
- Batch text edits: same block within 500ms > single undo entry
- Performance: < 50ms per operation (UR-008)
- History panel: visual list of last 50 operations (UR-007)
- UR-010: Undo/redo restores config but NOT user-entered preview values

### Quiz Scoring (Pure Reducer)
```
quizReducer(state, action) -> new state
```
Deterministic, shared between editor and preview. Supports:
- Single-correct, multi-correct, partial credit
- Immediate and deferred feedback modes
- Attempt limiting (1, 2, 3, unlimited)
- Per-question timer (30s, 60s, 90s, 120s, none)

### Calculator Formulas (Pure Functions)
**EMI:** `EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]` where R = annual rate / 12 / 100  
**SIP:** `FV = P x [((1+r)^n - 1) / r] x (1+r)` where r = annual return / 12 / 100 (annuity-due variant)  
**CI:** `A = P x (1 + r/n)^(n x t)` where n = compounding frequency

### Editor/Preview Separation
- Editor panel: full Tailwind styles, editing UI, block toolbar, slash commands
- Preview panel: isolated CSS context (iframe or scoped styles), interactive calculators/quizzes
- Device toggle: Desktop 1440px / Tablet 768px / Mobile 375px with animated frame resize (400ms)
- Dark mode toggle (independent of editor)
- Scroll sync (optional toggle)
- Performance: 60fps with 50+ blocks, preview update < 300ms

### Indian Number Formatting
```
1,000 -> 1,000 (thousand)
1,00,000 -> 1,00,000 (lakh)
1,00,00,000 -> 1,00,00,000 (crore)
```
Pure utility function with comprehensive tests.

### JSON Export/Import
- Export: validate > pretty-print > auto-download as `module-title-YYYY-MM-DD.json`
- Import: validate > schema migration if needed > regenerate UUIDs > warn on unsaved changes
- Validation engine: 10 rules (Section A9.3)
- Export < 1s for 50 blocks, Import < 2s for 50 blocks
- Images as base64 data URIs in JSON

### Live Preview Requirements
| Req | Description | Criteria |
|---|---|---|
| PR-001 | Real-time update | < 300ms |
| PR-002 | Device toggle | 3 buttons, animated resize |
| PR-003 | Interactive | Calculators/quizzes functional |
| PR-004 | Scroll sync | Optional toggle |
| PR-005 | CSS isolation | Editor styles don't leak |
| PR-006 | Dark mode | Independent toggle |
| PR-007 | Performance | 60fps with 50+ blocks |
| PR-008 | Print preview | Static representation |

## Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| Primary | #2563EB | Actions, active states, selected blocks |
| Primary Hover | #1D4ED8 | Hover state |
| Secondary | #475569 | Labels, icons |
| Background | #FFFFFF / #F8FAFC | Page / alternate |
| Surface | #FFFFFF | Cards, panels |
| Border | #E2E8F0 | Borders, dividers |
| Success | #16A34A | Correct, success toasts |
| Error | #DC2626 | Incorrect, error toasts |
| Warning | #F59E0B | Warnings |
| Info | #3B82F6 | Info callouts, tooltips |
| Text Primary | #0F172A | Body text, headings |
| Text Secondary | #64748B | Captions, placeholders |
| Focus Ring | #3B82F6 ring-2 | Focus indicators |

### Typography
| Element | Class | Size | Weight |
|---|---|---|---|
| Module Title | text-3xl font-bold | 30px | 700 |
| H1 | text-2xl font-bold | 24px | 700 |
| H2 | text-xl font-semibold | 20px | 600 |
| H3 | text-lg font-semibold | 18px | 600 |
| Body | text-base | 16px | 400 |
| Small | text-sm | 14px | 400 |
| Caption | text-xs | 12px | 400 |
| Code | text-sm font-mono | 14px | 400 |
| Button/Label | text-sm font-medium | 14px | 500 |

### Animation Standards
| Animation | Duration | Easing |
|---|---|---|
| Block insert | 300ms | easeOut |
| Block delete | 200ms | easeIn |
| Block reorder | 200ms | spring(300) |
| Toast enter | 300ms | easeOut |
| Accordion expand | 300ms | easeInOut |
| Calculator result | 500ms | spring |
| Pie chart enter | 800ms | easeOut |
| Badge unlock | 600ms | spring bounce |
| Slash command menu | 150ms | easeOut |
| Device toggle | 400ms | easeInOut |

## Accessibility (WCAG 2.1 AA)

### Key Navigation
| Context | Key | Behavior |
|---|---|---|
| Editor canvas | Tab | Next block, 2px outline |
| Editor canvas | Shift+Tab | Previous block |
| Focused block | Enter | Edit mode |
| Focused block | Escape | Exit edit, return focus |
| Focused block | Alt+Up/Down | Move block, announce position |
| Focused block | Ctrl+D | Duplicate, focus new |
| Focused block | Ctrl+Backspace | Delete, focus previous |
| Slash menu | Arrow Up/Down | Navigate items |
| Slash menu | Enter | Select and insert |
| Slash menu | Escape | Close, return focus |
| Block toolbar | Tab | Cycle actions |
| Block toolbar | Enter/Space | Activate |
| Modals | Tab | Focus trapped |
| Modals | Escape | Close, return focus |
| Calc inputs | Tab | Move between fields |
| Accordion | Enter/Space | Toggle section |
| Accordion | Arrow Up/Down | Navigate headers |

### Required ARIA
- Editor canvas: `role="application"` `aria-label="Module Editor"`
- Each block: `role="group"` `aria-label="[Type] block, pos [N] of [Total]"`
- Block toolbar: `role="toolbar"` `aria-label="Block actions"`
- Slash menu: `role="listbox"` `aria-expanded` `aria-activedescendant`
- Device toggle: `role="radiogroup"` (each button: `role="radio"`)
- Quiz options: `role="radiogroup"` (single) / `role="group"` (multi)
- Calculator inputs: `aria-label` `aria-describedby`
- Toasts: `role="alert"` `aria-live="polite"`
- Progress tracker: `role="progressbar"` `aria-valuenow/min/max`
- History panel: `role="log"` `aria-label="Undo/redo history"`

## Testing Requirements

### Coverage Thresholds
- Line coverage: >= 90%
- Branch coverage: >= 85%
- Function coverage: >= 90%
- Statement coverage: >= 90%

### Mandatory Unit Test Files
| File | Min Cases | Key Coverage |
|---|---|---|
| emi-calculator.test.ts | 15 | Section A5.2 edge cases, formula precision, Indian formatting |
| sip-calculator.test.ts | 12 | Annuity-due formula, year-by-year table |
| compound-interest.test.ts | 10 | 4 compounding frequencies, growth data |
| quiz-scoring.test.ts | 15 | Single/multi correct, partial credit, timer, attempt limit |
| undo-redo.test.ts | 20 | All ops, branch pruning, circular buffer overflow, batch edits |
| json-export.test.ts | 12 | Valid module, edge cases, validation errors, base64 images |
| json-import.test.ts | 15 | Valid/invalid, schema migration, UUID regeneration, malformed JSON |
| block-factory.test.ts | 15 | All 15 types, defaults, UUID, type registry |
| slash-command.test.ts | 10 | Exact/partial/keyword match, no match, empty query |
| number-format.test.ts | 10 | Lakhs, crores, negative, zero, decimal |
| validation.test.ts | 20 | All 10 rules from Section A9.3, combined violations, clean module |
| document-model.test.ts | 10 | Round-trip, nested blocks, special chars, schema version |

### E2E Tests (8 Playwright Journeys)
| ID | Journey | Key Assertions |
|---|---|---|
| E2E-001 | Create module with 3 blocks (text, quiz, calculator) | All blocks render. Preview shows all. |
| E2E-002 | Drag-and-drop reorder pos 1 to pos 3 | Order updated. Undo restores. |
| E2E-003 | Full EMI calculation in preview | Value matches expected. Chart renders. Table correct. |
| E2E-004 | Quiz attempt flow in preview | Correct/incorrect feedback. Score updates. |
| E2E-005 | Export JSON and re-import | Download triggers. All blocks restored. UUIDs regenerated. |
| E2E-006 | 10 undo/redo consecutive operations | Original state restored. Redo 5 correct. |
| E2E-007 | Mobile preview for calculator | 375px viewport. Calculator usable. Inputs accessible. |
| E2E-008 | Keyboard-only navigation | Tab through all. Add block via slash. Focus management. |

## Performance Budgets
| Operation | Max Time |
|---|---|
| Initial page load (FCP) | < 2s |
| Time to Interactive | < 3s |
| Add/delete block | < 100ms |
| Undo/redo operation | < 50ms |
| Drag-and-drop reorder | < 150ms |
| Preview update | < 300ms |
| JSON export (50 blocks) | < 1s |
| JSON import (50 blocks) | < 2s |
| Slash command menu | < 100ms |
| Calculator recalculation | < 300ms |
| Scroll (50+ blocks) | 60fps |

### Bundle Size Budgets (gzipped)
| Chunk | Max |
|---|---|
| Main bundle (JS) | < 250 KB |
| Editor framework (lazy) | < 150 KB |
| Calculator blocks (lazy) | < 80 KB |
| Chart library | < 100 KB |
| Framer Motion | < 60 KB |
| Total initial load | < 400 KB |

## Acceptance Criteria Checkpoints

| Day | Checkpoint | Min Pass |
|---|---|---|
| 2 | Architecture Lock | CI green, document model, BlockFactory all 15 types, types complete |
| 4 | Core Editor Demo | Rich Text + slash command + block toolbar (10 actions), demo to PM |
| 6 | Calculator Sprint | All 3 calculators with Indian formatting, edge cases pass |
| 9 | Blocks Complete | All 15 block types implemented (minimum 8) |
| 11 | Undo/Redo & Preview | UR-001 to UR-005 passing, live preview functional |
| 13 | Integration Complete | Export/import round-trip, DnD + a11y |
| 14 | Pre-Submission | 90%+ coverage, all 8 E2E passing, Lighthouse thresholds met |
| 15 | Final Submission | CI 100% green, all deliverables, repo transferred |

## Run Commands

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run Vitest with coverage
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # Playwright UI mode
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm typecheck        # tsc --noEmit
pnpm format           # Prettier check
pnpm format:fix       # Prettier write
```

## Forbidden
- No jQuery
- No class components (functional + hooks only)
- No CSS-in-JS runtime (styled-components, Emotion)
- No React Context for global state (Zustand only)
- No `any` types (-5 pts per occurrence)
- No localStorage as primary state (persistence only)
- No direct commits to `main` (feature branches + PRs)
- Repository must remain PRIVATE at all times
- No disclosure/public sharing of project

## Content Creator Guide (docs/CONTENT_CREATOR_GUIDE.md)

Mandatory deliverable for Content Creator Panel. Requirements:
- **No technical jargon** (no "component", "state management", "JSON schema", "UUID", "API")
- **Action-oriented**: every instruction starts with action verb
- **Visual descriptions**: describe UI element appearance
- **Use-case driven**: concrete financial education use case per block
- **Error recovery focus**: address real anxieties (accidental delete, changes disappeared, export not working)

### Required Sections (min word counts)
| Section | Min Words |
|---|---|
| Getting Started | 500 |
| Block Types Overview | 1500 |
| Using Calculators | 800 |
| Creating Quizzes | 600 |
| Arranging Your Module | 400 |
| Previewing Your Module | 300 |
| Exporting and Importing | 300 |
| Keyboard Shortcuts | 200 |
| Troubleshooting | 400 |
| Glossary | 200 |

## Error Handling & Edge Cases

### Application-Level
- Error boundary per block (others stay functional)
- Try-catch in every Zustand store action
- JSON.parse in try-catch with formatted import errors
- Image upload: size check (max 5MB) + MIME type validation
- Paste sanitization via DOMPurify
- Network disconnect: graceful upload failure with toast

### Block-Level Edge Cases
| Block | Edge Case | Behavior |
|---|---|---|
| Rich Text | 50,000+ chars pasted | Accepted, smooth performance |
| Image | URL returns 404 | Broken image placeholder |
| Video | Non-YouTube/Vimeo URL | Error message |
| EMI | Rate = 0% | Show "EMI = Principal / Tenure" (no div by zero) |
| EMI | Rapid slider drag | Debounce 300ms |
| Quiz (MCQ) | 0 options | Validation error |
| Quiz (MCQ) | No correct answer | Validation error |
| Accordion | 0 items | Validation error |
| Accordion | 20+ nested items | Allowed, soft warning |
| Progress Tracker | Total steps <= 0 | Rejected, min 2 |
| Concept Explainer | 1 step only | Rejected, min 3 |
| Code Snippet | 10,000+ char line | Horizontal scroll |

### State Edge Cases
| Scenario | Behavior |
|---|---|
| Undo all 50 steps | Undo disabled, original state |
| Undo 25 then new action | Branch pruning, 25 steps discarded |
| Export, delete, import | Module fully restored |
| Duplicate block 100x rapidly | Each is separate undo entry, no crash |
| Rapid device toggle switching | Updates correctly, no race conditions |
| 100 blocks + rapid undo/redo 50x | All < 50ms |
| Typing during preview update | Text input never blocked |
| Two identical calculator blocks | Independent operation |

## Achievements/Badges (20 total)
| Badge | Unlock | Tier |
|---|---|---|
| Foundation Layer | CI pipeline passing | Bronze |
| Block Master | All 15 block types | Silver |
| Calculator Wizard | All 3 calculators pass edge cases | Gold |
| Time Traveller | Undo/redo all 10 reqs met | Gold |
| Responsive Ninja | Mobile preview passes | Silver |
| Quiz Architect | Quiz with scoring/timer/feedback | Silver |
| Design System Guardian | All tokens consistent | Silver |
| Accessibility Champion | Lighthouse A11y = 100 | Platinum |
| Test Sentinel | 90%+ coverage | Gold |
| Performance Hawk | All runtime budgets met | Gold |
| Data Architect | JSON export/import with versioning | Silver |
| Round-Trip Master | Identical round-trip | Gold |
| Keyboard Warrior | All actions via keyboard | Silver |
| Documentation Sage | Guide meets all requirements | Silver |
| Streak Keeper | 7 consecutive commits | Bronze |
| Zero Any | Zero `any` types | Gold |
| Ship Day Hero | All deliverables on time | Platinum |
| Innovation Award | 16th+ custom block | Platinum |
| Bug Squasher | Zero bugs in review | Platinum |
| Perfect Score | Score 950+/1000 | Legendary |
