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

### Recent Major Refactor
The application has undergone a comprehensive refactor to improve maintainability and user experience:

#### Key Improvements
- **Unified Property Editor**: Single component handles all property types with polymorphic rendering
- **Type Safety**: Exact match to OpenAPI schema with comprehensive TypeScript interfaces
- **Performance**: Lazy loading and optimized rendering with `defineAsyncComponent`
- **Help System**: Comprehensive help carousel and contextual assistance
- **API Integration**: Improved error handling and state management
- **File Operations**: Added "Lock All" functionality for supported file types

#### Migration Guide
- **Legacy Components**: All Type* and Dictionary* components have been replaced
- **Property Editing**: Use the new PropertyEditor component for all property editing
- **Type Definitions**: Updated to match new API schema exactly
- **Help Content**: Comprehensive help system available throughout the application

## Technical Specifications

### Error Handling
- **Method**: Event-based popup dialogs with EventDialog component
- **Triggers**: All API 500 responses and processing events
- **Display**: Modal dialogs with event information and expandable details
- **No retry mechanisms needed**
- **Router State**: Complex event data passed via router state instead of query parameters

### State Management
- **Persistence**: Server-side only
- **Auto-save**: On each field update with PUT requests returning updated documents
- **No client-side state management needed**
- **Router State**: Used for passing complex data between pages (event details, etc.)

### UI/UX
- **Navigation**: Collapsible hamburger menu with help button in app bar
- **Theme**: Material Design defaults with comfortable density settings
- **Loading**: No spinners needed (local API is responsive)
- **Confirmations**: GitHub-style danger zone with case-sensitive typing
- **Help System**: Contextual help carousel accessible from app bar and navigation

### Performance
- **Lists**: No pagination needed (small datasets)
- **Large Documents**: Simple JSON editors
- **Real-time**: No websockets, API is local and responsive
- **Lazy Loading**: Property type editors loaded on demand

