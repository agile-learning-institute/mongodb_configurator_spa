# Stage0 MongoDB SPA

A Vue 3 SPA for managing MongoDB schema configurations and processing operations. Supported by the [MongoDB Configurator API](https://github.com/agile-learning-institute/mongodb_configurator_api)

## Quick Start
UI served at localhost:8082

## Developer Commands

```bash
# Install dependencies
npm install

# start the API and a testing database in containers. 
npm run api

# Start development server (requires API on localhost:8081)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Build Container for local testing before opening a PR
npm run container

# run the SPA as well as the backing services in local containers
npm run service

# shut down all of the containers after testing 
npm run down

```

## Architecture

### Tech Stack
- **Material Design** design system
- **Vue 3** + TypeScript + Composition API
- **Vuetify 3** for UI components
- **Vite** for build tooling
- **Vue Router** for navigation

## Technical Specifications

### Authentication
- **Method**: BUILT_AT config-based read-only vs read-write mode
- **Implementation**: Check `/api/config/` on startup, disable editing if not "Local"

### File Naming Conventions
- **Configurations**: Collection names (one word, no spaces) + `.yaml`
- **Dictionaries**: `collection_name.1.2.3.yaml` (versioned)
- **Types**: Simple names (one word, no spaces) + `.yaml`
- **Test Data**: No naming rules, simple JSON editor
- **Migrations**: No naming rules, JSON editor
- **Enumerators**: No naming rules

### Error Handling
- **Method**: Event-based popup dialogs
- **Triggers**: All API 500 responses and processing events
- **Display**: Modal dialogs with event information
- **No retry mechanisms needed**

### State Management
- **Persistence**: Server-side only
- **Auto-save**: On each field update (PUT after field change)
- **No client-side state management needed**

### UI/UX
- **Navigation**: Collapsible hamburger menu
- **Theme**: Material Design defaults, no dark mode
- **Loading**: No spinners needed (local API is responsive)
- **Confirmations**: GitHub-style danger zone with case-sensitive typing

### Complex Components
- **DictionaryProperty**: Collapsible nested properties, ready for drag-drop upgrade
- **TypeProperty**: Universal/typed primitives support
- **Circular References**: Handled by API, no client-side logic needed
- **JSON Editors**: Simple editors for large documents (test_data, migrations, indexes)

### Performance
- **Lists**: No pagination needed (small datasets)
- **Large Documents**: Simple JSON editors
- **Real-time**: No websockets, API is local and responsive

### Testing
- **Unit Tests**: Jest
- **E2E Tests**: Cypress
- **API**: Live local API with playground data
- **Proxy**: /api/* requests to API host/port (runtime configurable)

## Component Architecture

### Core Components
- **AppLayout**: Main application layout with collapsible navigation
- **FileCard**: Generic file information display with colored headers
- **FileList**: File listing component with full-width layout
- **ActionButton**: Reusable action button with confirmation
- **ConfirmationDialog**: GitHub-style danger zone confirmation
- **EventDialog**: Event-based error/processing display
- **JsonEditor**: Simple JSON editor for large documents

### Complex Components
- **DictionaryProperty**: Most complex - handles ref, enum, object, array types with collapsible nesting
- **TypeProperty**: Second most complex - handles universal/typed primitives
- **ConfigurationVersion**: Version management with schema download
- **EventCard**: Event display with sub-events in popup
- **DocumentEditor**: JSON document editing for test data

### Pages
- **WelcomePage**: Instructions for empty configurations
- **AdminPage**: Configuration items display
- **ConfigurationsPage**: Configuration file listing with collection name validation
- **ConfigurationDetailPage**: Configuration version management
- **DictionariesPage**: Dictionary file listing with versioned naming
- **DictionaryDetailPage**: Dictionary property editing with auto-save
- **TypesPage**: Type file listing with simple naming
- **TypeDetailPage**: Type property editing with auto-save
- **TestDataPage**: Test data file listing
- **TestDataDetailPage**: Document editing with JSON editor
- **EnumeratorsPage**: Enumerator listing
- **EnumeratorDetailPage**: Enumeration editing
- **EventsPage**: Event monitoring with popup dialogs

## API Integration Points

### Configuration Management
- `GET /api/config/` - App startup configuration (BUILT_AT check)
- `GET /api/configurations/` - List configurations
- `POST /api/configurations/` - Process all configurations
- `GET /api/configurations/{file_name}/` - Get specific configuration
- `POST /api/configurations/collection/{name}` - Create new collection

### Schema Rendering
- `GET /api/configurations/json_schema/{file_name}/{version}/` - Download JSON schema
- `GET /api/configurations/bson_schema/{file_name}/{version}/` - Download BSON schema

### File Management
- All resource types: `GET`, `PUT`, `DELETE` operations with auto-save
- Lock/unlock operations via `PATCH` endpoints
- File listing via `GET` endpoints

### Database Operations
- `DELETE /api/database/` - Drop database (with GitHub-style confirmation)
- Processing operations via `POST` endpoints

### Error Handling
- All endpoints return 200 or 500 with Event objects
- 500 responses and processing events displayed in popup dialogs

## Architecture Review & Remediation Plan

### Current State Analysis

#### Critical Issues Identified

1. **Massive Component Files**: 
   - `DictionaryProperty.vue` (467 lines)
   - `TypeProperty.vue` (490 lines) 
   - `DictionaryDetailPage.vue` (1121 lines)
   - These violate single responsibility principle

2. **Code Duplication**:
   - `DictionaryProperty` and `TypeProperty` share ~90% identical code
   - Detail pages have repetitive header patterns (lock/delete buttons)
   - File listing patterns repeated across multiple pages

3. **Poor Separation of Concerns**:
   - Property components handle both UI and business logic
   - Detail pages mix data fetching, state management, and UI rendering
   - No clear abstraction for common patterns

4. **Inconsistent Component Architecture**:
   - Some components use slots, others use props
   - Mixed patterns for event handling
   - No standardized approach to styling variants

5. **Missing Abstractions**:
   - No base detail page component
   - No unified property editing interface
   - No standardized file header component

#### Component Architecture Issues

1. **BaseCard Limitations**:
   - Only supports light/dark variants
   - No support for different content layouts
   - Limited customization options

2. **Property Components**:
   - Massive files with complex conditional rendering
   - Business logic mixed with presentation
   - No clear type system for property types

3. **Detail Pages**:
   - Repetitive patterns not abstracted
   - Inconsistent error handling
   - Mixed concerns (data fetching + UI)

### Remediation Strategy

#### Phase 1: Foundation Components (Week 1)

1. **Enhanced BaseCard System**
   ```typescript
   // New component hierarchy:
   BaseCard (core layout)
   ├── ContentCard (standard content)
   ├── PropertyCard (property editing)
   ├── FileCard (file display)
   └── DetailCard (detail page wrapper)
   ```

2. **Unified Property Interface**
   ```typescript
   interface PropertyEditor {
     property: Property
     disabled?: boolean
     excludeType?: string
     topLevel?: boolean
     onUpdate: (property: Property) => void
     onDelete?: () => void
   }
   ```

3. **Standardized Detail Page Layout**
   ```typescript
   interface DetailPageProps {
     title: string
     icon: string
     loading: boolean
     error?: string
     locked?: boolean
     onLock?: () => void
     onUnlock?: () => void
     onDelete?: () => void
   }
   ```

#### Phase 2: Component Refactoring (Week 2)

1. **Extract Common Property Logic**
   - Create `usePropertyEditor` composable
   - Separate UI components from business logic
   - Standardize property type handling

2. **Unified File Header Component**
   ```vue
   <FileHeader
     :title="title"
     :locked="locked"
     :editing="editing"
     @lock="handleLock"
     @unlock="handleUnlock"
     @delete="handleDelete"
     @edit="handleEdit"
   />
   ```

3. **Standardized JSON Editor**
   - Extract common JSON editing patterns
   - Create reusable `JsonDocumentEditor`
   - Standardize error handling

#### Phase 3: Page Optimization (Week 3)

1. **Base Detail Page Component**
   - Abstract common detail page patterns
   - Standardize loading/error states
   - Unified action handling

2. **List Page Optimization**
   - Extract common file listing patterns
   - Standardize file card usage
   - Unified search/filter functionality

3. **Composable Extraction**
   - `useDetailPage` for common detail page logic
   - `useFileList` for list page patterns
   - `usePropertyEditing` for property editing

#### Phase 4: Advanced Features (Week 4)

1. **Type-Safe Property System**
   - Define strict property type interfaces
   - Type-safe property editors
   - Validation integration

2. **Theme System Enhancement**
   - CSS custom properties for theming
   - Dark/light mode support
   - Component variant system

3. **Performance Optimization**
   - Lazy loading for large property trees
   - Virtual scrolling for long lists
   - Memoization for expensive computations

### Implementation Plan

#### Week 1: Foundation
- [x] Create enhanced BaseCard variants
- [x] Implement unified property interface
- [x] Build standardized detail page layout
- [x] Extract common file header component

#### Week 2: Component Refactoring  
- [x] Refactor DictionaryProperty and TypeProperty
- [x] Create usePropertyEditor composable
- [x] Implement unified JSON editor
- [x] Standardize error handling patterns

#### Week 3: Page Optimization
- [x] Create base detail page component
- [x] Optimize list pages
- [x] Extract common composables
- [x] Standardize data fetching patterns

#### Week 4: Advanced Features
- [ ] Implement type-safe property system
- [ ] Enhance theme system
- [ ] Performance optimizations
- [ ] Final testing and documentation

### Success Metrics

1. **Code Quality**:
   - No component > 200 lines
   - < 20% code duplication
   - 100% TypeScript coverage

2. **Maintainability**:
   - Clear component hierarchy
   - Standardized patterns
   - Comprehensive documentation

3. **Developer Experience**:
   - Consistent API across components
   - Clear prop interfaces
   - Intuitive component composition

4. **Performance**:
   - < 100ms component render times
   - Efficient re-rendering
   - Minimal bundle size impact

### Risk Mitigation

1. **Incremental Migration**: Refactor one component at a time
2. **Backward Compatibility**: Maintain existing APIs during transition
3. **Comprehensive Testing**: Ensure no functional regressions
4. **Documentation**: Update docs with each change

This refactoring will transform the codebase from a collection of large, tightly-coupled components into a maintainable, reusable component library that supports future feature development with minimal code changes.
