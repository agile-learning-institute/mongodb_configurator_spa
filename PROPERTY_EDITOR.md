# PropertyEditor Refactor Plan

We will create/refactor PropertyEditor components, which are recursively rendered when a parent property has sub properties.

### Entry Point
- `PropertyEditorFactory.vue` — Accepts `property` and `isRoot` props. Determines which specialized editor to render based on property type. For array types, determine the editor based on item.type.

### Root Handling
- `isRoot` prop disables key editing and delete icon, and applies special colors for the root property title.

### Specialized Editors
- `ObjectPropertyEditor.vue` — Handles object properties, renders children recursively.
- `ArrayOfCustomPropertyEditor.vue` — Handles array types with a custom Item type
- `ArrayOfArrayPropertyEditor.vue` — Handles array types with a array Item type
- `ArrayOfObjectPropertyEditor.vue` — Handles array types with a object Item type
- `EnumPropertyEditor.vue` — Handles enum and enum_array types.
- `CustomPropertyEditor.vue` — Handles all other property types.

### Title Row
- All editors render a consistent title row:
  - Inline editor for key (if not root)
  - Inline editor for description
  - Type picker
  - Additional controls (add property, required, additional props, delete, etc.) as appropriate

### Content/Body
- Only ObjectPropertyEditor, ArrayOfObjectPropertyEditor, and ArrayOfArrayPropertyEditor have a <body>
- ObjectPropertyEditor and ArrayOfObjectPropertyEditor contain just the Property list, not the containing context object
- ArrayOfArrayPropertyEditor has a single ArrayEditor child for (item)
- Default type when adding new properties should be the custom type "word"


# Goal 1
Refactor the DictionaryDetails page to properly draw a page heading with 'file_name' and show a PropertyEditor using 
PropertyEditorFactory(root). The DictionaryDetails page should be:
DictionaryDetails page
```html
<DictionaryDetails>
	<header>
		<H2>{file_name}</H2>
		<button>{_locked}</button>
		<button>{delete}</button>
	</header>
	<PropertyEditorFactory(root, true)/>
</DictionaryDetails>
```
NOTE that the page DOES NOT render the property.


# Goal 2
Refactor the CustomPropertyEditor - this is the simplest PropertyEditor
```html
<CustomPropertyEditor>
    <title - contents left-to-right>
		<InLineEditor>{key}:</InLineEditor> (if not root)
		 <InLineEditor>{value.description}</InLineEditor>
         <TypePicker>{value.type}</TypePicker>
         <icon>{value.required}</icon>
         <icon>{delete}</icon> (if not root)
    </title>
</CustomPropertyEditor>
```

# Goal 3
Refactor the EnumPropertyEditor - used for both enum and enum_array types
```html
<EnumPropertyEditor>
    <title - contents left-to-right>
		<InLineEditor>{key}:</InLineEditor> (if not root)
		 <InLineEditor>{value.description}</InLineEditor>
         <TypePicker>{value.type}</TypePicker>
         <EnumPicker>{value.items.enums}</EnumPicker>
         <icon>{value.required}</icon>
         <icon>{delete}</icon> (if not root)
    </title>
</EnumPropertyEditor>
```

# Goal 4
Refactor the ArrayPropertyEditor into ArrayOfCustomPropertyEditor
```html
<ArrayOfCustomPropertyEditor>
    <title - contents left-to-right>
		<InLineEditor>{key}:</InLineEditor> (if not root)
		 <InLineEditor>{value.description}</InLineEditor>
         <TypePicker>{value.type}</TypePicker>
         <TypePicker>Items: {value.items.type}</TypePicker>
         <icon>{value.required}</icon>
         <icon>{delete}</icon> (if not root)
    </title>
</ArrayOfCustomPropertyEditor>
```

# Goal 5
Create a new ArrayOfArrayPropertyEditor
```html
<ArrayOfArrayPropertyEditor>
    <title - contents left-to-right>
		<InLineEditor>{key}:</InLineEditor> (if not root)
		 <InLineEditor>{value.description}</InLineEditor>
         <TypePicker>{value.type}</TypePicker>
         <TypePicker>Items: {value.items.type}</TypePicker>
         <icon>{value.required}</icon>
         <icon>{delete}</icon> (if not root)
    </title>
	<body - contents top-to-bottom>
		<PropertyEditorFactory(value.items)
	</body>
</ArrayOfArrayPropertyEditor>
```

# Goal 6
Create a new ArrayOfObjectPropertyEditor
```html
<ArrayOfObjectPropertyEditor>
    <title - contents left-to-right>
		<InLineEditor>{key}:</InLineEditor> (if not root)
		 <InLineEditor>{value.description}</InLineEditor>
         <TypePicker>{value.type}</TypePicker>
         <ItemsTypePicker>Items {value.items.type}</ItemsTypePicker>
         <button>Add Property</button>
         <icon>{value.required}</icon>
         <icon>{value.additional_props}</icon>
         <icon>{delete}</icon> (if not root)
    </title>
	<body - contents top-to-bottom>
		<for property in value.items.properties PropertyEditorFactory(property)
	</body>
</ArrayOfObjectPropertyEditor>
```

# Goal 7
Refactor the ObjectPropertyEditor - This will need minimal changes. 
```html
<ObjectPropertyEditor>
    <title - contents left-to-right>
		<InLineEditor>{key}:</InLineEditor> (if not root)
		 <InLineEditor>{value.description}</InLineEditor>
         <TypePicker>{value.type}</TypePicker>
         <button>Add Property</button>
         <icon>{value.required}</icon>
         <icon>{value.additional_props}</icon>
         <icon>{delete}</icon> (if not root)
    </title>
	<body - contents top-to-bottom>
		<for property in value.properties PropertyEditorFactory(property)
	</body>
</ObjectPropertyEditor>
```
