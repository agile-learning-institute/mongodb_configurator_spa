# Stage0 MongoDB SPA

A Vue 3 SPA for managing MongoDB schema configurations and processing operations.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (requires API on localhost:8081)
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Architecture

### Tech Stack
- **Vue 3** + TypeScript + Composition API
- **Vuetify 3** for UI components
- **Vite** for build tooling
- **Vue Router** for navigation

### Key Design Decisions

#### 1. Composable-Based State Management
- **Simple, read-only data**: No complex state management needed
- **API-driven**: All data comes from REST endpoints
- **Singleton composables**: Shared state across components
- **Transient processing results**: Not persisted, cleared on navigation

#### 2. Unified Data Structure
- **Processing results**: Always normalized to `ProcessingResponse[]`
- **Single vs multiple**: API returns different formats, frontend normalizes
- **Consistent UI**: Same accordion layout for 1 or N collections

#### 3. Component Architecture
```
src/
├── composables/          # API integrations & shared state
│   ├── useCollections.ts # Collection list & details
│   ├── useConfig.ts      # Admin configuration
│   └── useProcessing.ts  # Processing results (transient)
├── pages/               # Route-based components
│   ├── CollectionsPage.vue
│   ├── CollectionPage.vue
│   ├── OperationsPage.vue
│   └── AdminPage.vue
├── components/          # Reusable UI components
├── utils/              # API utilities
└── types/              # TypeScript definitions
```

## API Integration

### Endpoints
- `GET /api/collections` - List collections
- `POST /api/collections` - Process all collections
- `GET /api/collections/{name}` - Get collection config
- `POST /api/collections/{name}` - Process single collection
- `GET /api/config` - Admin configuration

### Data Flow
1. **Collections**: Load on page mount, refresh on demand
2. **Processing**: Trigger via buttons, results stored in composable
3. **Navigation**: Results page shows transient processing data
4. **Admin**: Config loaded once, used for RBAC

## Key Features

### Collections Management
- List all configured collections
- View individual collection configurations
- Process single collections or all collections
- Version-based configuration display

### Processing Operations
- Real-time processing status
- Accordion-based results display
- Expandable operation details
- Unified view for single/multiple collections

### Admin Interface
- Configuration overview
- RBAC role display
- System information

## Development Notes

### State Management
- **No Vuex/Pinia**: Simple composables handle all state
- **API-first**: All data comes from REST endpoints
- **Transient processing**: Results not persisted, cleared on navigation

### UI Patterns
- **Card-based layouts**: Consistent visual hierarchy
- **Accordion grouping**: Collections and operations
- **Expandable details**: JSON data in collapsible sections
- **Status indicators**: Color-coded chips for operation status

### Error Handling
- **Network errors**: Console logging + user feedback
- **API errors**: Inline error display
- **Processing errors**: Shown in operations results

### Performance
- **Lazy loading**: Components load on route change
- **Minimal re-renders**: Reactive composables
- **Efficient updates**: Vue 3 reactivity system

## Deployment

### Container Build
```bash
# Build container
npm run build:container

# Run locally
npm run container
```

### Environment Variables
- `VITE_API_BASE`: API base URL (empty for dev proxy)
- `STAGE0_MONGODB_PORT`: API port (8081)

### NGINX Configuration
- API proxy to `/api/*` endpoints
- Static file serving for SPA
- Environment-based configuration

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:coverage

# E2E tests (if configured)
npm run test:e2e
```

## Contributing

1. Follow Vue 3 Composition API patterns
2. Use TypeScript for type safety
3. Keep composables simple and focused
4. Maintain consistent UI patterns
5. Test API integrations thoroughly

## Dependencies

### Core
- `vue@^3.4.0` - Framework
- `vuetify@^3.4.0` - UI library
- `vue-router@^4.2.0` - Routing

### Development
- `vite@^5.0.0` - Build tool
- `typescript@^5.2.0` - Type checking
- `vitest@^1.0.0` - Testing
- `@vue/test-utils@^2.4.0` - Component testing


