# Cypress Improvements - Comprehensive Testing Plan

Instructions for cursor: We have just completed implementing our foundational Cypress E2E tests, and now I want to move on to more complete testing. You should review existing e2e tests for context. I already know of a number of defects that we're going to find, and we will fix those defects as we come across them. As we are creating tests, if there is not an easy to use data-test attribute we can use to target automation, we can add them to the code to make the page more testable. I've listed a few purely stylistic items, these are changes I want to make to the code that we don't necessarily have to address in testing. Please consider my use of "assert" and "it" to be just very rough ideas of how to structure the testing, and probably not very good ideas at that. We have some updates that are not triggering API calls to persist state with the back end, so tests that enter values should re-load the page and confirm state was preserved. I'd like you to create a plan that includes the items identified below. 

Your plan should:
- Be organized into phases with phase gates that require my approval
- Before a phase starts, you should ask questions to clarify any ambiguous requirements in the phase and update the PUNCH-LIST accordingly.
- Phases should be broken down to steps that you can complete without review or approval
- As you complete a step you should update the PUNCH-LIST, commit changes, and push those changes up to GitHub.
- When a phase is complete you will ask me to review the work before proceeding. 
- After phase gate approval you should commit and push any remaining changes, and summarize chat history before moving to the next phase.

## Phase 1: Icon Updates and Basic Navigation Testing ✅
**Goal**: Update version navigator icons and test basic navigation functionality
**Status**: COMPLETED

**Steps**:
- [x] Update version navigator icons from `mdi-chevron-left/right` to `mdiSkipPrevious/mdiSkipNext` in ConfigurationDetailPage
- [x] Update version navigator icons from `mdi-chevron-left/right` to `mdiSkipPrevious/mdiSkipNext` in EnumeratorDetailPage  
- [x] Update Event Viewer show/hide icons to `mdiEye/mdiEyeOff` and reposition horizontally as 2nd item from left edge
- [x] Add necessary `data-test` attributes for reliable testing
- [x] Test basic version navigation functionality (previous/next/new version buttons)
- [x] Verify icon changes render correctly
- [x] Fix icon testing assertions (use `.should('have.class')` instead of `.should('contain')`)
- [x] Improve enumerators test structure and make version assertions dynamic
- [x] Add comprehensive versioning business rules testing
- [x] Update PUNCH-LIST.md with completion status
- [x] Commit and push changes

**Phase Gate**: Your approval required before proceeding to Phase 2

## Phase 2: Configuration Detail Page Comprehensive Testing
**Goal**: Complete testing of all configuration management features
**Status**: IN PROGRESS - Test structure improved

**Steps**:
- [x] Improve test structure with logical describe blocks for better organization
- [x] Organize tests into: Basic Page Functionality, Configuration Creation and Dialog, Configuration Detail Page, Configuration Management
- [ ] Test new version creation dialog and patch logic (+1 down, then up)
- [ ] Test enumerators +1 creates new enumerators if needed
- [ ] Test Step 2 index management (add new name, add from existing indexes)
- [ ] Test migration management (add new, add existing, verify links)
- [ ] Test dictionary and enumerator linking (verify correct files)
- [ ] Test Step 5 index management (add/edit/remove)
- [ ] Test test data linking
- [ ] Add necessary `data-test` attributes for reliable testing
- [ ] Update PUNCH-LIST.md with completion status
- [ ] Commit and push changes

**Phase Gate**: Your approval required before proceeding to Phase 3

## Phase 3: Enumerator Detail Page Testing Updates
**Goal**: Update enumerator tests to match new simplified flow
**Status**: Pending Phase 2 approval

**Steps**:
- [ ] Remove secondary unlock confirmation tests
- [ ] Remove secondary delete confirmation tests  
- [ ] Test new version creation from unlock warning dialog
- [ ] Test version locking/unlocking rules (only newest version can be unlocked)
- [ ] Test version deletion rules (only unlocked versions can be deleted)
- [ ] Test version copying and locking (newest version copied and locked)
- [ ] Add necessary `data-test` attributes for reliable testing
- [ ] Update PUNCH-LIST.md with completion status
- [ ] Commit and push changes

**Phase Gate**: Your approval required before proceeding to Phase 4

