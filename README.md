# Stage0 MongoDB SPA

A Vue 3 SPA for managing MongoDB schema configurations and processing operations.

## Quick Start
```bash
# Start SPA, API and Backing Services in containers
stage0 up mongodb
```

## Developer Commands

```bash
# Install dependencies
npm install

# Start development server (requires API on localhost:8081)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Build Container
npm run container

```

## Architecture

### Tech Stack
- **Vue 3** + TypeScript + Composition API
- **Vuetify 3** for UI components
- **Vite** for build tooling
- **Vue Router** for navigation

## Instructions for Cursor
Build a Single Page App with the above stack and the following specifications. 
- Load /api/config/ endpoint on startup
- Config Item BUILT_AT == "Local" enables editing, else it's read only.
- Delete and Unlock actions have warnings, and require confirmation. Confirmations with warning and type {file_name} to click the button. Similar to GitHub Danger Zone operations. 

```
Overall Layout
+-------------------------------------------+
| [burger]     MongoDB Configurator         |
+--------------+----------------------------+
|  Navigation  |          Page              |
|              |                            |
|              |                            |
|              |                            |
+--------------+----------------------------+


Card Component
+-------------------+
| {name}    actions |
+-------------------+
|   {details}       |
+-------------------+

```
## Cards / Actions 
(+ indicates collapse action)
- File / Open, Lock/Unlock, Delete, Clean
- Event / +(sub events)
- Configuration / Process, Add Version
- ConfigurationVersion / +, Render, Delete
- Enumerators / Add enumerators
- Enumeration / +, Delete
- DictionaryProperty / Required, Delete
  - Object Type 
    - enable Actions Additional Props, Add Prop
    - Property lists is +
    - enable OneOf builder
  - List type 
    - Items details are +
  - Enum and Enum_array types make enums field visible
  - Custom types need on additional props

- TypeProperty / Required, Delete (hidden at top level)
  - Object Type have +Property lists
    - enable Actions Additional Props, Add Prop
    - Property lists is +
  - List type have +Items component
    - Items details are +
- Documents (List of json documents)/ +, Add Doc
- Document / Del

Pages
- Navigation - list of Collapsible cards that show list of file names.
  = Big red "Drop Database" and green "Process All" buttons at the top 
  - Configurations
  - Dictionaries
  - Types
  - Enumerators (not collapsible)
  - Test Data
- Admin - List of Config Items (Config Items are not cards)
- Configurations - List of Configuration File cards
- Configuration/{file_name} - Title and List of Configuration Version cards
- Dictionaries - List of Dictionary File cards
- Dictionary/{file_name} - Property Card(s)
- Types - List of Type File cards
- Type/{file_name} - TypeProperty Card(s)
- TestDatum - List of test_data file cards
- TestData - List of Document cards.
- Enumerators - List of Enumerators Cards
- Events - List of Event Cards (Modal Dialog, Processing Output or Exception Handling)

# Additional Details
- 
```

