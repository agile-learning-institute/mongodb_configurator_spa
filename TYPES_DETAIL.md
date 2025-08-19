# Types Detail Page Updates

## Page / Document level updates
  - [x] Title minus .yaml
  - [x] Lock does a Lock All, should _locked = True and PUT
  - [x] Unlock doesn't PUT
  - [x] Locked should hide Action buttons and icons and "disable" name/description editors, and type pickers
  - [x] Change name/description to be formatted / enabled / disabled like enumerators value/description sets.
  - [x] We should not need to get after put with the new API but it looks like types are still using this pattern.
  - [x] Unlock confirmation should match Enumerators
  - [x] Delete confirmation should match Enumerators

## Property editor updates - Property Base
  - [x] Hide Root Property Name - it's always "root" anyway
  - [x] Make required just a checkbox with tooltip
  - [x] Add tooltip to delete icon

## Types and Type Picker
  - [x] Change type drop down to a chip picker
  - [x] Implement "custom" types correctly.. custom types are references to other type files - GET types for picker
  - [x] The only allowed property types for Types but not Dictionaries are Simple, Complex, Object, Array, and {custom} types
  - [x] Simple and Complex are only valid as root types
  - [x] {custom} types are not allowed at the root.

## Object property editor updates
  - [x] Move "Allow Additional Properties" as action icon with tooltip
  - [x] Add action chevron-down / chevron-left icons to "hide" properties.
  - [x] Move "add property" to action icon

## Array property editor updates
Array property editors may need different editors for different item types.
  - [x] Add Items type chip picker to the right of the main type chip.
  - [x] If Items type is Object, use object action icons, and "Properties" child panel from Object property editor
  - [x] If Items type is Array, use Array Property in child panel

