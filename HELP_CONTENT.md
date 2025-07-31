# MongoDB Configurator Help Content

## Overview Slide

Editors Note: The **Icon** is to be displayed on the page title along side the text that changes with each pane. It currently uses mdi-information-outline on all pages. 

**Title:** Overview  
**Icon:** mdi-information-outline  
**Description:** If you responsible for the quality of the data in a Mongo database, or the performance of queries in that database then the MongoDB Configurator is here to help. Using the configurator you can package your database configurations into an immutable container for testing and deployment. 

**Detailed Content:**
```html
<h2>Key Features</h2>
<ul>
  <li><strong>Collection Configurations:</strong> Anchor your configurations, allowing you to define release versions and configure indexing.</li>
  <li><strong>Data Dictionaries:</strong> Create human-readable schema definitions that isolate the complexity of bson/json schema with named custom types</li>
  <li><strong>Custom Types:</strong> Create human readable type primitives for use in a dictionary</li>
  <li><strong>Enumerators:</strong> If you're concerned with data quality the gold standard is an enumerated set of valid values</li>
  <li><strong>Test Data:</strong> Create and load test data to verify configurations or make a convenient database available to developers</li>
  <li><strong>Migrations:</strong> In the unfortunate circumstance when a scheme of change requires that the database be updated, The configurator gives you away to define configure and test complex migration pipelines</li>
</ul>

<h2>Navigation</h2>
<p>Use the navigation drawer on the left to access different sections of the application. Each section provides specialized tools for managing specific aspects of your MongoDB schemas.</p>

<h2>Help System</h2>
<p>This help system provides detailed information about each feature. Click the help icon (?) in any section to access contextual help content.</p>
```

---

## ~~Collection~~ Configuration Slide

**Title:** Configuration  
**Icon:** ~~mdi-database~~ mdiCompass
**Description:** Collection configurations anchor the management of your Mongo database. This is where you configure schema validation and indexing options.

**Detailed Content:**
```html
<h2>Schema Versioning</h2>
<p> demo validation is the primary feature of the configurator. Implementing a version based approach to defining and applying steam of validation is accomplished in the configuration file. Each version number identifies a Dictionary version with the first three digits and an Enumerators version with the fourth digit. See Dictionary and Enumerator for more information on those features.</p>
<h2>Processing</h2>
<p>When a configuration is processed the configuration version of the collection that currently exists Is evaluated, And only newer Versions are applied. The utility is non-destructive as it will not apply version configurations that have already been applied within the database. When a Configuration Version is applied the following steps are accomplished</p>
<ol>
  <li><strong>Remove Schema Validation:</strong> Remove any existing schema validation configurations</li>
  <li><strong>Drop Indexes:</strong> If index should be removed this is when they're dropped</li>
  <li><strong>Execute Migration:</strong> If migrations are required this is when they run</li>
  <li><strong>Add Indexes:</strong> If New indexes for this version are identified this is when they're created</li>
  <li><strong>Apply Schema Validation:</strong> Apply the new schema validation configurations to the collection</li>
  <li><strong>Load Test Data:</strong> If Test data is provided and loading test data is configured the container will automatically load the specified test data. This is a great way to test your indexing and schema validation configurations</li>
</ol>

```
---

## Dictionary Slide

**Title:** Dictionary  
**Icon:** mdi-book-open-variant  
**Description:** Create human-readable schema definitions that isolate the terse syntax of bson/json schema.

