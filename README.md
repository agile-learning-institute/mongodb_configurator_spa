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

### Unified Property Editor System
The application now uses a unified property editing system that handles all property types with polymorphic rendering:

```
PropertyEditor (main component)
├── Property Type Editors (polymorphic based on type)
│   ├── ArrayPropertyEditor
│   ├── ObjectPropertyEditor
│   ├── SimplePropertyEditor
│   ├── ComplexPropertyEditor
│   ├── EnumPropertyEditor
│   ├── EnumArrayPropertyEditor
│   ├── RefPropertyEditor
│   ├── ConstantPropertyEditor
│   ├── CustomPropertyEditor
│   └── OneOfPropertyEditor
└── Inline Editing (name, description, type, required)
```

### Core Components
- **PropertyEditor**: Unified property editing with polymorphic type rendering
- **HelpDialog**: Help content display with rich formatting
- **FileList**: File listing with "Lock All" functionality
- **FileCard**: Generic file information display
- **EventDialog**: Event-based error/processing display
- **JsonDocumentEditor**: JSON document editing for test data and migrations

### Layout Components
- **AppLayout**: Main application layout with collapsible navigation
- **DetailPageLayout**: Standardized detail page layout
- **FileListLayout**: File listing layout

### Pages
- **WelcomePage**: Landing page with help carousel
- **ConfigurationsPage**: Configuration file listing
- **ConfigurationDetailPage**: Configuration version management
- **DictionariesPage**: Dictionary file listing
- **DictionaryDetailPage**: Dictionary property editing with unified PropertyEditor
- **TypesPage**: Type file listing
- **TypeDetailPage**: Type property editing with unified PropertyEditor
- **TestDataPage**: Test data file listing
- **TestDataDetailPage**: Document editing with JSON editor
- **EnumeratorsPage**: Enumerator listing
- **EnumeratorDetailPage**: Enumeration editing
- **EventsPage**: Event monitoring with popup dialogs

## Type System

### Property Types
The application supports a comprehensive type system that matches the OpenAPI schema exactly:

- **Array**: Lists of values with configurable item types
- **Object**: Structured objects with properties and additional properties toggle
- **Simple**: JSON schema definitions
- **Complex**: Dual JSON/BSON schema definitions
- **Enum**: Enumerated values with enum name reference
- **Enum Array**: Arrays of enumerated values
- **Reference**: References to other type files
- **Constant**: Fixed values
- **Custom**: Custom type definitions
- **One Of**: Union types with multiple property options

### Type Restrictions
- **Dictionary Properties**: Cannot use `simple` or `complex` types
- **Type Properties**: Only support `simple`, `complex`, `object`, `array`, and `custom` types

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

## Help System

### Help Content
The application includes comprehensive help content for all major features:

- **Welcome**: Getting started guide and feature overview
- **Configurations**: Collection configuration management
- **Dictionaries**: Data dictionary creation and editing
- **Types**: Custom type definitions
- **Enumerators**: Enum value management
- **Test Data**: Sample data generation
- **Migrations**: Data transformation scripts

### Help Access
- Help carousel on the landing page
- Help buttons on each major page
- Contextual help dialogs with rich formatting

## Performance Optimizations

### Lazy Loading
- Property type editors use `defineAsyncComponent` for lazy loading
- Complex property types are loaded only when needed
- Improved initial page load times

### Component Reusability
- Unified PropertyEditor reduces code duplication
- Shared composables for common functionality
- Type-safe interfaces prevent runtime errors

### Responsive Design
- Mobile-friendly grid layouts
- Collapsible sections for complex properties
- Touch-friendly interface elements

## Development Workflow

### Component Development
1. **Property Types**: Add new property type editors in `src/components/property-types/`
2. **Type Safety**: Update type definitions in `src/types/types.ts`
3. **Help Content**: Add help content in `src/composables/useHelp.ts`
4. **Testing**: Write unit tests for new components

### API Integration
1. **Endpoints**: Add new API endpoints in `src/utils/api.ts`
2. **Types**: Update type definitions to match API schema
3. **Error Handling**: Implement proper error handling for new endpoints

### Styling
1. **Material Design**: Follow Vuetify 3 design patterns
2. **Responsive**: Ensure mobile compatibility
3. **Theming**: Use the established color scheme

## Recent Refactor

The application has undergone a comprehensive refactor to improve maintainability and user experience:

### Key Improvements
- **Unified Property Editor**: Single component handles all property types
- **Type Safety**: Exact match to OpenAPI schema with TypeScript interfaces
- **Performance**: Lazy loading and optimized rendering
- **Help System**: Comprehensive help content and contextual assistance
- **API Integration**: Removed GET after PUT patterns, improved error handling
- **File Operations**: Added "Lock All" functionality for supported file types

### Migration Guide
- **Legacy Components**: All Type* and Dictionary* components have been replaced
- **Property Editing**: Use the new PropertyEditor component for all property editing
- **Type Definitions**: Updated to match new API schema exactly
- **Help Content**: Comprehensive help system available throughout the application