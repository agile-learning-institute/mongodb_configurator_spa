<template>
  <v-container fluid class="pa-0">
    <v-row justify="center" align="center" style="min-height: 100vh;">
      <v-col cols="12" class="pa-0">
        <!-- Help Carousel -->
        <v-card class="help-carousel" variant="outlined" elevation="0">
          <v-card-title class="d-flex align-center pa-6">
            <v-icon icon="mdi-information-outline" class="mr-2" />
            <span class="text-h4">{{ helpSlides[currentSlide].title }}</span>
          </v-card-title>
          <v-card-text class="pa-0">
            <div class="carousel-container">
              <!-- Previous Button -->
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                size="large"
                class="carousel-nav-btn prev-btn"
                @click="previousSlide"
                :disabled="currentSlide === 0"
              />
              
              <v-window v-model="currentSlide" class="help-window">
                <v-window-item
                  v-for="(slide, index) in helpSlides"
                  :key="index"
                  :value="index"
                >
                  <div class="d-flex flex-column justify-center align-center h-100 pa-8" style="height: calc(100vh - 120px); width: 100%;">
                    
                    <!-- Overview slide with detailed content -->
                    <div v-if="slide.detailedContent" class="overview-content">
                      <p class="text-h6 text-medium-emphasis text-center mb-6">{{ slide.description }}</p>
                      <div class="detailed-content" v-html="slide.detailedContent"></div>
                    </div>
                    
                    <!-- Other slides with simple description -->
                    <div v-else>
                      <v-icon :icon="slide.icon" size="80" color="primary" class="mb-6" />
                      <p class="text-h6 text-medium-emphasis text-center mb-8">{{ slide.description }}</p>
                    </div>
                    
                  </div>
                </v-window-item>
              </v-window>
              
              <!-- Next Button -->
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                size="large"
                class="carousel-nav-btn next-btn"
                @click="nextSlide"
                :disabled="currentSlide === helpSlides.length - 1"
              />
            </div>
            
            <!-- Navigation dots -->
            <div class="d-flex justify-center pa-4">
              <v-btn
                v-for="(_, index) in helpSlides"
                :key="index"
                :icon="currentSlide === index ? 'mdi-circle' : 'mdi-circle-outline'"
                variant="text"
                size="small"
                @click="currentSlide = index"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Help Dialog -->
    <HelpDialog
      v-model="showHelp"
      :title="currentHelp?.title || ''"
      :content="currentHelp?.content || ''"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHelp } from '@/composables/useHelp'
import HelpDialog from '@/components/HelpDialog.vue'

const { showHelp, currentHelp } = useHelp()

const currentSlide = ref(0)
const route = useRoute()

// Initialize slide based on URL parameter
onMounted(() => {
  const slideParam = route.query.slide
  if (slideParam && typeof slideParam === 'string') {
    const slideIndex = parseInt(slideParam)
    if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < helpSlides.length) {
      currentSlide.value = slideIndex
    }
  }
})

