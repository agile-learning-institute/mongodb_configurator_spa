<template>
  <div>
    <v-card class="upload-area" :class="{ 'upload-active': isDragOver }">
      <v-card-text class="text-center pa-8">
        <v-icon size="64" color="primary" class="mb-4">mdi-cloud-upload</v-icon>
        <h3 class="text-h5 mb-2">Upload {{ fileType }}</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          Drag and drop your {{ fileType }} files here, or click to browse
        </p>
        
        <v-btn 
          color="primary" 
          variant="outlined"
          @click="triggerFileInput"
          :loading="uploading"
        >
          <v-icon start>mdi-file-plus</v-icon>
          Choose Files
        </v-btn>
        
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".json,.yaml,.yml"
          @change="handleFileSelect"
          style="display: none"
        />
      </v-card-text>
    </v-card>

    <!-- Upload progress -->
    <div v-if="uploading" class="mt-4">
      <v-progress-linear
        :value="uploadProgress?.percentage || 0"
        color="primary"
        height="8"
        rounded
      />
      <p class="text-caption mt-1">
        Uploading... {{ uploadProgress?.percentage || 0 }}%
      </p>
    </div>

    <!-- Error display -->
    <div v-if="error" class="mt-4">
      <v-alert type="error">
        {{ error }}
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'

interface Props {
  fileType: 'configurations' | 'dictionaries' | 'types' | 'enumerators' | 'test_data' | 'migrations'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  uploaded: [fileName: string]
}>()

const {
  uploading,
  uploadProgress,
  error,
  uploadFile
} = useFileUpload(props.fileType)

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

// File input handling
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files) return
  
  for (const file of Array.from(files)) {
    await processFile(file)
  }
  
  // Reset input
  target.value = ''
}

// Drag and drop handling
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (!files) return
  
  for (const file of Array.from(files)) {
    await processFile(file)
  }
}

// Process uploaded file
const processFile = async (file: File) => {
  try {
    const content = await readFileContent(file)
    const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
    
    await uploadFile(fileName, content)
    emit('uploaded', fileName)
  } catch (err: any) {
    console.error('Failed to process file:', err)
  }
}

// Read file content
const readFileContent = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data = JSON.parse(content)
        resolve(data)
      } catch (err) {
        reject(new Error('Invalid JSON file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

// Event listeners
onMounted(() => {
  const uploadArea = document.querySelector('.upload-area')
  if (uploadArea) {
    uploadArea.addEventListener('dragover', handleDragOver)
    uploadArea.addEventListener('dragleave', handleDragLeave)
    uploadArea.addEventListener('drop', handleDrop)
  }
})

onUnmounted(() => {
  const uploadArea = document.querySelector('.upload-area')
  if (uploadArea) {
    uploadArea.removeEventListener('dragover', handleDragOver)
    uploadArea.removeEventListener('dragleave', handleDragLeave)
    uploadArea.removeEventListener('drop', handleDrop)
  }
})
</script>

<style scoped>
.upload-area {
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #1976D2;
  background-color: rgba(25, 118, 210, 0.04);
}

.upload-active {
  border-color: #1976D2;
  background-color: rgba(25, 118, 210, 0.08);
}
</style> 