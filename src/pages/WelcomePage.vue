<template>
  <v-container>
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center">
        <v-icon icon="mdi-help-circle" size="large" color="primary" class="mr-3" />
        <h1 class="text-h3 font-weight-bold text-primary">MongoDB Configurator Help</h1>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="createNewCollection"
          data-test="new-collection-btn"
        >
          New Collection
        </v-btn>
      </div>
    </div>

    <!-- Help Carousel -->
    <v-card class="help-carousel" variant="outlined" elevation="0" data-test="help-carousel">
          <v-card-title class="d-flex align-center pa-6" data-test="carousel-title">
            <v-icon :icon="helpSlides[currentSlide].icon" class="mr-2" :data-test="`carousel-icon-${currentSlide}`" />
            <span class="text-h4" data-test="carousel-title-text">{{ helpSlides[currentSlide].title }}</span>
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
                data-test="carousel-prev-btn"
              />
              
              <v-window v-model="currentSlide" class="help-window" data-test="help-window">
                <v-window-item
                  v-for="(slide, index) in helpSlides"
                  :key="index"
                  :value="index"
                  :data-test="`carousel-slide-${index}`"
                >
                  <div class="slide-content">
                    
                    <!-- Overview slide with detailed content -->
                    <div v-if="slide.detailedContent" class="overview-content" :data-test="`slide-content-${index}`">
                      <p class="slide-description" :data-test="`slide-description-${index}`" v-html="slide.description"></p>
                      <div class="detailed-content" v-html="slide.detailedContent" :data-test="`slide-detailed-content-${index}`"></div>
                      
                      <!-- Quick start section for Welcome slide -->
                      <div v-if="slide.title === 'Welcome'" class="quick-start-section">
                        <p>For a quick start you can create a <v-btn variant="outlined" size="small" color="primary" @click="createNewCollection">New Collection</v-btn> and review help screens from there.</p>
                      </div>
                    </div>
                    
                    <!-- Other slides with simple description -->
                    <div v-else :data-test="`slide-content-${index}`">
                      <p class="slide-description" :data-test="`slide-description-${index}`" v-html="slide.description"></p>
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
                data-test="carousel-next-btn"
              />
            </div>
            
            <!-- Navigation dots -->
            <div class="carousel-dots" data-test="carousel-dots">
              <v-btn
                v-for="(_, index) in helpSlides"
                :key="index"
                :icon="currentSlide === index ? 'mdi-circle' : 'mdi-circle-outline'"
                variant="text"
                size="small"
                @click="currentSlide = index"
                :data-test="`carousel-dot-${index}`"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    
    <!-- Help Dialog -->
    <HelpDialog
      v-model="showHelp"
      :title="currentHelp?.title || ''"
      :content="currentHelp?.content || ''"
      data-test="help-dialog"
    />

    <!-- New Collection Dialog -->
    <NewCollectionDialog
      v-model="showNewCollectionDialog"
      @created="handleCollectionCreated"
      data-test="new-collection-dialog"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHelp } from '@/composables/useHelp'
import HelpDialog from '@/components/HelpDialog.vue'
import NewCollectionDialog from '@/components/NewCollectionDialog.vue'

const { showHelp, currentHelp } = useHelp()
const router = useRouter()

const currentSlide = ref(0)
const route = useRoute()

// New collection dialog state
const showNewCollectionDialog = ref(false)

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

// Open new collection dialog
const createNewCollection = () => {
  showNewCollectionDialog.value = true
}