## Phase 4: Types Detail Page Testing
**Goal**: Comprehensive testing of type property editing system
**Status**: Pending Phase 3 approval

**Steps**:
- [ ] Test root property type changes and editor switching (simple, complex, object, array)
- [ ] Test object property editor functionality (add/edit/drag/remove properties)
- [ ] Test array property editor with item type picker (object, array, custom only)
- [ ] Test array of object/array property editors
- [ ] Test property type restrictions for different contexts
- [ ] Test custom type integration
- [ ] Update page title to include "Type" before filename
- [ ] Update root property editor to use standard Card layout
- [ ] Update non-root property editors to match Enumerators page styling
- [ ] Add necessary `data-test` attributes for reliable testing
- [ ] Update PUNCH-LIST.md with completion status
- [ ] Commit and push changes

**Phase Gate**: Your approval required before proceeding to Phase 5

## Phase 5: Dictionary Detail Page Testing
**Goal**: Test dictionary-specific property editing with type restrictions
**Status**: Pending Phase 4 approval

**Steps**:
- [ ] Test dictionary property type restrictions (root: object/array only, non-root: object, array, constant, enum, enum_array, one_of, ref, custom)
- [ ] Test object and array property editors in dictionary context
- [ ] Test constant property editor (editable value input)
- [ ] Test enum and enum_array property editors (enumerators picker)
- [ ] Test ref property editor (dictionary picker)
- [ ] Test one_of property editor (property list like object)
- [ ] Test array of different property types (one_of, ref, custom)
- [ ] Update page title to include "Dictionary" before filename
- [ ] Update root property editor to use standard Card layout
- [ ] Add necessary `data-test` attributes for reliable testing
- [ ] Update PUNCH-LIST.md with completion status
- [ ] Commit and push changes

**Phase Gate**: Your approval required before proceeding to Phase 6

## Phase 6: User Journey Testing
**Goal**: End-to-end testing of complete user workflows
**Status**: Pending Phase 5 approval

**Steps**:
- [ ] Replicate sample collection journey
- [ ] Test configuration version evolution (initial → full_name replacement)
- [ ] Test schema migration scenarios
- [ ] Test data loading and skipping logic
- [ ] Verify complete workflow integrity
- [ ] Add necessary `data-test` attributes for reliable testing
- [ ] Update PUNCH-LIST.md with completion status
- [ ] Commit and push changes

**Phase Gate**: Final approval and project completion

---

## Implementation Notes

### Icon Updates
- **Version Navigation**: Update ConfigurationDetailPage and EnumeratorDetailPage to use `mdiSkipPrevious/mdiSkipNext`
- **Event Viewer**: Move show/hide icon to be 2nd item from left edge (horizontal positioning)
- **Future Enhancement**: Test Data and Dictionaries will need version navigation implemented later

### Data-Test Attributes
- Add `data-test` attributes to all interactive elements for reliable testing
- Use consistent naming conventions (e.g., `data-test="add-property-btn"`, `data-test="type-picker"`)
- Focus on elements that need to be targeted in automated tests

### API and Dev Server Management
- Request API/dev server reset when code changes require relaunch
- Request backend reset when configurations need to be reset to clean state
- Work with current running instances when possible

### Testing Approach
- Each test should create its own data and clean up after itself
- Tests that enter values should reload the page and confirm state was preserved
- Use existing test patterns from current 22 passing tests as foundation
- Focus on real user workflows and interactions

### Test Structure Improvements
- **Logical Grouping**: Use `describe()` blocks to organize related test functionality
- **Single Responsibility**: Each test should focus on one specific feature or workflow
- **Maintainable**: Break long test files into logical sections for easier maintenance
- **Readable**: Clear test names and organization make debugging easier
- **Scalable**: Easy to add new test groups as functionality grows

### Enumerator Versioning Rules
- **New Version Creation**: Can only create the next sequential version (V2 → V3, V3 → V4)
- **Version Deletion**: Can only delete the newest version (if V3 exists, can't delete V2)
- **Version Locking**: Only the newest version can be unlocked/modified
- **Test Structure**: Use V3 baseline setup to test strict versioning rules properly
- **Dynamic Assertions**: Extract version numbers dynamically instead of hardcoding
- **Business Logic Testing**: Verify that version navigation respects these rules

---

## Original Requirements (For Reference)

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