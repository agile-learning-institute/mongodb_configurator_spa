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

Types that have more than one or two extra fields will display their content in a collapsible ``body`` with the details. This should be limited to the list of properties for a object or one_of type, or the array items as a child of a array property. Array property variations are based on the type of the items. For array of types that only have a single extra prop that prop should be displayed on the same title line. For array items of type object, or one_of the properties list is in the body. For array of array's the sub-array is in the body. A lot of this functionality works today, but the code seems to be a bit scattered, duplicated, and not very maintainable.

Let's start by adding a section to the bottom of this REFACTOR.md where you keep track of our decisions, plan out implementation phases and steps. As we work together you will be free to make all the changes needed to complete the steps in a phase. You should update the plan with progress, and make a meaningful commit as each step is completed. When all the steps in a phase are complete I will perform acceptance testing, before you continue on to start the next phase.

---

# Plan goes here
