# Mongo Schema Manager SPA 

The Mongo schema manager single page application allows data engineers to test and validate MongoDB configurations. Once these configurations have been validated, they can be packaged and deployed to manage the database configuration.

This application also allows software engineers to download BSON and JSON schemas as well as draft single-collection OpenAPI specifications. All data is read-only. Processing updates MongoDB configurations and returns information about processing operations success or failures.

## Contribution

### Pre-requisites
- [stage0 developers edition](https://github.com/agile-learning-institute/stage0/blob/main/developer_edition/README.md)
- Review stage0 [Contributing Guide](https://github.com/agile-learning-institute/stage0/blob/main/developer_edition/docs/contributing.md)
- Review stage0 [SPA standards](https://github.com/agile-learning-institute/stage0/blob/main/developer_edition/docs/spa-standards.md)

## Tech Stack
- **Framework**: Vue.js 3 with TypeScript
- **UI Library**: Vuetify 3 (Material Design)
- **State Management**: Vue 3 Composables (simple API, read-only data)
- **Build Tool**: Vite (modern, fast build tool with excellent Vue 3 support)
- **Package Manager**: npm (standard for AKS deployment)
- **Container**: Multi-stage Docker build with NGINX
- **Deployment**: AKS with immutable container promotion

### Build Tool Decision: Vite
- **Vite** chosen over Webpack for:
  - Faster development server startup
  - Better Vue 3 + TypeScript support
  - Modern ES modules approach
  - Excellent hot module replacement
  - Smaller bundle sizes
  - Active development and Vue team backing

### Container Architecture
- **Multi-stage Docker build**:
  - Stage 1: Build Vue application with Vite
  - Stage 2: NGINX container serving static files
  - Environment variable `BUILT_AT` for build timestamp
  - NGINX configuration for API proxying

### NGINX Configuration
- **API Proxy**: Forward `/api/*` requests to `STAGE0_MONGODB_PORT` (8081)
- **Static Files**: Serve Vue SPA from `/usr/share/nginx/html`
- **Development**: Hard-coded API port for dev server
- **Production**: Environment variable for API port

### Authentication & RBAC
- **Authentication**: Handled outside this application (deferred implementation)
- **RBAC**: Based on `/api/config` endpoint response
- **Admin Role**: Enables process buttons when `roles` contains "admin"
- **Token Structure**: Uses existing OpenAPI spec token format

## Project Structure / Separation of Concerns

### Core Architecture
- **Composables**: API-based integrations, data drives rendering
- **Pages**: Route-based components
- **Components**: Reusable UI components
- **Router**: Vue Router for navigation

### Routes
- `/` → redirects to `/collections`
- `/collections` → list of collections
- `/collection/{name}` → collection configuration
- `/admin` → configuration information
- `/operations` → processing results view

### Pages
- **Collections Page** (`/collections`)
  - Header: "Collections" with [Process All] and [Admin] buttons
  - Process All: POST to `/api/collections`
  - Processing output redirects to `/operations` page
  - Each collection links to `/collection/{name}`
  - Data source: GET `/api/collections`

- **Collection Page** (`/collection/{name}`)
  - Header: "Configuration" with [Process] button (top right)
  - Process: POST to `/api/collections/{name}`
  - Processing output redirects to `/operations` page
  - Version configuration components (collapsible, one-only control)
  - Data source: GET `/api/collections/{name}`

- **Operations Page** (`/operations`)
  - List of processing operations
  - Collapsible JSON views for complex values (details)
  - Data source: Processing results from POST endpoints
  - Transient data (not persisted)

- **Admin Page** (`/admin`)
  - Configuration details from `/api/config` endpoint
  - List of configuration items (CIs)
  - Add `SPA_BUILT_AT` value to CIs
  - Token values for RBAC (roles, user_id, from_ip)

### Components
- **Version Configuration Component**
  - Version information display
  - [Render JSON/BSON] buttons per version
  - Collapsible JSON views for complex properties
  - Schema, indexes, bulk load errors display

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

### Container Development
```bash
# Build container
npm run build:container

# Run container locally
npm run container

# Start with backing services
stage0 start mongodb
```

### CI/CD Pipeline
- **Trigger**: Merge to main branch
- **Build**: Multi-stage Docker build
- **Test**: Unit tests, linting, build verification
- **Publish**: Push to GitHub Container Registry
- **Deploy**: Immutable container promotion to AKS environments

## API Integration

### Endpoints Used
- `GET /api/collections` - List all collections
- `POST /api/collections` - Process all collections
- `GET /api/collections/{name}` - Get collection configuration
- `POST /api/collections/{name}` - Process single collection
- `GET /api/render/json_schema/{schema_name}` - Get JSON schema
- `GET /api/render/bson_schema/{schema_name}` - Get BSON schema
- `GET /api/render/openapi/{schema_name}` - Get OpenAPI spec
- `GET /api/config` - Get configuration and RBAC info

### Error Handling
- **Network Errors**: Toast notifications with retry options
- **API Errors**: Inline error display with details
- **Validation Errors**: Form validation with field-specific messages
- **Processing Errors**: Dedicated error page with operation details

### State Management
- **Collections State**: Reactive collection list and details
- **Processing State**: Current processing operations and results
- **UI State**: Collapsible sections, loading states, error states
- **User State**: RBAC roles, authentication status

## Missing Design Specifications

### 1. Error Handling Strategy
- **Question**: How should we handle different types of errors (network, API, validation)?
- **Question**: Should we implement retry mechanisms for failed operations?
- **Question**: How do we handle long-running processing operations?

### 2. Loading States
- **Question**: What loading indicators should we show during API calls?
- **Question**: How do we handle skeleton loading for collection lists?

### 3. Responsive Design
- **Question**: What are the target screen sizes and breakpoints?
- **Question**: How should the layout adapt for mobile devices?

### 4. Accessibility
- **Question**: What accessibility standards should we follow (WCAG 2.1 AA)?
- **Question**: How should we handle keyboard navigation and screen readers?

### 5. Internationalization
- **Question**: Do we need multi-language support?
- **Question**: How should we handle date/time formatting?

### 6. Performance Optimization
- **Question**: Should we implement virtual scrolling for large collection lists?
- **Question**: How should we handle caching of API responses?

### 7. Testing Strategy
- **Question**: What testing framework should we use (Vitest, Jest)?
- **Question**: Do we need E2E testing (Playwright, Cypress)?
- **Question**: How should we mock the API for testing?

### 8. Development Experience
- **Question**: Should we set up hot reloading for the API proxy?
- **Question**: How should we handle CORS in development?

### 9. Security Considerations
- **Question**: How should we handle sensitive data in the UI?
- **Question**: Should we implement Content Security Policy (CSP)?

### 10. Monitoring and Observability
- **Question**: How should we handle error tracking and analytics?
- **Question**: Should we implement performance monitoring?

## Environment Variables

### Development
```bash
VITE_API_BASE_URL=http://localhost:8081
VITE_APP_TITLE=MongoDB Schema Manager
```

### Production
```bash
STAGE0_MONGODB_PORT=8081
SPA_BUILT_AT=20250101-120000
```

## NPM Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write src/",
    "build:container": "docker build -t stage0_mongodb_spa .",
    "container": "docker run -p 8082:8082 stage0_mongodb_spa"
  }
}
```


