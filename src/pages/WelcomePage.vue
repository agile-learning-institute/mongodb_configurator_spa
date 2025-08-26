<template>
  <v-container fluid class="pa-0">
    <v-row justify="center" align="center" style="min-height: 100vh;">
      <v-col cols="12" class="pa-0">
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
                  <div class="d-flex flex-column justify-start align-start h-100 pa-8" style="height: calc(100vh - 120px); width: 100%;">
                    
                    <!-- Overview slide with detailed content -->
                    <div v-if="slide.detailedContent" class="overview-content" :data-test="`slide-content-${index}`">
                      <p class="text-h5 text-medium-emphasis mb-6" :data-test="`slide-description-${index}`" v-html="slide.description"></p>
                      <div class="detailed-content" v-html="slide.detailedContent" :data-test="`slide-detailed-content-${index}`"></div>
                      
                      <!-- Quick start section for Welcome slide -->
                      <div v-if="slide.title === 'Welcome'" class="mt-6">
                        <p>For a quick start you can create a <v-btn variant="outlined" size="small" color="primary" @click="createNewCollection">New Collection</v-btn> and review help screens from there.</p>
                      </div>
                    </div>
                    
                    <!-- Other slides with simple description -->
                    <div v-else :data-test="`slide-content-${index}`">
                      <p class="text-h5 text-medium-emphasis mb-8" :data-test="`slide-description-${index}`" v-html="slide.description"></p>
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
            <div class="d-flex justify-center pa-2" data-test="carousel-dots">
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
      </v-col>
    </v-row>
    
    <!-- Help Dialog -->
    <HelpDialog
      v-model="showHelp"
      :title="currentHelp?.title || ''"
      :content="currentHelp?.content || ''"
      data-test="help-dialog"
    />

    <!-- New Collection Dialog -->
    <v-dialog v-model="showNewCollectionDialog" max-width="600px" data-test="new-collection-dialog">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4" data-test="new-collection-dialog-title">
          <v-icon start color="primary" class="mr-2">mdi-plus-circle</v-icon>
          Create New Collection
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <div class="d-flex flex-column gap-6">
            <!-- Collection Name -->
            <div>
              <h4 class="text-subtitle-1 font-weight-medium mb-4 text-medium-emphasis">Collection Details</h4>
              <v-text-field
                v-model="newCollectionName"
                label="Collection Name"
                :error="!!nameError"
                :error-messages="nameError || undefined"
                placeholder="my_collection"
                :disabled="creating"
                @keyup.enter="createCollection"
                variant="outlined"
                density="compact"
                data-test="new-collection-name-input"
              />
              <p class="text-caption text-medium-emphasis mt-2" data-test="new-collection-help-text">
                Collection names must start with a letter and contain only letters, numbers, and underscores.
              </p>
            </div>

            <!-- Collection Description -->
            <div>
              <v-text-field
                v-model="newCollectionDescription"
                label="Collection Description"
                placeholder="Describe the purpose of this collection"
                :disabled="creating"
                variant="outlined"
                density="compact"
                data-test="new-collection-description-input"
              />
            </div>

            <!-- Version Components -->
            <div class="version-components">
              <h4 class="text-subtitle-1 font-weight-medium mb-4 text-medium-emphasis">Version Components</h4>
              
              <!-- Major Version -->
              <div class="version-row mb-4">
                <div class="version-label">
                  <span class="text-body-1 font-weight-medium">Major</span>
                  <span class="text-caption text-medium-emphasis d-block">Breaking changes</span>
                </div>
                <div class="version-controls">
                  <v-text-field
                    v-model.number="newVersion.major"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="version-input"
                    min="0"
                  />
                  <v-btn
                    icon="mdi-plus"
                    variant="text"
                    size="small"
                    @click="newVersion.major++"
                    :disabled="creating"
                  />
                  <v-btn
                    icon="mdi-minus"
                    variant="text"
                    size="small"
                    @click="newVersion.major = Math.max(0, newVersion.major - 1)"
                    :disabled="creating"
                  />
                </div>
              </div>

              <!-- Minor Version -->
              <div class="version-row mb-4">
                <div class="version-label">
                  <span class="text-body-1 font-weight-medium">Minor</span>
                  <span class="text-caption text-medium-emphasis d-block">New features</span>
                </div>
                <div class="version-controls">
                  <v-text-field
                    v-model.number="newVersion.minor"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="version-input"
                    min="0"
                  />
                  <v-btn
                    icon="mdi-plus"
                    variant="text"
                    size="small"
                    @click="newVersion.minor++"
                    :disabled="creating"
                  />
                  <v-btn
                    icon="mdi-minus"
                    variant="text"
                    size="small"
                    @click="newVersion.minor = Math.max(0, newVersion.minor - 1)"
                    :disabled="creating"
                  />
                </div>
              </div>

              <!-- Patch Version -->
              <div class="version-row mb-4">
                <div class="version-label">
                  <span class="text-body-1 font-weight-medium">Patch</span>
                  <span class="text-caption text-medium-emphasis d-block">Bug fixes</span>
                </div>
                <div class="version-controls">
                  <v-text-field
                    v-model.number="newVersion.patch"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="version-input"
                    min="0"
                  />
                  <v-btn
                    icon="mdi-plus"
                    variant="text"
                    size="small"
                    @click="newVersion.patch++"
                    :disabled="creating"
                  />
                  <v-btn
                    icon="mdi-minus"
                    variant="text"
                    size="small"
                    @click="newVersion.patch = Math.max(0, newVersion.patch - 1)"
                    :disabled="creating"
                  />
                </div>
              </div>

              <!-- Version Preview -->
              <div class="version-preview">
                <div class="text-caption text-medium-emphasis mb-2">Final Version:</div>
                <div class="version-display">
                  <span class="text-h6 font-weight-bold">{{ newVersionString }}</span>
                  <span class="text-caption text-medium-emphasis d-block">+ enumerator version</span>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            @click="showNewCollectionDialog = false"
            :disabled="creating"
            data-test="new-collection-cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createCollection"
            :loading="creating"
            :disabled="!newCollectionName.trim()"
            data-test="new-collection-create-btn"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHelp } from '@/composables/useHelp'
