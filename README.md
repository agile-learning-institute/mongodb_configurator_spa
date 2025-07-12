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

## Instructions for Cursor
Build a Single Page App with the above stack and the specifications below. Review @mongodb_configurator/README.md to get an overview of the MongoDB Configurator utility. Review @mongodb_configurator_api/docs/openapi.yaml to understand the API that will support this SPA. This is a non-trivial SPA, so we should make sure we have good plans to implement effective componentization and project structure.

Here are the requirements I have documented

# At App Startup
- Load /api/config/ endpoint on startup
- Config Item BUILT_AT == "Local" enables editing, else it's read and render only.
- If get configurations is empty, or only has sample.yaml show welcome page. 
- Drop Database, Delete, and Unlock actions have warnings, and require confirmation. The confirmation should require them to type the name of the file they are unlocking or deleting, or the database name (CI MONGO_DB_NAME) for the Drop Database button.

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
Hamburger menu collapse/expand navigation pane

## Card Component
```
+-------------------+
| {name}    actions |
+-------------------+
|   {details}       |
+-------------------+
```
General Card Layout

## Actions 
 - Add to list on list containers 
 - Delete Item on list items 
 - Lock/unlock object
 - Lock All on Configuration, Dictionary, and Type folders
 - collapse/expand card on most cards, not all
 - open page from file
 - process on configuration file
 - Render JSON / BSON Schema from configuration version
 - required toggle on properties
 - additional properties toggle on object properties
 - one_of toggle on object properties shows one-of view

## Cards
- File Info
- Event with sub events
- Configurations with Versions 
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
  - Documents (List of documents - for test_data and migrations)
  - Document (json doc) simple json editor

## Pages
Most pages are a list of one card or another. 
- Navigation - A list of Collapsible cards that show list of Objects, and a list of files when expanded. Open action on card opens that file.
  = Big red "Drop Database" and green "Process All" buttons at the top 
  - Configurations
  - Dictionaries
  - Types
  - Enumerators
  - Test Data
  - Migrations
- Welcome Page - Usage Instructions
- Admin - List of Config Items (Config Items are not cards)
- Configurations - List of Configuration File cards
- Configuration/{file_name} - Title and List of Configuration Version cards
- Dictionaries - List of Dictionary File cards
- Dictionary/{file_name} - Property Card(s)
- Types - List of Type File cards
- Type/{file_name} - TypeProperty Card(s)
- TestData - List of test_data file cards
- TestData/{file name} - List of Document cards.
- Enumerators - List of Enumerators
- Enumerator - Dict of name:key-value strings
- Events - List of Event Cards (Modal Dialog, Processing Output or Exception Handling)

# Plan
You will build a plan that breaks our work into phases. 
I should review and approve the completion of each phase before we proceed to the next phase. 
Your plan should break the phase down into steps that you will complete without any additional input from me.
After each step, you should update the readme with information about progress, and make a commit of your changes.
You are free to make changes or adjustments to any file within the mongodb_configurator_spa repo - you can not make any changes to other repo's without first getting approval.
You will need to update the npm run scripts to function as documented above.
We will need the ``npm run api`` script working to test the SPA. 

## Phase 1.
  - Step 1 - conduct a interview with me to fill in any details that you will need to create this SPA. One question at a time please.
  - Compile icons for the actions identified above.
  - Extend the plan with implementation phases. 

## Phase 2. Teardown 
  - Tear down this repo to just hello world with no backing services. 
  - You are done with this phase when ``npm run serve`` and ``npm build container`` successfully build and serves up the hello world page. 
  - You will need to update the docker-compose to mount ./tests/playground to the /input folder in the api container. 

# Progress