const helpSlides = [
  {
    icon: 'mdi-information-outline',
    title: 'Overview',
    description: 'If you are responsible for the quality of the data in a MongoDB database, or the performance of queries in that database, then the MongoDB Configurator is here to help. Using the configurator you can package your database configurations into an immutable container for testing and deployment.',
    detailedContent: `
      <h2>Key Features</h2>
      <ul>
        <li><strong>Collection Configurations:</strong> Anchor your configurations, allowing you to define release versions and configure indexing.</li>
        <li><strong>Data Dictionaries:</strong> Create human-readable schema definitions that isolate the complexity of BSON/JSON schema with named custom types</li>
        <li><strong>Custom Types:</strong> Create human-readable type primitives for use in a dictionary</li>
        <li><strong>Enumerators:</strong> If you're concerned with data quality, the gold standard is an enumerated set of valid values</li>
        <li><strong>Test Data:</strong> Create and load test data to verify configurations or make a convenient database available to developers</li>
        <li><strong>Migrations:</strong> In the unfortunate circumstance when a schema change requires that the database be updated, the configurator gives you a way to define, configure and test complex migration pipelines</li>
      </ul>
      
      <h2>Navigation</h2>
      <p>Use the navigation drawer on the left to access different sections of the application. Each section provides specialized tools for managing specific aspects of your MongoDB schemas.</p>
      
      <h2>Help System</h2>
      <p>This help system provides detailed information about each feature. Click the help icon (?) in any section to access contextual help content.</p>
    `
  },
  {
    icon: 'mdi-compass',
    title: 'Configuration',
    description: 'Collection configurations anchor the management of your MongoDB database. This is where you configure schema validation and indexing options.',
    detailedContent: `
      <h2>Schema Versioning</h2>
      <p>Schema validation is the primary feature of the configurator. Implementing a version-based approach to defining and applying schema validation is accomplished in the configuration file. Each version number identifies a Dictionary version with the first three digits and an Enumerators version with the fourth digit. See Dictionary and Enumerator for more information on those features.</p>
      
      <h2>Processing</h2>
      <p>When a configuration is processed, the configuration version of the collection that currently exists is evaluated, and only newer versions are applied. The utility is non-destructive as it will not apply version configurations that have already been applied within the database. When a Configuration Version is applied, the following steps are accomplished:</p>
      <ol>
        <li><strong>Remove Schema Validation:</strong> Remove any existing schema validation configurations</li>
        <li><strong>Drop Indexes:</strong> If indexes should be removed, this is when they're dropped</li>
        <li><strong>Execute Migration:</strong> If migrations are required, this is when they run</li>
        <li><strong>Add Indexes:</strong> If new indexes for this version are identified, this is when they're created</li>
        <li><strong>Apply Schema Validation:</strong> Apply the new schema validation configurations to the collection</li>
        <li><strong>Load Test Data:</strong> If test data is provided and loading test data is configured, the container will automatically load the specified test data. This is a great way to test your indexing and schema validation configurations</li>
      </ol>
    `
  },
  {
    icon: 'mdi-book-open-variant',
    title: 'Dictionary',
    description: 'Create human-readable schema definitions that isolate the terse syntax of BSON/JSON schema.',
    detailedContent: `
      <h2>Simple Schema</h2>
      <p>The concept of configuration dictionary is to make the process of documenting data schema more accessible to non-software engineers. People without a software engineering context can be intimidated by the syntax involved in defining a JSON schema, or even more confused if you're asking them to understand BSON. A simple schema uses the idea of custom types that are defined with human-accessible names. See below for additional detail about custom types, as well as several special simple schema types:</p>
      <ul>
        <li><strong>Custom Type:</strong> A human description of a data type (i.e. street address, phone number, sentence, or paragraph).</li>
        <li><strong>Enumerated Types:</strong> A data type that represents an item from an enumerated list. See Enumerators.</li>
        <li><strong>Object Types:</strong> A list of named properties.</li>
        <li><strong>Array Types:</strong> An array of property items.</li>
        <li><strong>One Of Types:</strong> A structure for representing polymorphic data structures.</li>
        <li><strong>Reference Types:</strong> A reference to another dictionary.</li>
      </ul>
      
      <h2>Custom Types</h2>
      <p>A custom type can have any name other than the identified simple types below. Names should be short and meaningful. Embedded white space in a type name is not allowed. If you are defining a dictionary property that has a custom type, you don't need to specify any additional information.</p>
      
      <h2>Enumerated Types</h2>
      <p>When you can define a data type, it should be one of a defined set of valid values. You can have very high-quality data and you can support optimal user experiences, especially with touch devices. When you use the enum type, you must identify which valid list of enumerators should be used. See Enumerators for additional information on creating enumerations. The Enum Array type is used for an array of values from an enumeration.</p>
      
      <h2>Object Types</h2>
      <p>An object type is simply a way to group a set of related properties. The root property for most dictionaries is an object type. Object types have a special <em>Additional Properties</em> indicator that allows you to define loosely constrained data structures.</p>
      
      <h2>Array Types</h2>
      <p>An Array type is simply a list of values defined as properties. When you identify the types of items that will be contained in the array, you can specify the additional attributes necessary to define the property.</p>
      
      <h2>One Of and Constant Types</h2>
      <p>Powerful data structures often include polymorphic types of data. The one of data type is used to identify the list of possible types that a data property might comply with. The one of constraint is frequently combined with the constant constraint used to identify a type indicator for the polymorphic object.</p>
      
      <h2>Reference Types</h2>
      <p>If a dictionary is feeling cumbersome or there are excessive levels of nesting, you might want to consider breaking the dictionary apart into multiple dictionaries. You can use the Ref type property to include those dictionaries.</p>
      
      <h3>Required Properties</h3>
      <p>Every property can be identified as a required property using the checkbox icon on the property. Note that this is different from JSON and BSON schemas where they specify required as an array attribute of an object. Schema rendering converts these values for you.</p>
    `
  },
  {
    icon: 'mdi-shape-outline',
    title: 'Type',
    description: 'Define reusable type definitions that isolate the complexities of terse schema languages.',
    detailedContent: `
      <h2>Complex Types</h2>
      <ul>
        <li><strong>Object:</strong> Define complex object structures with nested properties and validation rules</li>
        <li><strong>Array:</strong> Create array types with specific item definitions and constraints</li>
      </ul>
      
      <h2>Primitive Types</h2>
      <ul>
        <li><strong>Simple Primitive:</strong> Basic data types like strings, numbers, booleans with validation</li>
        <li><strong>Complex Primitive:</strong> Advanced primitive types with JSON/BSON schema definitions</li>
      </ul>
    `
  },
  {
    icon: 'mdi-format-list-checks',
    title: 'Enumerator',
    description: 'Create sets of allowed values for Enum or Enum Array properties.',
    detailedContent: `
      <h2>Enumerations</h2>
      <p>An enumeration is the name we use to describe the list of values and their descriptions.</p>
      
      <h2>Enumerators</h2>
      <p>A versioned file containing a list of Enumerations. This is the version number used when defining a schema version.</p>
    `
  },
  {
    icon: 'mdi-test-tube',
    title: 'Test Data',
    description: 'Test data that can be loaded into the database during version processing.',
    detailedContent: `
      <h2>Test Data</h2>
      <p>A list of JSON documents that can be automatically loaded into your database during configuration processing. This is useful for testing your schema validation and indexing configurations.</p>
    `
  },
  {
    icon: 'mdi-database-sync',
    title: 'Migration',
    description: 'Create data transformation scripts for schema updates.',
    detailedContent: `
      <h2>MongoDB Pipeline</h2>
      <p>A list of JSON steps that define how to transform existing data when schema changes are applied. These migration pipelines ensure your data is properly updated when new schema versions are deployed.</p>
    `
  }
]

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < helpSlides.length - 1) {
    currentSlide.value++
  }
}
</script>

<style scoped>
.help-carousel {
  height: 100vh;
  border: none;
  border-radius: 0;
}

.help-window {
  height: calc(100vh - 120px);
}

.help-window :deep(.v-window__container) {
  height: 100%;
}

.help-window :deep(.v-window-item) {
  height: 100%;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  height: calc(100vh - 120px);
  padding: 0 80px; /* Add padding to account for navigation buttons */
}

.carousel-nav-btn {
  position: absolute;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.carousel-nav-btn:hover {
  background-color: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1);
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.carousel-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.overview-content {
  width: 100%;
  text-align: left;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
  padding: 0 20px;
}

.detailed-content {
  text-align: left;
  line-height: 1.6;
  width: 100%;
}

.detailed-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  color: #1976d2;
}

.detailed-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1.25rem 0 0.5rem 0;
  color: #424242;
}

.detailed-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.detailed-content :deep(ul), .detailed-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.detailed-content :deep(li) {
  margin-bottom: 0.25rem;
}

.detailed-content :deep(strong) {
  font-weight: 600;
  color: #1976d2;
}
</style> 