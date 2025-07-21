import { ref, computed, watch } from 'vue'

export interface Property {
  description: string
  type?: string
  required?: boolean
  additionalProperties?: boolean
  items?: Property
  properties?: Record<string, Property>
  schema?: any
  json_type?: any
  bson_type?: any
  enums?: string[]
  oneOf?: Record<string, any>
}

export interface PropertyEditorOptions {
  disabled?: boolean
  excludeType?: string
  topLevel?: boolean
  propertyName?: string
  topLevelName?: string
  onUpdate?: (property: Property) => void
  onDelete?: () => void
  onTypeChange?: (type: string) => void
  onPropertyNameChange?: (name: string) => void
}

export function usePropertyEditor(
  property: Property,
  options: PropertyEditorOptions = {}
) {
  const {
    disabled: _disabled = false,
    excludeType: _excludeType = '',
    topLevel = false,
    propertyName = '',
    topLevelName: _topLevelName = '',
    onUpdate,
    onDelete: _onDelete,
    onTypeChange,
    onPropertyNameChange
  } = options

  // Reactive state
  const editablePropertyName = ref(propertyName)
  const expanded = ref(false)
  const showOneOfDialog = ref(false)

  // Computed properties
  const isObjectType = computed(() => property.type === 'object')
  const isArrayType = computed(() => property.type === 'array')
  const isListType = computed(() => property.type === 'list')
  const isEnumType = computed(() => property.type === 'enum')
  const isEnumArrayType = computed(() => property.type === 'enum_array')
  const isRefType = computed(() => property.type === 'ref')
  const isPrimitiveType = computed(() => 
    ['string', 'number', 'boolean', 'date', 'email', 'url', 'phone', 'address'].includes(property.type || '')
  )

  const hasSubProperties = computed(() => {
    if (isObjectType.value) return property.properties && Object.keys(property.properties).length > 0
    if (isArrayType.value || isListType.value) return property.items && property.items.properties && Object.keys(property.items.properties).length > 0
    return false
  })

  const canHaveAdditionalProperties = computed(() => isObjectType.value)
  const canHaveOneOf = computed(() => isObjectType.value)
  const canBeRequired = computed(() => !topLevel)
  const canBeDeleted = computed(() => !topLevel && propertyName !== 'items')

  // Methods
  const handleChange = () => {
    if (onUpdate) {
      onUpdate(property)
    }
  }

  const handleTypeChange = (type: string) => {
    property.type = type
    
    // Reset type-specific properties when type changes
    if (type !== 'object') {
      delete property.properties
      delete property.additionalProperties
      delete property.oneOf
    }
    
    if (type !== 'array' && type !== 'list') {
      delete property.items
    }
    
    if (type !== 'enum' && type !== 'enum_array') {
      delete property.enums
    }
    
    if (type !== 'ref') {
      delete property.schema
    }

    handleChange()
    if (onTypeChange) {
      onTypeChange(type)
    }
  }

  const handlePropertyNameChange = (name: string) => {
    editablePropertyName.value = name
    if (onPropertyNameChange) {
      onPropertyNameChange(name)
    }
  }

  const toggleOneOf = () => {
    if (!property.oneOf) {
      property.oneOf = {}
    }
    showOneOfDialog.value = true
  }

  const addProperty = (parentProperty: Property, propertyName: string) => {
    if (!parentProperty.properties) {
      parentProperty.properties = {}
    }
    
    parentProperty.properties[propertyName] = {
      description: '',
      type: 'string',
      required: false
    }
    
    handleChange()
  }

  const deleteProperty = (parentProperty: Property, propertyName: string) => {
    if (parentProperty.properties) {
      delete parentProperty.properties[propertyName]
      handleChange()
    }
  }

  const addArrayItemProperty = () => {
    if (!property.items) {
      property.items = {
        description: 'Items in the list',
        type: 'string',
        required: false
      }
    } else if (!property.items.properties) {
      property.items.properties = {}
    }
    
    const newPropertyName = `property_${Object.keys(property.items.properties || {}).length + 1}`
    addProperty(property.items, newPropertyName)
  }

  const getPropertyIcon = () => {
    if (isObjectType.value) return 'mdi-shape-outline'
    if (isArrayType.value || isListType.value) return 'mdi-format-list-bulleted'
    if (isEnumType.value || isEnumArrayType.value) return 'mdi-format-list-checks'
    if (isRefType.value) return 'mdi-link'
    if (isPrimitiveType.value) return 'mdi-text'
    return 'mdi-help-circle-outline'
  }

  const getTypeLabel = () => {
    if (isObjectType.value) return 'Object'
    if (isArrayType.value) return 'Array'
    if (isListType.value) return 'List'
    if (isEnumType.value) return 'Enum'
    if (isEnumArrayType.value) return 'Enum Array'
    if (isRefType.value) return 'Reference'
    return property.type || 'Unknown'
  }

  // Watch for property name changes
  watch(() => propertyName, (newName) => {
    editablePropertyName.value = newName
  })

  return {
    // State
    editablePropertyName,
    expanded,
    showOneOfDialog,
    
    // Computed
    isObjectType,
    isArrayType,
    isListType,
    isEnumType,
    isEnumArrayType,
    isRefType,
    isPrimitiveType,
    hasSubProperties,
    canHaveAdditionalProperties,
    canHaveOneOf,
    canBeRequired,
    canBeDeleted,
    
    // Methods
    handleChange,
    handleTypeChange,
    handlePropertyNameChange,
    toggleOneOf,
    addProperty,
    deleteProperty,
    addArrayItemProperty,
    getPropertyIcon,
    getTypeLabel
  }
} 