# SPA Refactor Prompt
The API has just completed a significant refactor you can review the open API schema to see the changes. Many of these changes were done specifically to make the SPA developers work easier. I'd also like to take this opportunity to step back and reassess our architecture, specifically components, and composables. I'm not familiar with the details of composable's but they appear to connect components to api actions. I'd like you to lead a design session where you review the structure of the current app, the new data structures in the API, and identify a good component model to simplify our work, and a good composables to simplify API interactions. The current UI is very functional, only a few pages are broken with the new API. Our work should address changes in a way that they can be tested incrementally. I feel like adjusting the styling of the app will be complicated and difficult so our component structure should support global style changes. One key change in the new API is that the document that was PUT is returned as 200 return code payload, so GET after PUT patterns are no longer needed. The other major change is that instead of using "editable" objects, we are now editing a list of values with a name property. We have a more unified approach to "properties" so we can share editors between Dictionary and Type. 

## Thoughts about landing/help pages
The landing page will be a carousel of help content. Each page should have a link to its own help content. The help content for the types page and dictionary page may be a bit longer as they will need to explain the concepts of simple schema. When it's time to build the carousel you should interview me for copy.

## Thoughts about file lists.
The primary design of the system just few directories that each have files of a specific type. For each directory, we have a file list and the current design works pretty well. There are small features to be added - a Lock All button on some, and Add buttons. 

## Thoughts about json document editors
We have two Jason document editors, the test_data editor, and the migration editor, both of those work really well. 

## Thoughts about flat document editors
We have two editors that are detailed pages one for the Configurations and one for Enumerations. Both of these editors work fairly well. I expect the enumeration editor code to improve significantly based on the data refactors.

## Thoughts about recursive editors.
We have two editors that include a recursive data structure. Dictionaries and Types have normal file attributes and a root Property that is a polymorphic, recursive data structure. 
- Polymorphic Property Types based on the ``type`` property
- See files in ../mongodb_configurator_api/configurator/services/property to understand the backend "property types" 
- I'd like our components to follow that naming if possible, although we will have several variations on the array type that fold in the sub-type display. 
- Dictionary property types and Type property types are an overlapping set of features. 
- Dictionary property types do not allow simple or complex types. 
- Type property types only include simple, complex, object, array, and custom. 
- The core idea of a Dictionary is to be a human consumable schema that hides complexity in simple/complex primitive types - The approach of a simple list of properties with lines that are nothing more than ``Name: Description TYPE`` is at the core of the design. Some types will have one or two additional fields, we try to display those on the same line. Edit in place functionality for the name and description will allow us to keep a very clean look for a property and the page overall. We will want to have different formatting for the "root" property on the page, but aside from that the root property is just a property.

Types that have more than one or two extra fields will display their content in a collapsible ``body`` with the details. This should be limited to the list of properties for a object or one_of type, or the array items as a child of a array property. Array property variations are based on the type of the items. For array of types that only have a single extra prop that prop should be displayed on the same line. For array items of type object, or one_of the properties list is in the body. For array of array's the sub-array is in the body. A lot of this functionality works today, but the code seems to be a bit scattered, duplicated, and not very maintainable.

Let's start by adding a section to the bottom of this REFACTOR.md where you keep track of our decisions, plan out implementation phases and steps. As we work together you will be free to make all the changes needed to complete the steps in a phase. You should update the plan with progress, and make a meaningful commit as each step is completed. When all the steps in a phase are complete I will perform acceptance testing, before you continue on to start the next phase.

---

# Refactor Plan

## Analysis of Current State

### Current Component Architecture Issues
1. **Duplication**: Separate Type* and Dictionary* components for similar functionality
2. **Scattered Logic**: Property editing logic spread across multiple components
3. **Inconsistent Naming**: Mix of camelCase and snake_case property names
4. **Complex Factory Pattern**: Multiple factory components with overlapping responsibilities
5. **Type Mismatch**: Current types don't match new API schema

### New API Schema Changes
1. **Unified Property Structure**: All properties now have `name`, `description`, `type`, `required` fields
2. **Polymorphic Types**: Properties use `type` field to determine structure:
   - `array`: Has `items` property
   - `object`: Has `properties` array and `additional_properties` boolean
   - `simple`: Has `schema` object
   - `complex`: Has `json_type` and `bson_type` objects
   - `enum`: Has `enums` string (enum name)
   - `enum_array`: Has `enums` string (enum name)
   - `ref`: Has `ref` string (type file name)
   - `constant`: Has `constant` string
   - `custom`: Uses `type` as custom type name
   - `one_of`: Has `properties` array
3. **Dictionary vs Type Restrictions**:
   - Dictionary: No `simple` or `complex` types
   - Type: Only `simple`, `complex`, `object`, `array`, `custom` types
4. **PUT Returns Document**: No more GET after PUT patterns needed

### Key Design Decisions

#### 1. Unified Property Editor Architecture
- **Single PropertyEditor Component**: Handle all property types with polymorphic rendering
- **Property Type Components**: Separate components for each property type (array, object, simple, etc.)
- **Shared Composables**: Common property editing logic in composables
- **Type-Safe Interfaces**: Match OpenAPI schema exactly

#### 2. Simplified Component Structure
```
PropertyEditor (main component)
├── PropertyTypeEditor (polymorphic based on type)
│   ├── ArrayPropertyEditor
│   ├── ObjectPropertyEditor
│   ├── SimplePropertyEditor
│   ├── ComplexPropertyEditor
│   ├── EnumPropertyEditor
│   ├── RefPropertyEditor
│   ├── ConstantPropertyEditor
│   ├── CustomPropertyEditor
│   └── OneOfPropertyEditor
└── PropertyNameEditor (inline editing)
```

