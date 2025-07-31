import { ref } from 'vue'

export interface HelpContent {
  title: string
  content: string
}

export function useHelp() {
  const showHelp = ref(false)
  const currentHelp = ref<HelpContent | null>(null)

  const helpContent: Record<string, HelpContent> = {
    welcome: {
      title: 'MongoDB Configurator Overview',
      content: `
        <h1>MongoDB Configurator Overview</h1>
        <p>The MongoDB Configurator is a comprehensive tool for managing MongoDB schema configurations and processing operations. This application provides a unified interface for creating, editing, and managing all aspects of your MongoDB database schemas.</p>
        
        <h2>Key Features</h2>
        <ul>
          <li><strong>Collection Configurations:</strong> Define MongoDB collections with versioned schemas and processing operations</li>
          <li><strong>Data Dictionaries:</strong> Create human-readable schema definitions that hide complexity in simple and complex primitive types</li>
          <li><strong>Custom Types:</strong> Define reusable type definitions for complex schemas</li>
          <li><strong>Enumerators:</strong> Create sets of allowed values for enum properties</li>
          <li><strong>Test Data:</strong> Generate sample documents for testing your collections</li>
          <li><strong>Migrations:</strong> Create data transformation scripts for schema updates</li>
        </ul>
        
        <h2>Getting Started</h2>
        <p>To get started with the MongoDB Configurator:</p>
        <ol>
          <li>Create a new collection configuration to define your MongoDB collection structure</li>
          <li>Define your data dictionary to create human-readable schema definitions</li>
          <li>Create custom types as needed for complex data structures</li>
          <li>Add enumerators for sets of allowed values</li>
          <li>Generate test data for validation and testing</li>
          <li>Create migrations for schema evolution</li>
          <li>Process your configurations to apply changes to your database</li>
        </ol>
        
        <h2>Navigation</h2>
        <p>Use the navigation drawer on the left to access different sections of the application. Each section provides specialized tools for managing specific aspects of your MongoDB schemas.</p>
        
        <h2>Help System</h2>
        <p>This help system provides detailed information about each feature. Click the help icon (?) in any section to access contextual help content.</p>
      `
    },
    
    configurations: {
      title: 'Collection Configurations',
      content: `
        <h1>Collection Configurations</h1>
        <p>Collection configurations define the structure and behavior of MongoDB collections.</p>
        
        <h2>Configuration Structure</h2>
        <p>Each configuration includes:</p>
        <ul>
          <li><strong>Name:</strong> The collection name</li>
          <li><strong>Description:</strong> Human-readable description</li>
          <li><strong>Versions:</strong> Versioned schema definitions</li>
        </ul>
        
        <h2>Version Management</h2>
        <p>Each version can include:</p>
        <ul>
          <li><strong>Drop Indexes:</strong> Indexes to remove</li>
          <li><strong>Migrations:</strong> Data transformation scripts</li>
          <li><strong>Add Indexes:</strong> New indexes to create</li>
          <li><strong>Test Data:</strong> Sample data for testing</li>
        </ul>
      `
    },
    
    dictionaries: {
      title: 'Data Dictionaries',
      content: `
        <h1>Data Dictionaries</h1>
        <p>Data dictionaries provide human-readable schema definitions that hide complexity in simple and complex primitive types.</p>
        
        <h2>Dictionary Properties</h2>
        <p>Dictionary properties support the following types:</p>
        <ul>
          <li><strong>Array:</strong> Lists of values</li>
          <li><strong>Object:</strong> Structured objects with properties</li>
          <li><strong>Enum:</strong> Enumerated values</li>
          <li><strong>Enum Array:</strong> Arrays of enumerated values</li>
          <li><strong>Reference:</strong> References to other types</li>
          <li><strong>Constant:</strong> Fixed values</li>
          <li><strong>Custom:</strong> Custom type definitions</li>
          <li><strong>One Of:</strong> Union types</li>
        </ul>
        
        <h2>Design Philosophy</h2>
        <blockquote>
          The core idea of a Dictionary is to be a human consumable schema that hides complexity in simple/complex primitive types.
        </blockquote>
        <p>Properties are displayed as simple lines: <code>Name: Description TYPE</code></p>
      `
    },
    
    types: {
      title: 'Custom Types',
      content: `
        <h1>Custom Types</h1>
        <p>Custom types define reusable schema components that can be referenced by dictionaries and other types.</p>
        
        <h2>Type Properties</h2>
        <p>Type properties support the following types:</p>
        <ul>
          <li><strong>Simple:</strong> JSON schema definitions</li>
          <li><strong>Complex:</strong> Dual JSON/BSON schema definitions</li>
          <li><strong>Object:</strong> Structured objects with properties</li>
          <li><strong>Array:</strong> Lists of values</li>
          <li><strong>Custom:</strong> Custom type definitions</li>
        </ul>
        
        <h2>Usage</h2>
        <p>Custom types can be:</p>
        <ul>
          <li>Referenced by dictionaries using the <code>ref</code> type</li>
          <li>Used to create complex nested structures</li>
          <li>Shared across multiple collections</li>
        </ul>
      `
    },
    
    enumerators: {
      title: 'Enumerators',
      content: `
        <h1>Enumerators</h1>
        <p>Enumerators define sets of allowed values for enum and enum_array properties.</p>
        
        <h2>Creating Enumerators</h2>
        <p>To create an enumerator:</p>
        <ol>
          <li>Add a new enumeration</li>
          <li>Define the enumeration name</li>
          <li>Add values with descriptions</li>
          <li>Save the enumerator file</li>
        </ol>
        
        <h2>Using Enumerators</h2>
        <p>Enumerators can be used in:</p>
        <ul>
          <li><strong>Enum properties:</strong> Single enumerated values</li>
          <li><strong>Enum array properties:</strong> Arrays of enumerated values</li>
        </ul>
      `
    },
    
    testData: {
      title: 'Test Data',
      content: `
        <h1>Test Data</h1>
        <p>Test data provides sample documents for testing your MongoDB collections.</p>
        
        <h2>Creating Test Data</h2>
        <p>Test data files contain JSON arrays of sample documents that match your schema definitions.</p>
        
        <h2>MongoDB Extended JSON</h2>
        <p>Test data supports MongoDB Extended JSON format, including:</p>
        <ul>
          <li><code>$oid</code>: Object IDs</li>
          <li><code>$date</code>: Date objects</li>
          <li><code>$numberLong</code>: Long integers</li>
          <li><code>$numberDecimal</code>: Decimal numbers</li>
        </ul>
      `
    },
    
    migrations: {
      title: 'Migrations',
      content: `
        <h1>Migrations</h1>
        <p>Migrations are MongoDB aggregation pipelines that transform data between schema versions.</p>
        
        <h2>Migration Structure</h2>
        <p>Migration files contain JSON arrays of aggregation pipeline stages that:</p>
        <ul>
          <li>Transform existing data to match new schemas</li>
          <li>Add or remove fields</li>
          <li>Change data types</li>
          <li>Update nested structures</li>
        </ul>
        
        <h2>Usage</h2>
        <p>Migrations are automatically applied when:</p>
        <ul>
          <li>Processing collection configurations</li>
          <li>Updating to new schema versions</li>
        </ul>
      `
    }
  }

  const showHelpFor = (page: string) => {
    const content = helpContent[page]
    if (content) {
      currentHelp.value = content
      showHelp.value = true
    }
  }

  const closeHelp = () => {
    showHelp.value = false
    currentHelp.value = null
  }

  return {
    showHelp,
    currentHelp,
    showHelpFor,
    closeHelp
  }
} 