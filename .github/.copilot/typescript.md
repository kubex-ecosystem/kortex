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
