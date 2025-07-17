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

## TypeScript Craftsmanship Standards

1. **Type Safety**: Always prefer using TypeScript types and interfaces over `any`. Leverage the power of TypeScript to catch errors at compile time.

2. **Context Pattern**: Utilize the React Context API for managing global state. Define context types clearly and use them consistently throughout the application.

3. **Modular Architecture**: Organize components into reusable modules. Each component should have a single responsibility and be easy to test in isolation.

4. **Consistent Naming**: Follow a consistent naming convention for files, components, and variables. Use descriptive names that convey the purpose of the item.

5. **Documentation**: Document complex components and hooks with comments and examples. Use TypeScript's JSDoc support to provide type information in your documentation.

6. **Testing**: Write unit tests for components and hooks using a testing framework like Jest or Vitest. Ensure that tests cover both functionality and edge cases.

7. **Error Handling**: Implement robust error handling in asynchronous operations. Use try/catch blocks and consider using custom error classes for better clarity.

## working with Kortex

When working on the Kortex codebase, adhere to the TypeScript Craftsmanship Standards outlined above. Focus on maintaining type safety, leveraging the context pattern for state management, and ensuring modularity in component design. 