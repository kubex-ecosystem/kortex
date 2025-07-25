# Kortex - MCP Server Management Dashboard

## Architecture Overview

Kortex is a Next.js TypeScript dashboard for managing MCP (Model Context Protocol) servers. The app follows a modular architecture with clear separation between layout, components, pages, and business logic.

### Key Structure
- **Framework**: Next.js 15 with App Router + Pages Router hybrid
- **Styling**: Tailwind CSS with dark mode support
- **State**: React Context API (`AppContext`) for global state
- **Components**: Modular UI components with TypeScript interfaces
- **Export**: Static site generation (`output: 'export'`)

## Critical Files & Patterns

### Core Architecture Files
- `src/context/AppContext.tsx` - Global state management for servers, tasks, logs, notifications
- `src/types/index.ts` - Central type exports (re-exports all type files)
- `src/components/Layout/Layout.tsx` - Main layout with sidebar navigation and responsive design
- `src/pages/_app.tsx` - Next.js app wrapper with context providers

### Component Organization
```
src/components/
├── Layout/          # Layout components (Header, Sidebar, Layout)
├── Dashboard/       # Dashboard-specific components
├── MCP/            # MCP protocol components and settings
├── UI/             # Reusable UI components
└── App/            # App-level components
```

### Type System
All types are organized in `src/types/` with individual files for each domain:
- `MCPTypes.tsx` - MCP server and protocol types
- `TaskTypes.tsx` - Task management types
- `AppTypes.tsx` - Application state types
- Import pattern: `export * from './TypeFile'` in `index.ts`

## Development Patterns

### Context Pattern
The app uses a centralized context (`AppContext`) that manages:
- Server connections and status
- Task queues and processing
- Log entries and notifications
- Connection state and error handling

### Component Patterns
- **Layout**: Responsive sidebar with mobile overlay
- **Navigation**: Single-page app with conditional rendering
- **State**: Context-based global state with TypeScript interfaces
- **Styling**: Tailwind classes with consistent dark mode support

### Build Configuration
- **Static Export**: Uses `output: 'export'` for static site generation
- **Trailing Slash**: Configured for GitHub Pages deployment
- **Images**: Unoptimized for static export compatibility

## Common Issues & Solutions

### Build Problems
1. **Module Resolution**: Ensure all imports use relative paths
2. **Type Exports**: Check `src/types/index.ts` for missing exports
3. **Context Types**: Verify `AppContext` interface completeness

### Development Workflow
```bash
npm run dev    # Development server
npm run build  # Static build (check for errors)
npm run start  # Production server
```

### Deployment
- Static export generates files in `./out/`
- Configured for GitHub Pages with `trailingSlash: true`
- Uses `unoptimized: true` for images

## Key Dependencies
- `lucide-react` - Icon library used throughout
- `framer-motion` - Animation library
- `tailwindcss` - Styling framework
- `react-i18next` - Internationalization (configured but not fully implemented)

## MCP Integration
The app is designed to interface with Model Context Protocol servers:
- Server configuration and connection management
- Task execution and monitoring
- Log aggregation and real-time updates
- Settings management for MCP providers

# TypeScript Craftsmanship Standards

Use `yarn` with lockfiles committed. Prefer `workspace:` protocol in monorepos. Avoid unnecessary dependencies.

Organize code in: `src/`, `src/components/`, `src/hooks/`, `src/pages/`, `src/context/`, `src/lib/`, `src/types/`, `src/interfaces/`, `tests/`, `scripts/`, `bin/`.  
Main entry: `src/index.ts`. CLI entry: `bin/cli.ts`. Avoid deep folder nesting.

Enable strict mode in `tsconfig.json`. Use `paths` and `baseUrl` to simplify imports (e.g., `@core/`, `@utils/`).

Each module must follow single responsibility. Avoid module-level side effects. Use `index.ts` only for aggregation.

Use `camelCase` for variables and functions, `PascalCase` for types and classes. Avoid `any`, and prefer safe typing over assertions.

Use `.interface.ts` for interfaces, `.dto.ts` for data transfer types, `.types.ts` for common types, `.spec.ts` for tests.

Write tests with `vitest` or `jest`. Test logic, not framework details. Use subprocesses for CLI testing.

Handle async explicitly. No unhandled promises. Use `try/catch`, safe wrappers, or functional patterns like `Result`.

Use dependency injection instead of hardcoded imports. Configs must come from `.env` or be injected — never hardcoded.

All public symbols must have TSDoc. Document params, return types, and usage when needed. Auto-generate docs if possible.

CLIs must support `--help`, `--version`, and `--json` (structured output). Errors go to `stderr`, data to `stdout`.

Use `eslint` with `@typescript-eslint`. Add Prettier. Enforce lint, format, and build on CI. Use Husky to block bad commits.

README must be technical and updated: build, run, test instructions, usage examples, and module explanation. Add diagrams when helpful.

Be declarative. Be typed. Be testable. Be clean. Be TypeScript.

# Markdown Craftsmanship Standards

Use `#` for titles. Maintain hierarchy order (no skipping levels). Only one `#` per file (main title).

Separate paragraphs with blank lines. Avoid long lines (>120 chars). Keep spacing consistent.

Use `-` for unordered lists. Use `1.` only for ordered items. Always insert space after bullet.

Use single backticks for inline code: `` `example` ``. Use triple backticks for code blocks with language annotation:

```ts
const foo = "bar";
```

Use **bold** for key terms, *italics* for filenames or soft emphasis. Don’t overformat.

Links should be descriptive: `[Installation Guide]` — not `[click here]`. Use reference links for footnotes.

Images must include alt text: `![Architecture diagram](./diagram.png)`. Avoid decorative images without context.

Use `>` only for callouts, quotes, or tips. Don’t use them as layout decoration.

Align tables properly. Headers and rows should be readable with padded pipes (`|`).

Avoid disabling linters like `<!-- markdownlint-disable -->` unless truly necessary. Prefer fixing issues.

README files must contain:
- Clear title and status badges
- Concise description
- Table of contents (for long files)
- How to install, run, and test
- Usage examples (CLI, API, etc.)
- License and author info

Separate files for:
- `CHANGELOG.md`: semantic version entries (`Added`, `Changed`, etc.)
- `CONTRIBUTING.md`: clear steps to contribute
- `CODE_OF_CONDUCT.md`: if open source

Use `markdownlint`, `prettier`, or `mdformat` to automate formatting.

Be readable. Be informative. Be clean. Be Markdown.

## working with Kortex

When working on the Kortex codebase, adhere to the TypeScript Craftsmanship Standards outlined above. Focus on maintaining type safety, leveraging the context pattern for state management, and ensuring modularity in component design.