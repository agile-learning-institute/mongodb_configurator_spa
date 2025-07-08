# Stage0 MongoDB SPA

A Vue 3 SPA for managing MongoDB schema configurations and processing operations.

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

## Instructions for Cursor
Build a Single Page App with the above stack and the specifications below. Review @README.md to get an overview of the MongoDB Configurator utility. This is a non-trivial SPA, so we should make sure we have good plans to implement effective componentization and project structure.

We will be using the Mongo DB configurator API, you will need to create a docker compose file that runs mongo, and the API with the /tests/input_folder mounted to /input. See @docker-compose.yaml for reference. 

Review the @openapi.yaml to understand end points and data structures.

# App Startup
- Load /api/config/ endpoint on startup
- Config Item BUILT_AT == "Local" enables editing, else it's read and render only.
- If get configurations only has sample.yaml show welcome page. 
- Drop, Delete, and Unlock actions have warnings, and require confirmation. 
  - Confirmations with warning and instructions for user to **type {file_name} to confirm** that enables the button. 

## Overall Layout
```
+--------------------------------------------------+ 
| [burger]     MongoDB Configurator       [admin]  |
+--------------+-----------------------------------+
|  Navigation  |          Page                     |
|              |                                   |
|              |                                   |
|              |                                   |
+--------------+-----------------------------------+
```

## Card Component
```
+-------------------+
| {name}    actions |
+-------------------+
|   {details}       |
+-------------------+
```

## Actions 
May be their own components that are added to views?
 - Add to list on list containers 
 - Delete Item on list items 
 - Lock/unlock file
 - Clean file
 - collapse/expand card
 - open page fron file
 - process configuration file
 - Render JSON / BSON Schema from configuration version
 - required toggle on properties
 - additional properties toggle on object properties
 - one_of toggle on object properties shows one-of view

## Cards
100% components, and may contain sub-components
- File 
- Event with sub events
- Configuration with Versions 
- ConfigurationVersion
- Enumerators list of enumerations
- Enumeration dict of named key value pair strings
- DictionaryProperty - Most complicated component
  - Ref toggle for ref values else:
  - name, description and type are always visible and required
  - Object Type 
    - enable Actions Additional Props, Add Prop
    - Property lists is collapsible
    - enable OneOf builder
  - List type 
    - Items details are collapsible
  - Enum and Enum_array types make enums field visible
  - Custom types need on additional props

- TypeProperty - Second most complicated component
  - type properties take one of three forms
    - A complex property (object or list)
    - A universal primitive
    - A typed primitive
  - complex types are similar to dictionary property, but do not support ref, enum, or one_of.
  - universal primitives contain a simple schema dictionary
  - typed primitives contain both a json schema and bson schema dictionary.
- Documents (List of json documents)
- Document (json doc)

## Pages
Most pages are a list of one card or another. 
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
- TestData - List of test_data file cards
- TestData/{file name} - List of Document cards.
- Enumerators - List of Enumerators Cards
- Events - List of Event Cards (Modal Dialog, Processing Output or Exception Handling)
- Welcome - users guide

# Plan
You will build a plan that breaks our work into phases. 
I should review and approve the completion of each phase before we proceed to the next phase. 
Your plan should break the phase down into steps that you will complete without any additional input from me.
After each step, you should update the readme with information about progress.
You are free to make changes or adjustments to any file within this project.
You will need to update the npm run scripts to function as documented above.

## Phase 1.
  - Step 1 - conduct a interview with me to fill in any details that you will need to create this SPA. One question at a time please.
  - Compile icons for the actions identified above.
  - Extend the plan with implementation phases. 

## Phase 2. Teardown 
  - tear down this repo to just hello world, you are done when ``npm run serve`` and ``npm build container`` successfully build and serves up the hello world page. 
  - review @mentorHub-person-ui Dockerfile, and NGINX configs. Compare with and improve our Dockerfile and NGINX configs. Goal is simplicity without sacrificing any functionally. 
  - Phase is complete when the npm run serve and npm run container work, and serve up the hello world page. 

# Progress

