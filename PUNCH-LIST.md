# Punch List
Cursor instructions: Complete each of the sections identified below with a ## heading. You are free to complete all of the checkbox - [ ] items in a section without asking for permission or reviews. You should update this document with your progress, and commit changes as you complete each item. If the requirements of a section are not clear you should ask questions to clarify requirements. You must pause to let me test features of a section before moving on to the next section.

## Cypress Testing Preparation
- [ ] Add a unique *data-test* attribute value to all icons, buttons, inputs, headings, and text content to support testing with Cypress.


## Page Title updates
- [x] change "Process All" to "Configure Database"
- [x] Drop confirmation dialog has an input formatting issue, the "Type DROP to confirm" placeholder does not disappear when entering the value.
- [x] Help button is white-on-white when selected 
- [x] The title `MongoDB Configurator` text should link to the landing page.

## Processing Events Viewer
- [x] Make "Expand/Collapse" more obvious, move to the left edge of title line and use emphasized chevrons.

## Configurations List
- [x] Change title text "Configurations" to "Collection Configurations"
- [x] Change buttons to [New][Lock All] standards on other lists
- [x] Remove Delete and Process action icons from list items

### New Collection process
- [x] Implement document creation in UI
    - Use PUT document endpoints in place of POST /configurations
    - In addition to prompting for collection name, prompt for "version" with controls from new-version dialog
    - Always Use to the newest version of enumerators
    - Create (PUT) configuration, dictionary, and test data files.
        - Configuration using name and version provided
        - Dictionary object with _id:identifier, name:word, last_saved:breadcrumb properties
        - Test data is []

## Configuration Detail Page
- [x] Change "Process Configuration" button text to "Configure Collection".
- [x] Remove dictionary and enumerators link from title line.
- [x] Move JSON Schema and BSON Schema buttons to page title.
- [x] Replace version drop down with < {version} > arrows like Enumerators.
- [x] Make "New Version" replace > on newest version.
- [x] Show new text-body section headers.
    - [x] Step 1: Drop existing schema validation
        - [x] No content here, just the text
    - [x] Step 2: Drop the following indexes
        - [x] Add Index dialog should show previously created index names, still allow any text value
    - [x] Step 3: Execute the following migrations 
        - [x] Click to open migration file. 
        - [x] "New Migration" button on migration file picker dialog
    - [x] Step 4: Apply Schema (link to dictionary, and enumerators)
    - [x] Step 5: Add these indexes
        - [x] Make Indexes chips with click-to-edit and delete x. 
        - [x] Edit in pop-up json editor.
    - [x] Step 6: Load Test Data
        - [x] Implement fixed test data file name with collection and version 
        - [x] Link to Test Data details
- [x] Unlock button, implement standard unlock warnings

## Dictionaries List
- [x] Remove delete action icon

## Types List
- [x] Remove delete action icon

## Enumerators List
- [x] Change buttons to [New][Lock All] standards
- [x] Remove delete action icon

## Enumerators Detail Page
- [x] Add Lock/Unlock and Delete buttons the same as on Dictionaries or Types
- [x] Remove accordion one-only open feature of enumerations.

## Test Data List
- [ ] Remove delete action icon

## Test Data Detail Page
- [x] Add delete button with warnings
- [x] JSON Editors size to fit content
- [x] Remove accordion one-only open feature

## Migrations List
- [ ] Remove delete action icon

## Migrations Detail Page
- [ ] Remove Lock action icon
- [ ] Add delete button with standard warnings
- [ ] JSON Editors size to fit content