### Testing
- **Unit Tests**: Jest
- **E2E Tests**: Cypress
- **API**: Live local API with playground data
- **Proxy**: /api/* requests to API host/port (runtime configurable)

## Component Architecture

### Unified Property Editor System
The application now uses a unified property editing system that handles all property types with polymorphic rendering:

```
PropertyEditor (main orchestrator)
├── BasePropertyEditor (common header elements)
│   ├── Name, Description, Type, Required, Delete
│   └── Extension slot for type-specific controls
├── Type-Specific Extensions
│   ├── ArrayPropertyExtension (items type picker)
│   ├── ObjectPropertyExtension (add property, additional props, show/hide)
│   ├── ArrayOfObjectExtension (array + object functionality)
│   └── ArrayOfArrayExtension (nested array handling)
├── Conditional Body Rendering
│   ├── Object properties list (for object types)
│   ├── Array item editor (for array of object/array)
│   └── No body (for simple/complex/custom types)
└── usePropertyTypeEditor composable (shared logic)
```

### Component Architecture Benefits
- **Modular Design**: Each extension handles specific functionality
- **Reusable Components**: BasePropertyEditor used across all property types
- **Clean Separation**: Header controls vs. body content clearly separated
- **Easy Maintenance**: Add new property types by creating new extensions
- **Type Safety**: Full TypeScript support with proper type guards

### Core Components
- **PropertyEditor**: Main orchestrator for all property editing with polymorphic rendering
- **BasePropertyEditor**: Common header component with name, description, type, required, delete
- **Type Extensions**: Specialized components for different property types:
  - `ArrayPropertyExtension`: Items type picker for arrays
  - `ObjectPropertyExtension`: Object-specific actions (add property, additional props, show/hide)
  - `ArrayOfObjectExtension`: Array of object functionality
  - `ArrayOfArrayExtension`: Nested array handling with recursion
- **TypeChipPicker**: Chip-based type selection with custom types integration
- **FileList**: File listing with "Lock All" functionality and compact cards
- **FileCard**: Compact file information display with single-line layout
- **EventCard**: Event display with expandable sub-events and prominent IDs
- **EventDialog**: Simplified event-based error/processing display
- **JsonDocumentEditor**: JSON document editing for test data and migrations
- **BaseCard**: Reusable card component with title and header-actions slots

### Layout Components
- **AppLayout**: Main application layout with collapsible navigation and help button
- **DetailPageLayout**: Standardized detail page layout
- **FileListLayout**: File listing layout with "Lock All" integration

### Pages
- **WelcomePage**: Landing page with help carousel and comprehensive overview
- **ConfigurationsPage**: Configuration file listing with auto-navigation to new collections
- **ConfigurationDetailPage**: Configuration version management
- **DictionariesPage**: Dictionary file listing
- **DictionaryDetailPage**: Dictionary property editing with unified PropertyEditor
- **TypesPage**: Type file listing
- **TypeDetailPage**: Type property editing with unified PropertyEditor
- **TestDataPage**: Test data file listing
- **TestDataDetailPage**: Document editing with JSON editor
- **EnumeratorsPage**: Enumerator listing
- **EnumeratorDetailPage**: Enumeration editing
- **EventViewerPage**: Detailed event viewing with state management
- **AdminPage**: Database management and system operations

## Type System

### Property Types
The application supports a comprehensive type system that matches the OpenAPI schema exactly:

- **Array**: Lists of values with configurable item types
- **Object**: Structured objects with properties and additional properties toggle
- **Simple**: JSON schema definitions with validation
- **Complex**: Dual JSON/BSON schema definitions with validation
- **Enum**: Enumerated values with enum name reference
- **Enum Array**: Arrays of enumerated values
- **Reference**: References to other type files
- **Constant**: Fixed values
- **Custom**: Custom type definitions
- **One Of**: Union types with multiple property options

### Type Restrictions
- **Dictionary Properties**: Cannot use `simple` or `complex` types
- **Type Properties**: Only support `simple`, `complex`, `object`, `array`, and `custom` types

### Type Guards
Comprehensive TypeScript type guards ensure type safety:
- `isArrayProperty()`, `isObjectProperty()`, `isSimpleProperty()`, etc.
- Prevents runtime errors when accessing type-specific properties
- Enables polymorphic rendering with confidence

## API Integration Points

### Configuration Management
- `GET /api/config/` - App startup configuration (BUILT_AT check)
- `GET /api/configurations/` - List configurations
- `POST /api/configurations/` - Process all configurations
- `GET /api/configurations/{file_name}.yaml/` - Get specific configuration (with .yaml extension)
- `POST /api/configurations/collection/{name}` - Create new collection

### Schema Rendering
- `GET /api/configurations/json_schema/{file_name}/{version}/` - Download JSON schema
- `GET /api/configurations/bson_schema/{file_name}/{version}/` - Download BSON schema

### File Management
- All resource types: `GET`, `PUT`, `DELETE` operations with auto-save
- Lock/unlock operations via `PUT` endpoints
- File listing via `GET` endpoints
- "Lock All" functionality for supported file types

### Database Operations
- `DELETE /api/database/` - Drop database (with GitHub-style confirmation)
- Processing operations via `POST` endpoints

### Error Handling
- All endpoints return 200 or 500 with Event objects
- 500 responses and processing events displayed in popup dialogs
- Event data passed via router state for complex information

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
- **Admin**: Database and system management

### Help Access
- Help carousel on the landing page with navigation controls
- Contextual help button in app bar (?) that opens appropriate carousel slide
- Dynamic help content based on current page context
- Comprehensive overview with detailed feature explanations

## Recent UI/UX Improvements

### Type Editor System Overhaul (Latest)
- **Unified Property Editor**: Single `PropertyEditor` component handles all property types with polymorphic rendering
- **Base Property Editor**: `BasePropertyEditor` provides common header elements (name, description, type, required, delete)
- **Type-Specific Extensions**: Specialized extension components for different property types:
  - `ArrayPropertyExtension`: Items type picker for arrays
  - `ObjectPropertyExtension`: Add property, additional properties toggle, show/hide chevron
  - `ArrayOfObjectExtension`: Combines array and object functionality for array of object
  - `ArrayOfArrayExtension`: Handles nested arrays with natural recursion
- **Smart Body Rendering**: Conditional body display based on property type and items type
- **Array of Object Support**: Full object property management within array items
- **Array of Array Support**: Recursive nested array editing with type selector hidden
- **Locking Behavior**: Read-only inputs (not dimmed) with hidden action icons when locked
- **Tooltip System**: Comprehensive tooltips for all action icons with proper color contrast

### Property Editor Features
- **Type Chip Picker**: Replaced dropdown with chip-based type selection
- **Custom Types Integration**: Fetches and displays custom types from API (`GET /api/types/`)
- **Type Restrictions**: Root properties (Array, Object, Simple, Complex), non-root (Array, Object, Custom)
- **Required Field**: Material Design checkbox icon with tooltip
- **Action Icons**: Plus (add property), toggle (additional properties), chevron (show/hide)
- **Collapsible Properties**: Show/hide functionality for object properties (UI state only)
- **No Properties Message**: Helpful message with plus icon for empty object properties

### File List Enhancements
- **Compact File Cards**: Reduced vertical space, single-line layout
- **Right-Aligned Statistics**: Created/Updated/Size info aligned to the right
- **Improved Typography**: Page titles (H3), file names (H4)
- **Better Sorting**: Always sorted by file name
- **Lock All Integration**: Positioned on same row as page title

### Event System Improvements
- **Enhanced Event Cards**: Removed duplicate type display, increased ID prominence
- **Better Expand/Collapse**: More pronounced buttons with text and icons
- **Cleaner UI**: Removed unnecessary remove buttons from top-level events
- **Simplified Dialogs**: Streamlined EventDialog for delete/error operations
- **Auto-Navigation**: Process All button opens event details page

### Workflow Enhancements
- **Auto-Navigation**: New collections automatically navigate to detail page
- **Seamless Experience**: Immediate access to new collection configuration
- **State Management**: Improved router state handling for complex data
- **Error Handling**: Streamlined notifications and user feedback

## Performance Optimizations

### Lazy Loading
- Property type editors use `defineAsyncComponent` for lazy loading
- Complex property types are loaded only when needed
- Improved initial page load times

### Component Reusability
- Unified PropertyEditor reduces code duplication
- Shared composables for common functionality (`usePropertyTypeEditor`, `useFiles`, `useEvents`)
- Type-safe interfaces prevent runtime errors

### Responsive Design
- Mobile-friendly grid layouts
- Collapsible sections for complex properties
- Touch-friendly interface elements
- Comfortable density settings for better usability

## Development Workflow

### Component Development
1. **Property Types**: Add new property type editors in `src/components/property-types/`
2. **Type Safety**: Update type definitions in `src/types/types.ts` with proper type guards
3. **Help Content**: Add help content in `src/composables/useHelp.ts`
4. **Testing**: Write unit tests for new components

### API Integration
1. **Endpoints**: Add new API endpoints in `src/utils/api.ts` with proper error handling
2. **Types**: Update type definitions to match API schema exactly
3. **Error Handling**: Implement proper error handling for new endpoints
4. **File Extensions**: Ensure proper file extensions (.yaml) for configuration endpoints

### Styling
1. **Material Design**: Follow Vuetify 3 design patterns
2. **Responsive**: Ensure mobile compatibility
3. **Theming**: Use the established color scheme and comfortable density

### Key Files to Understand
- `src/types/types.ts`: Complete type system with type guards
- `src/components/PropertyEditor.vue`: Main property editing component
- `src/composables/usePropertyTypeEditor.ts`: Shared property editing logic
- `src/utils/api.ts`: All API endpoints and error handling
- `src/pages/WelcomePage.vue`: Help carousel implementation
- `src/components/AppLayout.vue`: Main layout with navigation and help system