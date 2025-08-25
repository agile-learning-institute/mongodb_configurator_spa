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
- [ ] Change title text "Configurations" to "Collection Configurations"
- [ ] Change buttons to [New][Lock All] standards on other lists
- [ ] Remove Delete and Process action icons from list items

### New Collection process
- [ ] Implement document creation in UI, discontinue use of POST /configurations
    - In addition to prompting for collection name, prompt for "version" with controls from new-version dialog
    - Use to the newest version of enumerators
    - Create configuration, dictionary, and test data files.
        - Configuration using name and version provided
        - Dictionary object with _id, name:word, last_saved:breadcrumb properties
        - Test data is []

## Configuration Detail Page
- [ ] Change "Process Configuration" button text to "Configure Collection".
- [ ] Remove dictionary and enumerators link from title line.
- [ ] Move JSON Schema and BSON Schema buttons to page title.
- [ ] Replace version drop down with < {version} > arrows like Enumerators.
- [ ] Make "New Version" replace > on newest version.
- [ ] Show new text-body section headers.
    - Step 1: Drop existing schema validation
        - [ ] No content here, just the text
    - Step 2: Drop the following indexes
        - [ ] Add Index dialog should show previously created index names, still allow any text value
    - Step 3: Execute the following migrations 
        - [ ] Click to open migration file. 
        - [ ] "New Migration" button on migration file picker dialog
    - Step 4: Apply Schema (link to dictionary, and enumerators)
    - Step 4: Add these indexes
        - [ ] Make Indexes chips with click-to-edit and delete x. 
        - [ ] Edit in pop-up json editor.
    - Step 5: Load Test Data
        - [ ] Implement fixed test data file name with collection and version 
        - [ ] Link to Test Data details
- [ ] Unlock button, implement standard unlock warnings

## Dictionaries List
- [ ] Remove delete action icon

## Types List
- [ ] Remove delete action icon

## Enumerators List
- [ ] Change buttons to [New][Lock All] standards
- [ ] Remove delete action icon

## Enumerators Detail Page
- [ ] JSON Editors size to fit content
- [ ] Remove accordion one-only open feature

## Test Data List
- [ ] Remove delete action icon

## Test Data Detail Page
- [ ] Add delete button with warnings
- [ ] JSON Editors size to fit content
- [ ] Remove accordion one-only open feature

## Migrations List
- [ ] Remove delete action icon

## Migrations Detail Page
- [ ] Remove Lock action icon
- [ ] Add delete button with standard warnings
- [ ] JSON Editors size to fit content