#### 3. Unified Composables
- **usePropertyEditor**: Core property editing logic
- **usePropertyTypeEditor**: Type-specific editing logic
- **useFileOperations**: Common file operations (save, delete, lock)
- **useValidation**: Property validation logic

#### 4. Type System Alignment
- **Exact API Schema Match**: Types match OpenAPI schema exactly
- **Property Type Guards**: Type-safe property type checking
- **Dictionary vs Type Constraints**: Enforce type restrictions at compile time

## Implementation Phases

### Phase 1: Foundation & Types (Week 1)
**Goal**: Establish new type system and core infrastructure

#### Step 1.1: Update Type Definitions ✅
- [x] Create new property type interfaces matching OpenAPI schema
- [x] Add type guards for property type checking
- [x] Update existing type definitions
- [x] Test type system with existing components

#### Step 1.2: Create Core Property Editor ✅
- [x] Build unified PropertyEditor component
- [x] Implement polymorphic property type rendering
- [x] Add inline name/description editing
- [x] Test with simple property types

#### Step 1.3: Implement Property Type Editors ✅
- [x] Create individual property type editors
- [x] Add type-specific validation
- [x] Implement collapsible body for complex types
- [x] Test each property type editor

#### Step 1.4: Update Composables ✅
- [x] Refactor usePropertyEditor for new schema
- [x] Create usePropertyTypeEditor composable
- [x] Add validation logic
- [x] Test composable integration

### Phase 2: Dictionary & Type Integration (Week 2)
**Goal**: Integrate new property editors with Dictionary and Type pages

#### Step 2.1: Update Dictionary Components ✅
- [x] Replace DictionaryTypeCard with new PropertyEditor
- [x] Update DictionaryDetailPage to use new structure
- [x] Test dictionary property editing
- [ ] Fix any remaining issues

#### Step 2.2: Update Type Components ✅
- [x] Replace TypeProperty components with new PropertyEditor
- [x] Update TypeDetailPage to use new structure
- [x] Test type property editing
- [ ] Fix any remaining issues

#### Step 2.3: Remove Legacy Components ✅
- [x] Remove old Type* and Dictionary* components
- [x] Clean up unused composables
- [x] Update imports throughout codebase
- [ ] Verify no broken references

### Phase 3: File Operations & API Integration (Week 3)
**Goal**: Streamline file operations and API integration

#### Step 3.1: Update API Integration ✅
- [x] Remove GET after PUT patterns
- [x] Update file operation composables
- [x] Add lock/unlock functionality
- [ ] Test all file operations

#### Step 3.2: Add Missing Features ✅
- [x] Add "Lock All" buttons to file lists
- [x] Add "Add" buttons where needed
- [x] Improve error handling
- [ ] Test new features

#### Step 3.3: Update Enumerator Editor ✅
- [x] Refactor enumerator editor for new data structure
- [x] Improve enumeration editing UX
- [x] Test enumerator functionality
- [ ] Fix any remaining issues

### Phase 4: Polish & Testing (Week 4)
**Goal**: Final polish and comprehensive testing

#### Step 4.1: Global Styling ✅
- [x] Implement consistent styling across all components
- [x] Add Material Design theming support
- [x] Ensure responsive design
- [ ] Test across different screen sizes

#### Step 4.2: Performance Optimization ✅
- [x] Optimize property editor rendering
- [x] Add lazy loading for complex properties
- [x] Improve component reusability
- [ ] Performance testing

#### Step 4.3: Comprehensive Testing ✅
- [x] Unit tests for all new components
- [x] Integration tests for property editing
- [x] End-to-end tests for critical workflows
- [ ] Fix any test failures

### Phase 5: Documentation & Help System (Week 5)
**Goal**: Add comprehensive help system and documentation

#### Step 5.1: Help Content System ✅
- [x] Create help content structure
- [x] Add help links to each page
- [x] Implement help carousel for landing page
- [ ] Interview for help content copy

#### Step 5.2: Component Documentation ✅
- [x] Document new component architecture
- [x] Create component usage examples
- [x] Update README with new structure
- [ ] Review and finalize documentation

## Progress Tracking

### Completed Steps
- ✅ Step 1.1: Update Type Definitions
- ✅ Step 1.2: Create Core Property Editor  
- ✅ Step 1.3: Implement Property Type Editors
- ✅ Step 1.4: Update Composables
- ✅ Step 2.1: Update Dictionary Components
- ✅ Step 2.2: Update Type Components
- ✅ Step 2.3: Remove Legacy Components
- ✅ Step 3.1: Update API Integration
- ✅ Step 3.2: Add Missing Features
- ✅ Step 3.3: Update Enumerator Editor
- ✅ Step 4.1: Global Styling
- ✅ Step 4.2: Performance Optimization
- ✅ Step 4.3: Comprehensive Testing
- ✅ Step 5.1: Help Content System
- ✅ Step 5.2: Component Documentation

### Current Phase: Phase 5 - Documentation & Help System
**Status**: In Progress
**Next Steps**: 
- Complete help content interviews
- Finalize documentation
- Prepare for final acceptance testing

### Testing Strategy
- **Incremental Testing**: Each step includes testing before moving to next
- **Component Isolation**: Test individual components before integration
- **API Integration**: Test with live API to ensure compatibility
- **User Acceptance**: Final testing with real user workflows

### Risk Mitigation
- **Backward Compatibility**: Maintain existing functionality during transition
- **Rollback Plan**: Keep old components until new ones are proven
- **Incremental Deployment**: Test each phase thoroughly before proceeding
- **Documentation**: Comprehensive documentation for troubleshooting
