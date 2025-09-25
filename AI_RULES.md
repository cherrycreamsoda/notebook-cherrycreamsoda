# AI Development Rules - Notebook App

## Tech Stack Overview

- **Framework**: Next.js 15.5.2 with App Router and React 19.1.0
- **Styling**: CSS Modules only - NO Tailwind CSS
- **Database**: MongoDB with Mongoose ODM for data persistence
- **Icons**: Lucide React for consistent iconography throughout the app
- **State Management**: React hooks with custom context providers
- **API**: Next.js API routes with RESTful endpoints only
- **JavaScript**: Pure JavaScript only - NO TypeScript
- **Build Tool**: Next.js built-in bundler with Turbopack for development

## Strict Library Usage Rules

### ✅ Allowed Dependencies (from package.json ONLY)

1. **React & Next.js**: Use Next.js App Router and API routes exclusively
2. **CSS Modules**: Only CSS modules for styling - NO Tailwind classes
3. **Lucide React**: Use for icons only
4. **Mongoose**: Use for database operations only
5. **Prop-types**: Use for runtime type checking

### 🚫 Absolutely Prohibited

1. **NO Tailwind CSS**: Use CSS modules exclusively
2. **NO TypeScript**: Use pure JavaScript only
3. **NO external UI libraries**: Build all components from scratch
4. **NO additional dependencies**: Use ONLY what's in package.json
5. **NO shortcuts**: Write complete, full code always

### Component Development Rules

1. **Complete Implementation**: Every component must be fully implemented with no placeholders
2. **CSS Modules Only**: All styling must use CSS modules with proper class names
3. **Pure JavaScript**: No TypeScript types or interfaces
4. **Error Handling**: Implement proper error boundaries and validation
5. **Accessibility**: All components must be accessible with proper ARIA labels

### API Development Rules

1. **Next.js API Routes Only**: Use App Router API routes exclusively
2. **RESTful Patterns**: Follow REST conventions for all endpoints
3. **Mongoose Validation**: Use Mongoose schema validation for all data
4. **Error Responses**: Return proper HTTP status codes and error messages
5. **Security**: Implement proper input validation and sanitization

### Styling Rules

1. **CSS Modules Exclusively**: No inline styles or Tailwind classes
2. **Modular CSS**: Each component has its own CSS module file
3. **Consistent Naming**: Use BEM or similar naming conventions
4. **Responsive Design**: All components must be fully responsive
5. **Dark Theme Support**: Maintain dark theme compatibility

### Performance Rules

1. **Code Splitting**: Use dynamic imports for heavy components
2. **Memoization**: Use React.memo and useMemo appropriately
3. **Debouncing**: Implement debouncing for search and input operations
4. **Caching**: Use proper caching strategies for API calls
5. **Bundle Optimization**: Keep bundle size minimal

### File Structure Conventions

```
src/
├── components/          # Reusable UI components with CSS modules
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── styles/             # Global styles and CSS modules
└── app/                # Next.js app directory structure
    ├── api/            # API routes only
    └── [pages]/        # App router pages
```

### Code Quality Standards

1. **ESLint Compliance**: Follow strict linting rules
2. **Proper Formatting**: Consistent code formatting throughout
3. **Complete Documentation**: Document complex logic thoroughly
4. **Meaningful Names**: Use descriptive variable and function names
5. **No Assumptions**: Verify every import and dependency

### Version Control Rules

1. **Complete Commits**: Each commit must contain fully functional code
2. **No Partial Implementations**: Never commit incomplete features
3. **Proper Testing**: All changes must be tested before committing
4. **Documentation Updates**: Update documentation with code changes
5. **Code Review**: All changes require thorough code review

## Zero Tolerance Policies

1. **NO "// TODO" comments**: Implement features completely or not at all
2. **NO placeholder code**: Every line must be functional and intentional
3. **NO dependency additions**: Use only package.json dependencies unless explicitly approved
4. **NO TypeScript**: JavaScript only throughout the codebase
5. **NO Tailwind**: CSS modules exclusively for styling

## Development Philosophy

- **Think Deep**: Consider edge cases and performance implications
- **Write Complete**: Every component and function must be fully implemented
- **Verify Everything**: Check all imports, dependencies, and functionality
- **No Shortcuts**: Implement features properly or not at all
- **Quality First**: Prioritize code quality over development speed
