# MongoDB Configurator SPA

A Vue 3 SPA for managing MongoDB schema configurations and processing operations. Supported by the [MongoDB Configurator API](https://github.com/agile-learning-institute/mongodb_configurator_api)

## Quick Start
```bash
npm run service
# UI served at localhost:8082
```

### 🧪 **Testing Quick Reference**
```bash
# Build a fresh container, and run all cypress tests (headless)
npm run e2e

# Run all cypress tests (headless, assumes api and spa are live)
npm run cy:run

# Run a specific test (headless)
npm run cy:run -- --spec "cypress/e2e/types.array.cy.ts"

# Interactive test runner
npm run cy:open

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

# Build a container and run cypress e2e tests
npm run e2e

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

### Core Component Architecture

```bash
src/
├── components/                    # Vue components
│   ├── PropertyEditor.vue         # Main property editor orchestrator
│   ├── BasePropertyEditor.vue     # Common header (name, description, type, actions)
│   ├── property-types/            # Individual property type editors
│   │   ├── SimplePropertyEditor.vue      # JSON schema editing
│   │   ├── ComplexPropertyEditor.vue     # JSON/BSON schema editing
│   │   ├── EnumPropertyEditor.vue        # Enum type configuration
│   │   ├── EnumArrayPropertyEditor.vue   # Enum array configuration
│   │   ├── RefPropertyEditor.vue         # Reference type configuration
│   │   ├── ConstantPropertyEditor.vue    # Constant value configuration
│   │   ├── CustomPropertyEditor.vue      # Custom type configuration
│   │   ├── ObjectPropertyEditor.vue      # Object properties management
│   │   ├── OneOfPropertyEditor.vue       # OneOf property management
│   │   └── ArrayPropertyEditor.vue       # Array configuration
│   ├── Extensions/                # Type-specific extension components
│   │   ├── ArrayPropertyExtension.vue    # Array items type picker
│   │   ├── ArrayOfObjectExtension.vue    # Array of objects functionality
│   │   ├── ArrayOfArrayExtension.vue     # Nested array handling
│   │   ├── ObjectPropertyExtension.vue   # Add/remove properties, collapse
│   │   ├── EnumPropertyExtension.vue     # Enum picker integration
│   │   ├── RefPropertyExtension.vue      # Dictionary picker integration
│   │   └── ConstantPropertyExtension.vue # Constant value input
│   ├── Pickers/                   # Selection components
│   │   ├── TypeChipPicker.vue     # Property type selection
│   │   ├── EnumPicker.vue         # Enumerator selection dialog
│   │   ├── RefPicker.vue          # Dictionary selection dialog
│   │   └── ItemTypePicker.vue     # Array item type selection
│   ├── Layout/                    # Page layout components
│   │   ├── AppLayout.vue          # Main application layout
│   │   ├── DetailPageLayout.vue   # Detail page template
│   │   ├── FileListLayout.vue     # File list template
│   │   └── ActionBar.vue          # Page action buttons
│   ├── Cards/                     # Display components
│   │   ├── BaseCard.vue           # Base card component
│   │   ├── PropertyCard.vue       # Property display card
│   │   ├── FileCard.vue           # File display card
│   │   ├── StatusCard.vue         # Status display card
│   │   └── EventCard.vue          # Event display card
│   ├── Dialogs/                   # Modal dialogs
│   │   ├── HelpDialog.vue         # Help information dialog
│   │   ├── EventDialog.vue        # Event details dialog
│   │   └── NewCollectionDialog.vue # Create new collection dialog
│   ├── Editors/                   # Specialized editors
│   │   ├── JsonDocumentEditor.vue # JSON document editing
│   │   ├── JsonArrayEditor.vue    # JSON array editing
│   │   └── InLineEditor.vue       # Inline editing component
│   └── Other/                     # Utility components
│       ├── FileHeader.vue         # File header with actions
│       ├── FileList.vue           # File list display
│       ├── EventNotifications.vue # Event notification system
│       ├── VersionConfiguration.vue # Version management
│       └── VersionInformationCards.vue # Version display
├── composables/                   # Vue composables (shared logic)
│   ├── usePropertyTypeEditor.ts   # Property editing logic
│   ├── useDetailPage.ts           # Detail page functionality
│   ├── useFiles.ts                # File management
│   ├── useEvents.ts               # Event handling
│   ├── useValidationErrors.ts     # Validation error management
│   ├── useEnumeratorDetail.ts     # Enumerator-specific logic
│   ├── useConfig.ts               # Configuration management
│   ├── useNewVersion.ts           # Version creation
│   └── useEventState.ts           # Event viewer state
├── pages/                         # Page components
│   ├── WelcomePage.vue            # Landing page
│   ├── ConfigurationsPage.vue     # Configurations list
│   ├── DictionariesPage.vue       # Dictionaries list
│   ├── TypesPage.vue              # Types list
│   ├── EnumeratorsPage.vue        # Enumerators list
│   ├── TestDataPage.vue           # Test data list
│   ├── MigrationsPage.vue         # Migrations list
│   ├── ConfigurationDetailPage.vue # Configuration editor
│   ├── DictionaryDetailPage.vue   # Dictionary editor
│   ├── TypeDetailPage.vue         # Type editor
│   ├── EnumeratorDetailPage.vue   # Enumerator editor
│   ├── TestDataDetailPage.vue     # Test data editor
│   ├── MigrationsDetailPage.vue   # Migration editor
│   ├── EventViewerPage.vue        # Event viewer
│   └── AdminPage.vue              # Admin panel
├── types/                         # TypeScript type definitions
│   ├── types.ts                   # Property and data types
│   └── events.ts                  # Event types
├── utils/                         # Utility functions
│   └── api.ts                     # API service layer
└── router/                        # Vue Router configuration
    └── index.ts                   # Route definitions
```

### Unified Property Editor System

The property editor system uses a sophisticated architecture that separates concerns and provides a consistent editing experience across all property types.

#### Architecture Overview

```bash
PropertyEditor (main orchestrator)
├── BasePropertyEditor (common header elements)
│   ├── Name, Description, Type, Required, Delete
│   ├── Drag & Drop support
│   ├── Click-to-edit with auto-save
│   └── Extension slot for type-specific controls
├── Type-Specific Extensions (in header)
│   ├── ArrayPropertyExtension (items type picker)
│   ├── ArrayOfObjectExtension (array + object functionality)
│   ├── ArrayOfArrayExtension (nested array handling)
│   ├── ObjectPropertyExtension (add property, additional props, show/hide)
│   ├── EnumPropertyExtension (enum picker integration)
│   ├── RefPropertyExtension (dictionary picker integration)
│   └── ConstantPropertyExtension (constant value input)
├── Conditional Body Rendering
│   ├── Object properties list (for object types)
│   ├── Array item editor (for array of object/array)
│   ├── Simple/Complex property editors (schema editing)
│   ├── OneOf property editor (union type management)
│   └── No body (for enum/ref/constant types - handled by extensions)
└── usePropertyTypeEditor composable (shared logic)
```

#### Property Type Support

**Dictionary Files Support:**
- `array`, `object`, `enum`, `enum_array`, `ref`, `constant`, `one_of`, `custom`

**Type Files Support:**
- `array`, `object`, `simple`, `complex`, `custom`

#### Key Features

- **Unified Interface**: All property types use the same header (name, description, type, required)
- **Type-Specific Extensions**: Additional controls appear in the header for specific types
- **Conditional Body**: Complex types show additional editing interfaces in the body
- **Auto-Save**: Debounced auto-save (300ms) with immediate save on blur/enter
- **Click-to-Edit**: Consistent editing experience across all fields
- **Drag & Drop**: Reorderable properties with visual feedback
- **Validation**: Real-time validation with error display
- **Locking**: Read-only mode when files are locked

### 🏗️ **Test Architecture**

```bash
cypress/
├── e2e/                           # Test specifications
│   ├── app.help.cy.ts            # Help system functionality
│   ├── configurations.cy.ts       # Configuration management
│   ├── dictionaries.cy.ts         # Dictionary operations
│   ├── dictionary.array.cy.ts     # Array property editing
│   ├── dictionary.constant.cy.ts  # Constant property editing
│   ├── dictionary.enum.cy.ts      # Enum property editing
│   ├── dictionary.enum_array.cy.ts # Enum array property editing
│   ├── dictionary.object.cy.ts    # Object property editing
│   ├── dictionary.one_of.cy.ts    # OneOf property editing
│   ├── dictionary.ref.cy.ts       # Reference property editing
│   ├── dictionary.root.array.cy.ts # Root array property editing
│   ├── dictionary.root.object.cy.ts # Root object property editing
│   ├── dictionary.root.one_of.cy.ts # Root OneOf property editing
│   ├── enumerators.cy.ts          # Enumerator management
│   ├── event-viewer.cy.ts         # Event viewer functionality
│   ├── migrations.cy.ts           # Migration file operations
│   ├── test_data.cy.ts            # Test data management
│   ├── type.basic.cy.ts           # Basic type operations
│   ├── type.complex.cy.ts         # Complex type editing
│   ├── type.root.array.cy.ts      # Root array type editing
│   ├── type.root.object.cy.ts     # Root object type editing
│   ├── type.simple.cy.ts          # Simple type editing
│   └── user.journey1.cy.ts        # End-to-end user journey
├── support/                       # Custom commands and utilities
│   ├── commands.ts                # cy.getByTest, cy.resetApp, etc.
│   └── e2e.ts                    # Global configuration
├── downloads/                     # Test artifact storage
├── screenshots/                   # Test failure screenshots
├── videos/                        # Test execution videos
└── tsconfig.json                  # TypeScript configuration
```

## Cypress Test Status

```bash
       Spec                                              Tests  Passing  Failing  Pending  Skipped  
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✔  app.help.cy.ts                           00:05        9        9        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  configurations.cy.ts                     00:37       16       16        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionaries.cy.ts                       00:11        7        7        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✖  dictionary.array.cy.ts                   00:26       12        -       12        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.constant.cy.ts                00:24        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.enum.cy.ts                    00:24        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.enum_array.cy.ts              00:23        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.object.cy.ts                  00:50       14       14        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.one_of.cy.ts                  00:45       13       13        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.ref.cy.ts                     00:24        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✖  dictionary.root.array.cy.ts              00:26       12        -       12        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.root.object.cy.ts             00:26       10       10        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  dictionary.root.one_of.cy.ts             00:26       11       11        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  enumerators.cy.ts                        00:17       19       19        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  event-viewer.cy.ts                       824ms        3        3        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  migrations.cy.ts                         00:03        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  test_data.cy.ts                          00:05        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  type.basic.cy.ts                         00:08        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  type.complex.cy.ts                       00:20        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  type.root.array.cy.ts                    00:37       12       12        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  type.root.object.cy.ts                   00:56       16       16        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  type.simple.cy.ts                        00:13        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✖  user.journey1.cy.ts                      00:01       14        -       14        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ✖  3 of 23 failed (13%)                     08:37      228      190       38        -        -  
```
