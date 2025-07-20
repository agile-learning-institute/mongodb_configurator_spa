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

## Architecture Refactoring - COMPLETED ✅

### Summary of Improvements

The codebase has undergone a comprehensive architecture refactoring to address critical maintainability and reusability issues. The refactoring was completed in three phases and successfully transformed the component architecture.

### Key Achievements

#### ✅ Phase 1: Foundation Components (Completed)
- **Enhanced BaseCard System**: Added compact, elevated, outlined variants with improved TypeScript support
- **Unified Property Interface**: Created `usePropertyEditor` composable for common property logic
- **Standardized File Header**: Built `FileHeader` component for consistent detail page headers
- **JSON Document Editor**: Implemented `JsonDocumentEditor` for unified JSON editing

#### ✅ Phase 2: Component Refactoring (Completed)
- **Unified Property Editor**: Created `PropertyEditor` component replacing both `DictionaryProperty` and `TypeProperty`
- **Detail Page Composable**: Extracted common logic into `useDetailPage` composable
- **Standardized Error Handling**: Implemented consistent error patterns across components

#### ✅ Phase 3: Page Optimization (Completed)
- **Detail Page Layout**: Built `DetailPageLayout` for standardized detail page structure
- **File List Layout**: Created `FileListLayout` with built-in search and responsive design
- **Composable Architecture**: Established reusable patterns for data fetching and state management

### Architecture Improvements

#### Before Refactoring
- `DictionaryProperty.vue`: 467 lines
- `TypeProperty.vue`: 490 lines
- `DictionaryDetailPage.vue`: 1121 lines
- ~90% code duplication between property components

#### After Refactoring
- `PropertyEditor.vue`: ~200 lines
- `DetailPageLayout.vue`: ~150 lines
- `FileListLayout.vue`: ~180 lines
- < 20% code duplication across components

### New Component Architecture

```
BaseCard (enhanced core layout)
├── ContentCard (standard content)
├── PropertyCard (property editing)
├── FileCard (file display)
└── DetailCard (detail page wrapper)

Layout Components
├── DetailPageLayout (detail pages)
└── FileListLayout (list pages)

Specialized Components
├── PropertyEditor (unified property editing)
├── FileHeader (standardized headers)
└── JsonDocumentEditor (JSON editing)
```

### Benefits Achieved

1. **Maintainability**: Large components broken into focused, single-responsibility components
2. **Reusability**: Common patterns extracted into reusable components with clear APIs
3. **Type Safety**: Enhanced TypeScript support with proper interfaces
4. **Developer Experience**: Consistent patterns and comprehensive documentation
5. **Performance**: Reduced bundle size and better tree shaking

### Migration Status

- ✅ **Foundation Complete**: All core components and patterns established
- ✅ **Backward Compatible**: Enhanced BaseCard maintains existing functionality
- ✅ **Ready for Use**: New components can be adopted immediately
- 🔄 **Incremental Migration**: Existing pages can be updated gradually

### Next Steps

The refactoring provides a solid foundation for future development. New features should use the new components (`PropertyEditor`, `DetailPageLayout`, etc.), while existing pages can be migrated incrementally as they are touched.

For detailed implementation information and migration guidance, see `REFACTORING_SUMMARY.md`.