import { apiService } from '@/utils/api'
import HelpDialog from '@/components/HelpDialog.vue'

const { showHelp, currentHelp } = useHelp()
const router = useRouter()

const currentSlide = ref(0)
const route = useRoute()

// New collection dialog state
const showNewCollectionDialog = ref(false)
const newCollectionName = ref('')
const newCollectionDescription = ref('')
const nameError = ref<string | null>(null)
const creating = ref(false)

// Version state for new collection
const newVersion = ref({
  major: 0,
  minor: 0,
  patch: 0,
})

const newVersionString = computed(() => {
  return `${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}`
})

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

// Validate collection name
const validateCollectionName = (name: string): boolean => {
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
  if (!pattern.test(name)) {
    nameError.value = 'Collection name must start with a letter and contain only letters, numbers, and underscores'
    return false
  }
  nameError.value = null
  return true
}

// Create new collection using PUT endpoints
const createCollection = async () => {
  const name = newCollectionName.value.trim()
  
  if (!name) {
    nameError.value = 'Collection name is required'
    return
  }

  if (!validateCollectionName(name)) {
    return
  }

  creating.value = true
  try {
    // Get the newest enumerator version
    const enumeratorFiles = await apiService.getEnumerators()
    let newestEnumeratorVersion = 0
    
    if (enumeratorFiles && enumeratorFiles.length > 0) {
      // Filter out any files that don't have the expected structure
      const validFiles = enumeratorFiles.filter((f: any) => f && f.file_name && typeof f.file_name === 'string')
      
      if (validFiles.length > 0) {
        const versions = validFiles
          .map((f: any) => {
            const match = f.file_name.match(/enumerations\.(\d+)\.yaml/)
            return match ? parseInt(match[1], 10) : 0
          })
          .filter((version: number) => !isNaN(version))
        
        newestEnumeratorVersion = versions.length > 0 ? Math.max(...versions) : 0
      }
    }
    
    const version = `${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.${newestEnumeratorVersion}`
    const configFileName = `${name}.yaml`
    
    // Create configuration file
    const configuration = {
      file_name: configFileName,
      title: name,
      description: newCollectionDescription.value || `Configuration for ${name} collection`,
      versions: [{
        version: version,
        dictionary: `${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.yaml`,
        enumerators: `enumerations.${newestEnumeratorVersion}.yaml`,
        indexes: [],
        migrations: []
      }]
    }
    
    // Create dictionary file
    const dictionary = {
      root: {
        name: "root",
        type: "object",
        description: newCollectionDescription.value || `Dictionary for ${name} collection`,
        properties: [
          {"name": "_id", "type": "identifier"},
          {"name": "name", "type": "word"},
          {"name": "last_saved", "type": "breadcrumb"}
        ]
      }
    }
    
    // Create test data file
    const testData: any[] = []
    
    // Save all files using PUT endpoints
    await apiService.saveConfiguration(configFileName, configuration)
    await apiService.saveDictionary(`${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.yaml`, dictionary)
    await apiService.saveTestDataFile(`${name}.${newVersion.value.major}.${newVersion.value.minor}.${newVersion.value.patch}.${newestEnumeratorVersion}.json`, testData)
    
    // Close dialog and reset
    showNewCollectionDialog.value = false
    newCollectionName.value = ''
    newCollectionDescription.value = ''
    nameError.value = null
    newVersion.value = { major: 0, minor: 0, patch: 0 }
    
    // Navigate to the new collection's detail page
    router.push(`/configurations/${configFileName}`)
    
  } catch (err: any) {
    nameError.value = err.message || 'Failed to create collection'
  } finally {
    creating.value = false
  }
}

