# Cypress Improvements

Instructions for cursor: We have just completed implementing our foundational Cypress E2E tests, and now I want to move on to more complete testing. You should review existing e2e tests for context. I'd like to take a test driven approach, I already know of a number of defects that we're going to find, and we will fix those defects as we come across them. As we are creating tests, if there is not an easy to use data-test property we can add them to the code. I've Listed a few purely stylistic items, these are changes I want to make to the code that we don't necessarily have to address in testing. Please consider my use of assert and it statements to be just very rough ideas of how to structure the testing, and probably not very good ideas at that. We have some updates that are not triggering API calls to persist state, so tests that enter values should re-load the page and confirm state was preserved. I'd like you to create a plan that includes the items identified below. Your plan should:
- Be organized into phases with phase gates that require my approval
- Before a phase starts, you should ask questions to clarify any ambiguous requirements in the phase and update the PUNCH-LIST accordingly.
- Phases should be broken down to steps that you can complete without review or approval
- As you complete a step you should update the PUNCH-LIST, commit changes, and push those changes up to GitHub.
- When a phase is complete you will ask me to review the work before proceeding. 
- After phase gate approval you should commit and push any remaining changes, and summarize chat history before moving to the next phase.

# Configurations Detail Page 
    - [ ] Use [mdiSkipPrevious] and [mdiSkipNext] for version navigator 
    - [ ] it shows next/new and prev/none appropriately 
    - [ ] it can create a new version
        - New-Version Dialog has no editable number inputs
        - Patch logic works +1 down, then up, verify numbers
        - Enumerators +1 creates new enumerators if needed
    - [ ] assert it can add a Step 2 index with new name
    - [ ] assert it can add a Step 2 index from existing indexes
    - [ ] assert it can add new migration
    - [ ] assert it can add existing migration
    - [ ] assert it links to the correct migration
    - [ ] assert it links to the correct dictionary
    - [ ] assert it links to the correct enumerators
    - [ ] assert it can add/edit/remove Step 5 indexes
    - [ ] assert it links to the correct test data

- [ ] Enumerator Detail Page 
    - [ ] Use [mdiSkipPrevious] and [mdiSkipNext] for version navigator 
    - [ ] Remove secondary unlock confirmation, update tests to match this new flow
    - [ ] Remove secondary delete confirmation, update tests to match this new flow

    - [ ] assert it creates a new version from the unlock warning dialog
    - [ ] assert it can only unlock the newest version
    - [ ] assert it can only delete a unlocked version
    - [ ] assert it copies and locks the newest version to create a new version

# Event Viewer page
    - [ ] Use [mdiEye] and [mdEyeOff] for show-hide Sub-Events
    - [ ] Move the show/hide icon to be between the success/fail [mdiCheckCircle] icon and the Card Title 
    - [ ] it can display configuration results and view help

# Types Detail page
- [ ] Main Details
    - [ ] it has the word "Type" to the title before the file-name. 
    - [ ] it uses the standard Card layout/formatting for the root property
    - [ ] Non-Root property editors "name" and "description" should use the padding, border, font, size, click-to-edit styles from the value/description list on the Enumerators page
    - [ ] it shows only object, array, and custom types for non-root property type options

- [ ] Root Property Editor
    - [ ] it shows only object, array, simple, and complex for root property type options
    - [ ] it can change the root property type and show the correct property editor
    - [ ] Set Root Property to Simple, verify controls, enter value, reload, confirm
    - [ ] Set Root Property to Complex, verify controls, enter values, reload, confirm
    - [ ] Set Root Property to Object, verify controls, add properties, reload, confirm
    - [ ] Set Root Property to Array, verify controls and Items Type picker contents
    - [ ] Set Items type to Object, verify controls, add properties, reload, confirm
    - [ ] Set Items type to Array, verify controls, type picker options

