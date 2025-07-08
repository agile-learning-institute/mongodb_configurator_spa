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
Build a Single Page App with the above stack and the specifications below. 
I want you to start by updating the read me with a plan that breaks building the MVP into stages. 
I should review and approve each stage before we proceed to the next stage. 
Your plan should break the stage down into steps that you will complete without any additional input from me
after each step, you should update the readme with information about progress.
You are free to make changes or adjustments to any file within this project other than docker configurations.
We will be using the Mongo DB configurator API, it is live at port 8081.
Review the open API specifications to understand end points and data structures

# startup
- Load /api/config/ endpoint on startup
- Config Item BUILT_AT == "Local" enables editing, else it's read only.

Delete and Unlock actions have warnings, and require confirmation. 
  - Confirmations with warning and type {file_name} to click the button. 
  - Similar to GitHub Danger Zone operations. 

```
Overall Layout
+--------------------------------------------------+ 
| [burger]     MongoDB Configurator       [admin]  |
+--------------+-----------------------------------+
|  Navigation  |          Page                     |
|              |                                   |
|              |                                   |
|              |                                   |
+--------------+-----------------------------------+


Card Component
+-------------------+
| {name}    actions |
+-------------------+
|   {details}       |
+-------------------+
```

## Actions
 - + Add to list on list containers 
 - x Delete Item on list items 
 - o Lock/unlock file
 - c Clean file
 - < collapse/expand card
 - d open page fron file
 - p process configuration 
 - rj Render JSON / BSON Schema from configuration version
 - required toggle on properties
 - additional properties toggle on object properties

```
## Cards
- File 
- Event with sub events
- Configuration with Versions 
- ConfigurationVersion
- Enumerators list of enumerations
- Enumeration list of named key value pairs
- DictionaryProperty 
  - Ref button for ref values else:
  - name, description and type are always visible and required
  - Object Type 
    - enable Actions Additional Props, Add Prop
    - Property lists is +
    - enable OneOf builder
  - List type 
    - Items details are +
  - Enum and Enum_array types make enums field visible
  - Custom types need on additional props

- TypeProperty 
  - type properties take one of three forms
    - A complex property (object or list)
    - A universal primitive
    - A typed primitive
  - complex types are similar to dictionary property, but do not support ref, enum, or one_of
  - universal primitives contain a simple schema dictionary
  - typed primitives contain a json schema and bson schema dictionary
- Documents (List of json documents)
- Document (json doc)

Pages
- Navigation - a hamburger menu that shows or hides a list of Collapsible cards that show list of file names.
  = Big red "Drop Database" and green "Process All" buttons at the top 
  - Configurations
  - Dictionaries
  - Types
  - Enumerators (not collapsible)
  - Test Data
  - clicking on a category name opens the file list for that category, clicking on a file name opens that file. Note that the numerator are different. There's only one file.
- Admin - List of Config Items (Config Items are not cards)
- Configurations - List of Configuration File cards
- Configuration/{file_name} - Title and List of Configuration Version cards
- Dictionaries - List of Dictionary File cards
- Dictionary/{file_name} - Property Card(s)
- Types - List of Type File cards
- Type/{file_name} - TypeProperty Card(s)
- TestDatum - List of test_data file cards
- TestData/{file name} - List of Document cards.
- Enumerators - List of Enumerators Cards
- Events - List of Event Cards (Modal Dialog, Processing Output or Exception Handling)

# Additional Details
- 
```