// Open new collection dialog
const createNewCollection = () => {
  showNewCollectionDialog.value = true
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
      <p>Collection Configuration versions use a 3-part semantic Schema version number plus an Enumerators version. When configuring a collection, only newer versions are applied. Creating a new version automatically locks the currently active version. See <a href="#locking-panel">configuration locking</a> for more information about configuration locking.</p>
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
        <p class="text-body-2 mb-0"><strong>Note:</strong> Custom types are not versioned. Once locked, they should be considered immutable assets used by your data dictionaries. If you should need to change a custom type that has already been deployed to meaningful environments, you will need to create a new custom type with a slightly different name. See <a href="#locking-panel">configuration locking</a> for more information about what it means to <em>lock</em> a configuration.</p>
      </div>
    `
  },
  {
    icon: 'mdi-format-list-checks',
    title: 'Enumerator',
    description: 'Create sets of allowed values for Enum or Enum Array properties.',
    detailedContent: `
      <h2>Enum and Enum Array Type Support</h2>
      <p>To support Dictionary <em>enum</em> and <em>enum_array</em> types simple schema leverages a list of valid enumerators, and the individual enumeration values with descriptions. Enumerators are loaded to a specified collection during configuration, making it easy to provide the information needed by a Javascript Web application to support choosers or drop downs. Enumerator versions are managed automatically, and only the latest enumerators should be unlocked. See <a href="#locking-panel">configuration locking</a> for more information about what it means to <em>lock</em> a configuration.</p>
      
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
    title: 'Events',
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
  font-size: 1.1rem;
}

.detailed-content :deep(h2) {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  color: #1976d2;
}

.detailed-content :deep(h3) {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 1.25rem 0 0.5rem 0;
  color: #424242;
}

.detailed-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

.detailed-content :deep(ul), .detailed-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  font-size: 1.1rem;
}

.detailed-content :deep(li) {
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.detailed-content :deep(strong) {
  font-weight: 600;
  color: #1976d2;
}

.version-components {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.version-label {
  flex: 1;
}

.version-controls {
  display: flex;
  align-items: center;
}

.version-input {
  width: 80px;
}

.version-preview {
  text-align: center;
}

.version-display {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>