- [ ] Object Property Editor 
    - [ ] Change icon for Add Property to [list-alt-add]
    - [ ] Change icons for Allow Additional Properties to [list-alt]-false / [list-alt-check]-true
    - [ ] Change show/hide Properties icon to [mdiEye] and [mdiEyeOff]
    - [ ] Make Properties in the list Drag-able - using the [mdiDrag] icon as the very first item on the line.
    - [ ] it can add/edit/drag/remove a Property in the List
    - [ ] it can change non-root property type and show the correct property editor

- [ ] Array base property editor
    - [ ] it shows a item type chip/picker to the right of the type chip
    - [ ] it shows only object, array, and custom types in the item type picker

- [ ] Array of Object property editor 
    - [ ] it shows a property list that is identical to the object type property list
    - [ ] it can add/edit/drag/remove a Property in the List

- [ ] Array of Array property editor 
    - [ ] it shows a items line with name, description, and a items type chip/picker
    - [ ] it allows nesting of at least 4 levels of array of array of array of array
    
# Dictionary Detail page
The type pickers for Dictionaries are different from the Types type picker. When we make changes to the type picker values we need to not change how the type pickers for the Type detail page work. This may require changes to shared components to allow this, maybe with the slot pattern?
- [ ] it shows the word Dictionary to the left of the file name in the page title.
- [ ] it uses the standard Card layout/formatting for the root property
- [ ] it shows only object and array for root property type options
- [ ] it shows only object, array, constant, enum, enum_array, one_of, ref, or the custom types for non-root property type options
- [ ] it can change the property type and show the correct property editor

- [ ] Object Property Editor (Same as type, may be able to re-use)
    - [ ] Change icon for Add Property to [list-alt-add]
    - [ ] Change icons for Allow Additional Properties to [list-alt]-false / [list-alt-check]-true
    - [ ] Change show/hide Properties icon to [mdiEye] and [mdiEyeOff]
    - [ ] Make Properties in the list Drag-able - using the [mdiDrag] icon as the very first item on the line.
    - [ ] it can add/edit/drag/remove a Property in the List

- [ ] Array base property editor (Same as type, may be able to re-use)
    - [ ] it shows a item type chip/picker to the right of the type chip
    - [ ] it shows only object, array, one_of, ref, and custom types in the item type picker

- [ ] Array of Object property editor (Same as type, may be able to re-use)
    - [ ] it shows a property list that is identical to the object type property list
    - [ ] it can add/edit/drag/remove a Property in the List

- [ ] Array of Array property editor (Same as type, may be able to re-use)
    - [ ] it shows a items line with name, description, and a items type chip/picker
    - [ ] it allows nesting of at least 4 levels of array of array of array of array

- [ ] Array of one_of
    - [ ] it shows a property list that is identical to the object type property list
    - [ ] it can add/edit/drag/remove a Property in the List

- [ ] Array of ref
    - [ ] it shows a dictionary chip and picker
    - [ ] it shows all dictionaries in the picker

- [ ] Array of custom
    - [ ] it shows the custom type name in the type chip

- [ ] Constant property editor
    - it shows an editable value input to the right of the type chip

- [ ] Enum and Enum Array property editor
    - it show a Enumerators chip/picker to the right of the type chip
    - it has picker that shows a list of enumerator names from the most recent enumerators 

- [ ] Ref property editor
    - it shows a dictionary chip/picker to the right of the type chip
    - it has a picker that shows a list of dictionaries

- [ ] One Of property editor
    - [ ] it shows a Property List just like the Object property editor
    - [ ] it can add/edit/drag/remove a Property in the List

# User Journey testing
    - Replicate the journey of the sample collection.
    - Create new configuration test_collection_{id}
    - Initial version dictionary has _id, status, first_name, last_name, and last_modified properties
    - Create test data that reflects the schema
    - Configure Collection and verify events that added records
    - Create new version that replaces first_name, last_name with full_name
    - Configure Collection and verify first version was "skipped" and test data loaded for 2nd version
    - Configure Collection again and verify everything skipped