// Handle collection creation from NewCollectionDialog
const handleCollectionCreated = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const helpSlides = [
  {
    icon: 'mdi-information-outline',
    title: 'Welcome',
    description: 'The mongoDB Configurator makes it easy for you to implement the <a href="https://www.mongodb.com/company/blog/building-with-patterns-the-schema-versioning-pattern" target="_blank">MongoDB Schema Versioning Pattern</a> best practices.',
    detailedContent: `
      <h2>Key Features</h2>
      <ul>
        <li><strong>Online Help</strong> is available using <i class="mdi mdi-help-circle"></i> <i class="mdi mdi-arrow-top-right"></i> from any page.</li>
        <li><strong>Collection Configurations</strong> control the configuration process.</li>
        <li><strong>Data Dictionaries</strong> provide a human friendly way to define data structures.</li>
        <li><strong>Custom Types</strong> specify json/bson schemas for Dictionary types.</li>
        <li><strong>Enumerators</strong> provide a versioned location for enumerator validation values.</li>
        <li><strong>Test Data</strong> can be loaded into the database to support a robust developer experience.</li>
        <li><strong>Migrations</strong> allow you to run migration pipelines to alter existing data when schema changes require it.</li>
      </ul>
    `
  },
  {
    icon: 'mdi-compass',
    title: 'Collection Configuration',
    description: '',
    detailedContent: `
      <h2>Configuration Processing</h2>
      <p>Collection configuration it's done using a six step process:</p>
      <ol>
        <li>Drop any existing Schema Validation</li>
        <li>Drop any indexes that should be removed</li>
        <li>Run any migrations that are needed to transform data</li>
        <li>Create any new indexes that are needed</li>
        <li>Apply the Validation Schema</li>
        <li>Load Test Data (when enabled)</li>
      </ol>
      
      <h2>Schema Versioning</h2>
      <p>Collection Configuration versions use a 3-part semantic Schema version number plus an Enumerators version. When configuring a collection, only newer versions are applied. Creating a new version automatically locks the currently active version. See <a href="#" @click="navigateToSlide(8)">configuration locking</a> for more information about configuration locking.</p>
    `
  },
  {
    icon: 'mdi-book-open-variant',
    title: 'Dictionary',
    description: 'Create simple technology agnostic schema definitions.',
    detailedContent: `
      <h2>Simple Schema</h2>
      <p>Configurator data dictionaries provide a simplified approach to defining data structures and validation constraints. This approach is technology agnostic and Creates dictionaries that can easily be shared with non-technical users. The configurator can also use these dictionaries to create json or bson schema for software engineers. These are the types used in a Dictionary:</p>
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
        <li><strong>Simple Primitive:</strong> Primitives where the only difference between a json schema and bson schema would be the change from a "type" property to a "bsonType" property. String types with pattern constraints can usually be simple primitives.</li>
        <li><strong>Complex Primitive:</strong> Allow you to define different constraints for bson/json schema. Object ID's that are 24-character strings when rendered to json schema are an example of a complex primitive.</li>
      </ul>
      
      <div class="mt-6 pa-4 bg-warning-lighten-5 border-warning border rounded">
        <p class="text-body-2 mb-0"><strong>Note:</strong> Custom types are not versioned. Once locked, they should be considered immutable assets used by your data dictionaries. If you should need to change a custom type that has already been deployed to meaningful environments, you will need to create a new custom type with a slightly different name. See <a href="#" @click="navigateToSlide(8)">configuration locking</a> for more information about what it means to <em>lock</em> a configuration.</p>
      </div>
    `
  },
  {
    icon: 'mdi-format-list-checks',
    title: 'Enumerator',
    description: 'Create sets of allowed values for Enum or Enum Array properties.',
    detailedContent: `
      <h2>Enum and Enum Array Type Support</h2>
      <p>To support Dictionary <em>enum</em> and <em>enum_array</em> types simple schema leverages a list of valid enumerators, and the individual enumeration values with descriptions. Enumerators are loaded to a specified collection during configuration, making it easy to provide the information needed by a Javascript Web application to support choosers or drop downs. Enumerator versions are managed automatically, and only the latest enumerators should be unlocked. See <a href="#" @click="navigateToSlide(8)">configuration locking</a> for more information about what it means to <em>lock</em> a configuration.</p>
      
      <div class="mt-6 pa-4 bg-info-lighten-5 border-info border rounded">
        <p class="text-body-2 mb-0"><strong>Note:</strong> These enumerators are for use when the list of valid enumerations are relatively stable. The configurator makes it easy to add new values to a list, but the deployment of that change does require a new version of the database configuration be deployed. Dynamic enumerator lists that allow real-time updates should be implemented as normal string primitives, with a custom data store for the valid values.</p>
      </div>
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
  },
  {
    icon: 'mdi-cog',
    title: 'Admin',
    description: 'View and manage API configuration settings.',
    detailedContent: `
      <h2>API Configuration</h2>
      <p>The Admin page provides access to view the Configurator API settings. This includes database connection parameters, server settings, and other configuration options.</p>
      
      <h2>Configuration Sources</h2>
      <p>Configuration values can come from different sources:</p>
      <ul>
        <li><strong>Configuration Files:</strong> Values loaded from configuration files (shown in blue) can not be overridden</li>
        <li><strong>Environment Variables:</strong> Values set through environment variables (shown in green)</li>
        <li><strong>Default Values:</strong> Built-in default values (shown in orange) if not specified elsewhere</li>
      </ul>
    `
  },
  {
    icon: 'mdi-calendar-clock',
    title: 'Configuration Processing Events',
    description: 'Monitor and track processing events and system operations.',
    detailedContent: `
      <h2>Event System</h2>
      <p>The Events system provides comprehensive tracking of all processing operations and system events within the MongoDB Configurator.</p>
      
      <h2>Event Types</h2>
      <ul>
        <li><strong>Processing Events:</strong> Track the progress of configuration processing operations</li>
        <li><strong>System Events:</strong> Monitor database operations, file changes, and system status</li>
        <li><strong>Error Events:</strong> Capture and display detailed error information for troubleshooting</li>
      </ul>
      
      <h2>Event Viewer</h2>
      <p>The Event Viewer page displays detailed information about events including:</p>
      <ul>
        <li><strong>Event ID:</strong> Unique identifier for each event</li>
        <li><strong>Event Type:</strong> Category of the event (processing, system, error)</li>
        <li><strong>Status:</strong> Current state of the event (pending, processing, completed, error)</li>
        <li><strong>Timestamps:</strong> Start and end times for the event</li>
        <li><strong>Details:</strong> Comprehensive information about the event execution</li>
        <li><strong>Sub-events:</strong> Nested events that provide granular tracking</li>
      </ul>
      
      <h2>Usage</h2>
      <p>Use the Events system to monitor processing operations, troubleshoot issues, and track system performance. Events are automatically created for all major operations and provide detailed information for debugging and monitoring.</p>
    `
  },
  {
    icon: 'mdi-lock',
    title: 'Locking',
    description: 'Understand how configuration locking works and its impact on your workflow.',
    detailedContent: `
      <h2>Configuration Locking</h2>
      <p>Configuration locking is a critical feature that ensures the integrity and consistency of your MongoDB configurations during deployment and processing.</p>
      
      <h2>What is Locking?</h2>
      <p>When a configuration is <strong>locked</strong>, it becomes read-only and cannot be modified. This prevents accidental changes to configurations that are currently active or have been deployed to production environments.</p>
      
      <h2>When Does Locking Occur?</h2>
      <ul>
        <li><strong>Version Creation:</strong> When you create a new version of a configuration, the previous version is automatically locked</li>
        <li><strong>Manual Locking:</strong> You can manually lock configurations to prevent further modifications</li>
        <li><strong>Deployment:</strong> Configurations are locked when they are deployed to ensure consistency</li>
      </ul>
      
      <h2>Locking Behavior</h2>
      <ul>
        <li><strong>Read-Only Access:</strong> Locked configurations can be viewed but not edited</li>
        <li><strong>No Property Changes:</strong> Property names, types, descriptions, and requirements cannot be modified</li>
        <li><strong>No Structure Changes:</strong> Adding, removing, or reordering properties is not allowed</li>
        <li><strong>Visual Indicators:</strong> Locked configurations display a clear "Locked" status indicator</li>
      </ul>
      
      <h2>Unlocking Considerations</h2>
      <p>While it's possible to unlock configurations, this should be done with extreme caution:</p>
      <ul>
        <li><strong>Production Impact:</strong> Unlocking deployed configurations can affect active systems</li>
        <li><strong>Version Consistency:</strong> Changes to locked configurations may create version conflicts</li>
        <li><strong>Data Integrity:</strong> Modifying locked configurations can affect data validation and indexing</li>
      </ul>
      
      <h2>Best Practices</h2>
      <ul>
        <li><strong>Plan Ahead:</strong> Ensure configurations are complete before locking</li>
        <li><strong>Version Management:</strong> Use version numbers to track configuration evolution</li>
        <li><strong>Testing:</strong> Test configurations thoroughly before locking</li>
        <li><strong>Documentation:</strong> Document the purpose and scope of each locked configuration</li>
      </ul>
    `
  }
]

const previousSlide = () => {
  if (currentSlide.value === 0) {
    currentSlide.value = helpSlides.length - 1
  } else {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value === helpSlides.length - 1) {
    currentSlide.value = 0
  } else {
    currentSlide.value++
  }
}

const navigateToSlide = (index: number) => {
  currentSlide.value = index
}
</script>

<style scoped>
.help-carousel {
  height: calc(100vh - 200px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.carousel-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 400px;
  max-height: calc(100vh - 200px);
}

.carousel-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1976d2;
}

.carousel-nav-btn:hover {
  background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 12px 40px rgba(25, 118, 210, 0.2), 0 6px 20px rgba(0, 0, 0, 0.12);
  border-color: rgba(25, 118, 210, 0.3);
}

.carousel-nav-btn:active {
  transform: translateY(-50%) scale(0.98);
}

.prev-btn {
  left: 30px;
}

.next-btn {
  right: 30px;
}

.help-window {
  flex: 1;
  width: 100%;
  padding: 0 100px;
}

.slide-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 50px 30px;
  min-height: 500px;
  max-height: 600px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.slide-description {
  font-size: 1.375rem;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 800px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.overview-content {
  max-width: 800px;
  width: 100%;
}

.detailed-content {
  line-height: 1.7;
  color: #34495e;
}

.detailed-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1976d2;
  margin: 2rem 0 1rem 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.1);
  position: relative;
}

.detailed-content h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 2px;
}

.detailed-content h3 {
  font-size: 1.375rem;
  font-weight: 600;
  color: #37474f;
  margin: 1.5rem 0 0.75rem 0;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.detailed-content p {
  margin-bottom: 1rem;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: #455a64;
}

.detailed-content ul, .detailed-content ol {
  margin-bottom: 1rem;
  padding-left: 1.75rem;
  font-size: 1.0625rem;
}

.detailed-content li {
  margin-bottom: 0.5rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #455a64;
  position: relative;
}

.detailed-content ul li::before {
  content: '•';
  color: #1976d2;
  font-weight: bold;
  position: absolute;
  left: -1.25rem;
}

.detailed-content strong {
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.quick-start-section {
  margin-top: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.05) 100%);
  border-radius: 12px;
  border: 2px solid rgba(25, 118, 210, 0.15);
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
  position: relative;
  overflow: hidden;
}

.quick-start-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 0%, #90caf9 100%);
}

.quick-start-section p {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
  color: #2c3e50;
  font-weight: 500;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
  border-top: 2px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.carousel-dots .v-btn {
  margin: 0 0.375rem;
  transition: all 0.3s ease;
  color: #1976d2;
}

.carousel-dots .v-btn:hover {
  transform: scale(1.2);
  color: #1565c0;
}

/* Custom scrollbar for slide content */
.slide-content::-webkit-scrollbar {
  width: 8px;
}

.slide-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.slide-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 4px;
}

.slide-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .help-window {
    padding: 0 80px;
  }
  
  .slide-content {
    padding: 30px 20px;
    min-height: 400px;
    max-height: 500px;
    margin: 15px;
  }
  
  .carousel-nav-btn {
    left: 15px;
    right: 15px;
    width: 48px;
    height: 48px;
  }
  
  .next-btn {
    right: 15px;
  }
  
  .slide-description {
    font-size: 1.25rem;
  }
  
  .detailed-content h2 {
    font-size: 1.5rem;
  }
  
  .detailed-content h3 {
    font-size: 1.25rem;
  }
}
</style>