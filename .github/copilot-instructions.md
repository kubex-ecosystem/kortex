# Kortex - LookAtni System Instructions

## Project Overview
Kortex is a **code packaging and extraction system** called "LookAtni" that uses unique file markers (`/// path/file ///`) to bundle multiple files into a single text file and extract them back to recreate directory structures. Think of it as a sophisticated code archiving system for AI workflows.

## Core Architecture

### LookAtni Workflow
1. **Generate**: `./scripts/generate-markers.sh` scans directories and creates text files with embedded file markers
2. **Extract**: `./scripts/extract-files.sh` parses marked text files and recreates the original file structure
3. **Demo**: `./scripts/demo.sh` provides interactive demonstrations

### Key Components
- **`scripts/`**: Core LookAtni tooling (generate-markers.sh, extract-files.sh, demo.sh)
- **`src/`**: React app for testing the system (Vite + React 18)
- **Demo files**: `demo-code.txt`, `test-code.txt` - examples of marked code
- **`test-extracted/`, `demo-extracted/`**: Output directories for extracted projects

## File Marker Format
```
/// path/to/file.ext ///
[file content here]

/// another/file.js ///
[file content here]
```

## Critical Developer Workflows

### Creating a Code Package
```bash
# Generate markers from existing project
./scripts/generate-markers.sh ./src project-code.txt --exclude node_modules

# With specific patterns
./scripts/generate-markers.sh . output.txt --include "*.js" --include "*.ts"
```

### Extracting Code Package
```bash
# Basic extraction
./scripts/extract-files.sh project-code.txt ./new-project

# With validation and stats
./scripts/extract-files.sh code.txt ./dest --dry-run --stats
```

### React Development
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview build
```

## Project-Specific Patterns

### Script Options Philosophy
All scripts follow consistent CLI patterns:
- **Dry-run mode**: `--dry-run` for safe testing
- **Interactive mode**: `--interactive` for step-by-step control  
- **Verbose output**: `--verbose` and `--stats` for detailed feedback
- **Color-coded output**: Green for success, Red for errors, Yellow for warnings

### File Exclusion Strategy
Default exclusions in generate-markers.sh:
- `node_modules/`, `.git/`, build artifacts
- Files over 1000KB (configurable with `--max-size`)
- Common binary and cache directories

### Error Handling Pattern
Scripts validate markers format before processing:
```bash
# New format: /// file.js ///
# Old format: //=== file.js === (deprecated)
```

## Integration Points

### React Component Structure
- **Header component**: Reusable with props (`title`)
- **App.jsx**: Main entry point, imports from `./components/`
- **CSS co-location**: Each component has its own CSS file

### Build System
- **Vite**: Modern build tool with React plugin
- **Export mode**: `output: 'export'` for static generation
- **Tailwind**: Available but minimal usage detected

## Key Files to Reference

- **`scripts/extract-files.sh`**: Main extraction logic with comprehensive error handling
- **`scripts/generate-markers.sh`**: Directory scanning and marker generation
- **`package.json`**: Simple React setup with Vite tooling
- **Demo files**: See `demo-code.txt` and `test-code.txt` for marker format examples

## Development Notes

- Test changes with `--dry-run` before actual extraction
- Use `tree` command or `find` for directory structure verification
- The system handles nested directories automatically
- Portuguese comments and output are intentional (Brazilian Portuguese locale)
