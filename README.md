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
- **FileCard**: Generic file information display
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

## Progress

### Phase 1: Foundation & Planning ✅
- ✅ Requirements analysis complete
- ✅ OpenAPI specification reviewed
- ✅ Implementation plan created with detailed specifications
- ✅ Component architecture designed
- ✅ Technical specifications documented

### Phase 2: Teardown & Reset ✅
- [x] **Step 2.1**: Tear down current repo to hello world with no backing services
- [x] **Step 2.2**: Docker-compose already correctly configured with playground mount
- [x] **Step 2.3**: Verify `npm run dev` and `npm run container` work successfully
- [x] **Step 2.4**: Package.json scripts updated with api, service, and down commands
- [x] **Step 2.5**: API proxy already configured in vite.config.ts for /api/* requests
- [x] **Step 2.6**: NGINX config and environment variable substitution fixed; containerized SPA now serves hello world page successfully

### Phase 3: Core Infrastructure ✅
- [x] **Step 3.1**: Set up API client with axios and environment-based configuration
- [x] **Step 3.2**: Implement BUILT_AT config-based read-only/read-write mode
- [x] **Step 3.3**: Create base layout with collapsible navigation and admin panel
- [x] **Step 3.4**: Implement routing structure for all pages
- [x] **Step 3.5**: Create base card components and action system
- [x] **Step 3.6**: Set up event-based error handling with popup dialogs

### Phase 4: File Management System 🚧
- [ ] **Step 4.1**: Implement file listing and management for all resource types
- [ ] **Step 4.2**: Create file CRUD operations with auto-save on field changes
- [ ] **Step 4.3**: Implement lock/unlock functionality
- [ ] **Step 4.4**: Add GitHub-style confirmation dialogs for destructive actions
- [ ] **Step 4.5**: Implement welcome page for empty configurations
- [ ] **Step 4.6**: Add file naming validation (collection names, versioned names, etc.)

### Phase 5: Configuration Management 🚧
- [ ] **Step 5.1**: Build configuration file management with collection name validation
- [ ] **Step 5.2**: Implement configuration version management
- [ ] **Step 5.3**: Add schema download functionality (JSON/BSON as files)
- [ ] **Step 5.4**: Create processing operations interface
- [ ] **Step 5.5**: Implement "new collection" endpoint integration
- [ ] **Step 5.6**: Add JSON editor for indexes property in ConfigurationVersion

### Phase 6: Dictionary & Type System 🚧
- [ ] **Step 6.1**: Build dictionary property editor with collapsible nested properties
- [ ] **Step 6.2**: Implement type property editor for universal/typed primitives
- [ ] **Step 6.3**: Add ref, enum, and one_of functionality
- [ ] **Step 6.4**: Create object/array property management
- [ ] **Step 6.5**: Implement required/additional properties toggles
- [ ] **Step 6.6**: Add versioned naming validation for dictionary files

### Phase 7: Data Management 🚧
- [ ] **Step 7.1**: Build test data file management with simple JSON editor
- [ ] **Step 7.2**: Implement document editor for test data
- [ ] **Step 7.3**: Create migration file management with JSON editor
- [ ] **Step 7.4**: Add enumerator management system
- [ ] **Step 7.5**: Implement enumeration key-value editing
- [ ] **Step 7.6**: Add type file naming validation

### Phase 8: Processing & Events 🚧
- [ ] **Step 8.1**: Create event monitoring system with popup dialogs
- [ ] **Step 8.2**: Implement processing status tracking
- [ ] **Step 8.3**: Build event modal dialogs for all 500 responses
- [ ] **Step 8.4**: Add sub-event display functionality
- [ ] **Step 8.5**: Implement error handling and display
- [ ] **Step 8.6**: Add event-based processing output display

### Phase 9: Database Operations 🚧
- [ ] **Step 9.1**: Implement "Process All" functionality
- [ ] **Step 9.2**: Add "Drop Database" with GitHub-style confirmation
- [ ] **Step 9.3**: Create database health monitoring
- [ ] **Step 9.4**: Implement configuration validation
- [ ] **Step 9.5**: Add bulk operations (lock all, etc.)
- [ ] **Step 9.6**: Add case-sensitive typing confirmations for destructive actions

### Phase 10: Polish & Testing 🚧
- [ ] **Step 10.1**: Implement comprehensive error handling with event popups
- [ ] **Step 10.2**: Add auto-save functionality for all editor pages
- [ ] **Step 10.3**: Create responsive design for mobile
- [ ] **Step 10.4**: Implement Jest unit tests and Cypress E2E tests
- [ ] **Step 10.5**: Performance optimization and final polish
- [ ] **Step 10.6**: Configure live API testing with playground data
