# MongoDB Configurator SPA

A Vue 3 SPA for managing MongoDB schema configurations and processing operations. Supported by the [MongoDB Configurator API](https://github.com/agile-learning-institute/mongodb_configurator_api)

## Quick Start
UI served at localhost:8082

### 🧪 **Testing Quick Reference**
```bash
# Run all tests (headless)
npm run cy:run

# Interactive test runner
npm run cy:open

# Reset test environment
npm run api && npm run dev

# Test status: 22/22 tests passing ✅
# Coverage: All major pages and CRUD operations
# Execution time: ~35 seconds
```

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

# pull the latest published containers
npm run pull

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
- **E2E Tests**: Cypress (comprehensive coverage implemented)
- **API**: Live local API with playground data
- **Proxy**: /api/* requests to API host/port (runtime configurable)

### Cypress E2E Testing
The application has comprehensive Cypress end-to-end testing implemented with **22 passing tests** across all major application pages and functionality.

#### 🎯 **Testing Approach & Philosophy**
- **Test Isolation**: Each test creates its own data and cleans up after itself
- **Real API Integration**: Tests run against live local API with playground data
- **User-Centric**: Tests focus on real user workflows and interactions
- **Stable Selectors**: Uses `data-test` attributes for reliable element selection
- **Comprehensive Coverage**: Tests all CRUD operations, navigation, and edge cases

#### 📊 **Current Test Coverage**
- **App Smoke Tests**: Basic application loading and navigation
- **Configurations**: Full CRUD with complex version control testing
- **Dictionaries**: CRUD operations with lock/unlock functionality
- **Enumerators**: Enumeration management and editing
- **Migrations**: File operations and JSON editing
- **Test Data**: Document creation and management
- **Types**: Property editing with confirmation dialogs

#### 🏗️ **Test Architecture**
```bash
cypress/
├── e2e/                    # Test specifications
│   ├── app.smoke.cy.ts    # Basic app functionality
│   ├── configurations.cy.ts # Configuration management
│   ├── dictionaries.cy.ts  # Dictionary operations
│   ├── enumerators.cy.ts   # Enumerator management
│   ├── migrations.cy.ts    # Migration file operations
│   ├── test_data.cy.ts     # Test data management
│   └── types.cy.ts         # Type property editing
├── support/                # Custom commands and utilities
│   ├── commands.ts         # cy.getByTest, cy.resetApp, etc.
│   └── e2e.ts             # Global configuration
└── tsconfig.json           # TypeScript configuration
```

#### 🔧 **Key Testing Features**
- **Custom Commands**: `cy.getByTest()`, `cy.resetApp()`, `cy.interceptAlias()`
- **Test Isolation**: `before()` and `after()` hooks for setup/cleanup
- **API Interception**: `cy.intercept()` for reliable API call waiting
- **Dynamic Selectors**: Handles dynamic content with timestamp-based naming
- **Error Handling**: Tests both success and failure scenarios
- **State Management**: Verifies application state after operations

#### 🚀 **Running Tests**
```bash
# Development mode (interactive)
npm run cy:open

# CI mode (headless)
npm run cy:run

# Reset test environment
npm run api          # Reset API and database
npm run dev          # Start SPA in dev mode
```

#### 📝 **Test Data Management**
- **Unique Naming**: All test data uses timestamps (e.g., `TestType_${Date.now()}`)
- **Automatic Cleanup**: Tests clean up after themselves
- **Seed Data Protection**: Tests never modify existing seed data
- **Database Reset**: `npm run api` provides clean starting state

#### 🎭 **Testing Patterns**
```typescript
// Example test structure
describe('Page flow', () => {
  before(() => {
    cy.resetApp() // Reset to known state
  })

  it('can perform operation', () => {
    // Arrange: Navigate and setup
    cy.visit('/page')
    
    // Act: Perform the operation
    cy.getByTest('action-button').click()
    
    // Assert: Verify the result
    cy.getByTest('result-element').should('contain', 'expected')
  })
})
```

#### 🔍 **Selector Strategy**
- **Primary**: `data-test` attributes for all interactive elements
- **Fallback**: CSS classes for non-interactive elements
- **Dynamic**: Template literals for dynamic content (`file-card-${fileName}`)
- **Consistent**: Predictable naming convention across components

#### 📈 **Performance & Reliability**
- **Execution Time**: Full test suite runs in ~35 seconds
- **Stability**: Tests are designed to handle timing variations
- **Parallel Safe**: Tests can run in parallel without interference
- **CI Ready**: Optimized for continuous integration environments

#### 🔮 **Future Testing Roadmap**
- **Phase 9**: Cross-page user journey tests
- **Phase 10**: Hardening and flake reduction
- **Phase 11**: CI integration and automation
- **Phase 12**: Advanced testing features (visual regression, accessibility)

#### 📚 **Documentation**
- **CYPRESS.md**: Comprehensive testing plan and progress tracking
- **Test Comments**: Inline documentation for complex test scenarios
- **Custom Commands**: Well-documented reusable testing utilities
- **Examples**: Real-world testing patterns and best practices

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
- `POST /api/configurations/`