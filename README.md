# MongoDB Configurator SPA

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

### Error Handling
- **Method**: Event-based popup dialogs
- **Triggers**: All API 500 responses and processing events
- **Display**: Modal dialogs with event information
- **No retry mechanisms needed**

### State Management
- **Persistence**: Server-side only
- **Auto-save**: On each field update
- **No client-side state management needed**

### UI/UX
- **Navigation**: Collapsible hamburger menu
- **Theme**: Material Design defaults, no dark mode
- **Loading**: No spinners needed (local API is responsive)
- **Confirmations**: GitHub-style danger zone with case-sensitive typing

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
- Lock/unlock operations via `PUT` endpoints
- File listing via `GET` endpoints

### Database Operations
- `DELETE /api/database/` - Drop database (with GitHub-style confirmation)
- Processing operations via `POST` endpoints

### Error Handling
- All endpoints return 200 or 500 with Event objects
- 500 responses and processing events displayed in popup dialogs

Updated layouts.
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