**Detailed Content:**
```html
<h2>Simple Schema</h2>
<p> the concept of configuration dictionary is to make the process of documenting Data schema more accessible to non-software engineers. People without a software engineering context can be intimidated by the syntax involved in defining a json schema, Or even more confused if you're asking them to understand bson. A simple schema uses the idea of custom types that are defined with human accessible names. See below for additional detail about custom types, as well as several special simple schema types</p>
<ul>
  <li><strong>Custom Type:</strong> A human description of a data type (i.e. street address, phone number, sentence, or paragraph).</li>
  <li><strong>Enumerated Types:</strong> A date type that represents an item from an enumerated list. See Enumerators.</li>
  <li><strong>Object Types:</strong> A list of named properties.</li>
  <li><strong>Array Types:</strong> An array of property items.</li>
  <li><strong>One Of Types:</strong> A structure for representing polymorphic data structures.</li>
  <li><strong>Reference Types:</strong> A reference to another dictionary.</li>
</ul>

<h2>Custom Types</h2>
<p>A custom type can have any name other than the identified simple types below. Names should be short and meaningful, Embedded white space in a type name is not allowed. If you are defining dictionary property that has a custom type you don't need to specify any additional information.</p>
<img>screen shot of custom property</img>

<h2>Enumerated Types</h2>
<p> when you can define a data type it should be one of a defined set of valid values, You can have very high-quality data and you can support optional user experiences especially with touch devices. When you use the enum type,  you must identify which valid list of enumerators should be used. See Enumerators for additional information on creating enumerations. The Enum Array type is used for an array of values from an enumeration. </p>
<img>screen shot of property</img>

<h2>Object Types</h2>
<p></p>
<img>An object type is simply a way to group a set of related properties. The root property for most dictionaries is an object type. Object types have a special <em>Additional Properties</em> indicator that allows you to define loosely constrained data structures.</img>

<h2>Array Types</h2>
<p> An Array type is simply a List of Values defined as properties. When you identify the types of items that will be contained in the array, You can specify the additional attributes necessary to define the property.</p>
<img>screen shot of array of custom</img>
<img>screen shot of array of object</img>

<h2>One Of and Constant Types</h2>
<p> Powerful data structures often include polymorphic types of data. The one of data type is used to identify the list of possible types that a data property might comply with. The one of constraint is frequently combined with the constant constraint used to identify a type indicator for the polymorphic object.</p>
<img>screen shot of one_of with type: constant</img>

<h2>Reference Types</h2>
<p> if a dictionary is feeling cumbersome or there is excessive levels of nesting you might want to consider breaking the dictionary apart into multiple dictionaries. You can use the Ref type property to include those dictionaries</p>
<img>screen shot of property</img>

<h3>Required Properties</h3>
<p>Every property can be identified as a required property using the check-box icon on the property. Note that this is different from json and bson schemas where they specify required as an array attribute of an object. Schema rendering converts these value for you.</p>
```
---

## Type Slide

**Title:** Type  
**Icon:** mdi-shape-outline  
**Description:** Define reusable type definitions that isolate the complexities of terse scheme a language.

**Detailed Content:**
```html
<h2>Complex Types</h2>
<ul>
  <li><strong>Object:</strong> Item Description</li>
  <li><strong>Array:</strong> Item Description</li>
</ul>

<h2>Primitive Types</h2>
<ul>
  <li><strong>Simple Primitive:</strong> Item Description</li>
  <li><strong>Complex Primitive:</strong> Item Description</li>
</ul>

```
---

## Enumerator Slide

**Title:** Enumerator  
**Icon:** mdi-format-list-checks  
**Description:** Create sets of allowed values for Enum or Enum Array properties.

**Detailed Content:**
```html
<h2>Enumerations</h2>
<p>An enumeration is the name we use to describe the list of values and their descriptions. </p>

<h2>Enumerators</h2>
<p>A Versioned file containing a list of Enumerations. This is the Version Number used when defining a schema version.

```
---

## Test Data Slide

**Title:** Test Data  
**Icon:** mdi-test-tube  
**Description:** Test Data that can be loaded into the database during Version Processing

**Detailed Content:**
```html
<p>A list of JSON documents</p>

```
---

## Migration Slide

**Title:** Migration  
**Icon:** mdi-database-sync  
**Description:** Create data transformation scripts for schema updates.

**Detailed Content:**
```html
<h2>A MongoDB Pipeline</h2>
<p>A list of JSON steps</p>

```
---
