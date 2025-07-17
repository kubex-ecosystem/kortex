# Markdown Craftsmanship Standards

Use `#` for titles. Maintain hierarchy order (no skipping levels). Only one `#` per file (main title).

Separate paragraphs with blank lines. Avoid long lines (>120 chars). Keep spacing consistent.

Use `-` for unordered lists. Use `1.` only for ordered items. Always insert space after bullet.

Use single backticks for inline code: `` `example` ``. Use triple backticks for code blocks with language annotation:

```ts
const foo = "bar";
```

Use **bold** for key terms, *italics* for filenames or soft emphasis. Don’t overformat.

Links should be descriptive: `[Installation Guide](#installation)` — not `[click here]`. Use reference links for footnotes.

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
