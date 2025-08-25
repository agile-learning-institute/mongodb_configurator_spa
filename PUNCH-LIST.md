# Punch List
Cursor instructions: Complete each of the sections identified below with a ## heading. You are free to complete all of the checkbox - [ ] items in a section without asking for permission or reviews. You should update this document with your progress, and commit changes as you complete each item. If the requirements of a section are not clear you should ask questions to clarify requirements. You must pause to let me test features of a section before moving on to the next section.

## Cypress Testing Preparation
- [ ] Add a unique *data-test* attribute value to all icons, buttons, inputs, headings, and text content to support testing with Cypress.

## Help Pages
Update the following help pages to have the content shown.

- [ ] Landing Page 
---
    # [mdi-information-outline] Welcome
    The mongoDB Configurator makes it easy for you to implement the [MongoDB Schema Versioning Pattern](https://www.mongodb.com/company/blog/building-with-patterns-the-schema-versioning-pattern) best practices. Using MongoDB schema validation provides data quality assurances that do not rely exclusively on the proper use of ODM utilities. The Configurator also provides a means to manage indexing as a component of the versioned configurations.

    ## Key Features
    - *Online Help* is available using [mdi-help-circle] [mdi-arrow-top-right] from any page.
    - [*Collection Configurations*](/configurations) control the configuration process. For a quick start you can create a [New Configuration](Configuration New Button) and review help screens from there.
    - [*Data Dictionaries*](/dictionaries) provide a human friendly way to define data structures without the complexity of json/bson schema.
    - [*Custom Types*](/types) are the type abstraction used with json/bson schema complexity.
    - [*Enumerators*](/enumerators) provide a versioned location for enumerator validation values.
    - [*Test Data*](/test_data) can be loaded into the database to support a robust developer experience.
    - [*Migrations*](/migrations) allow you to run migration pipelines to alter existing data when schema changes require it. 
---

- [ ] Configurations Page
---
    # [mdi-compass] Collection Configuration
    Collection configuration it's done using a six step process:
    - Drop any existing Schema Validation
    - Drop any indexes that should be removed
    - Run any migrations that are needed to transform data
    - Create any new indexes that are needed
    - Apply the Validation Schema 
    - Load Test Data (when enabled)

    ## Schema Versioning
    Collection Configuration versions consist of a 3-part semantic Schema version number, and an Enumerators version. Creating a new version will lock the currently active version. See [slide=locking] for more information about what it means to *lock* a configuration.
---

- [ ] Dictionary Page
---
    # [mdi-book-open-variant] Data Dictionary
    Configurator data dictionaries provide a simplify approach to defining data structures and validation constraints. This approach is technology agnostic and Creates dictionaries that can easily be shared with non-technical users. The configurator can also use these dictionaries to create json or bson schema for software engineers.

    ## Data Types
    Data dictionaries do not use traditional software engineering primitive like string or integer, instead they use human accessible custom types like *word*, *sentence*, or *count*. In addition to these custom types, there are some types that will seem very familiar, such as *object*, *array*, or *constant*. If you are familiar with json schema, the *one_of* type will be similar to the corresponding standard. Simple schema also introduces *enum* and *enum array* types that leverage [Configurator Enumerators](/enumerators) for validation constraints. 

    ## Dictionary Versioning
    Dictionary Configuration versions use the typical a 3-part semantic version number. See [slide=locking] for more information about what it means to *lock* a configuration.
---

- [ ] Type Page
---
    # [mdi-shape-outline] Custom Types
    Custom types are where we map the human friendly types used in a data dictionary onto the more terse syntax of json/bson schema. Primitive custom types can take the form of a *simple* primitive, where the only difference between a json/bson schema is the change of the **type** attribute to **bsonType**. A simple string primitive with a pattern constraint should be implemented as a *simple* primitive. A *complex* primitive let's you provide different implementations of json and bson schema. A value such as an bson Object Identifier that is shown in json schema as a string with a pattern constraint is an example of a *complex* primitive. Custom types can also be *objects* or *arrays* and are a convenient way to define re-usable constraints like an address or appointment.

    Note: Custom types are not versioned. Once locked, they should be considered immutable assets used by your data dictionaries. If you should need to change a custom type that has already been deployed to meaningful environments, you will need to create a new custom type with a slightly different name. See [slide=locking] for more information about what it means to *lock* a configuration.
---

- [ ] Enumerators Page
---
    # [mdi-format-list-checks] Enumerators
    To support a Dictionary *enum* and *enum_array* types simple schema leverages a list of valid enumerators, and the individual enumeration values with descriptions. Enumerators are loaded to a specified collection during configuration, making it easy to provide the information needed by a Javascript Web application to support choosers or drop downs. Enumerator versions are managed automatically, and only the latest enumerators should be unlocked. See [slide=locking] for more information about what it means to *lock* a configuration.

    Note: These enumerators are for use when the list of valid enumerations are relatively stable. The configurator makes it easy to add new values to a list, but the deployment of that change does require a new version of the database configuration be deployed. Dynamic enumerator lists that allow real-time updates should be implemented as normal string primitives, with a custom data store for the valid values. 
---

- [ ] Test Data Page
---
    # [mdi-test-tube] Test Data
    Test data can be loaded as part of the configuration process. Test data files contain an array of documents, and supports Mongo extended json properties such as $oid and $date-time. Note that test data files are not lockable. 
---

- [ ] Migrations Page
---
    # [mdi-database-sync] Migrations
    Schema updates may require you to run database wide transformations of the underlying data. While I hope that you never have to make this type of a change, They are at times and necessary evil. A migration is simply a Mongo DB pipeline in individual steps, And is provided as a simple chase on data structure. 

    NOTE: The Configurator does not make any attempt to validate or constrain how you write migrations. If you are having problems getting an integration to work, you can examine error details in the [*events*](slide=events) view. Migrations are used as is and are not lockable.
---

- [ ] Admin Page
---
    # [mdi-cog] Admin
    The Admin page provides access to view the Configurator API settings. This includes database connection parameters, server settings, and other configuration options.

    ## Configuration Sources
    Configuration values can come from different sources:
    - Configuration Files: Values loaded from configuration files (shown in blue) can not be overridden
    - Environment Variables: Values set through environment variables (shown in green)
    - Default Values: Built-in default values (shown in orange) if not specified elsewhere.
---

- [ ] Events Page (new)
---
    # [mdi-tray-full] Configuration Events
    When you configure the database, or a collection within the database, you will be presented with an events page. This will show a deeply nested *processing event*, that you can use to drill down and review configuration output or error messages.
---

- [ ] Locking Configurations (new)
---
    # [mdi-lock] Locking configurations
    Once a configuration has been deployed into a production environment it should not be changed, this is the basic philosophy behind version configurations. In general you should only be editing the most recent version of any given configuration. The locking of a configuration is largely there to make it inconvenient to make mistakes like editing or deleting a previously deployed configuration. A configurations locked state has no impact when applying a configuration. Test data and migrations are not lockable assets.
---

## Page Title updates
- [ ] change "Process All" to "Configure Database"
- [ ] Drop confirmation dialog has an input formatting issue, the "Type DROP to confirm" placeholder does not disappear when entering the value.
- [ ] Help button is white-on-white when selected 
- [ ] The title `MongoDB Configurator` text should link to the landing page.

## Processing Events Viewer
- [ ] Make "Expand/Collapse" more obvious, move to the left edge of title line and use emphasized chevrons.

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
