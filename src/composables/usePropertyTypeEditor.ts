import { ref, computed, watch } from 'vue'
import { 
  type Property,
  type TypeProperty,
  type DictionaryProperty,
  isArrayProperty,
  isObjectProperty,
  isSimpleProperty,
  isComplexProperty,
  isEnumProperty,
  isEnumArrayProperty,
  isRefProperty,
  isConstantProperty,
  isCustomProperty,
  isOneOfProperty
} from '@/types/types'

export interface PropertyTypeEditorOptions {
  disabled?: boolean
  isDictionary?: boolean
  isType?: boolean
  onUpdate?: (property: Property) => void
  onDelete?: () => void
  onTypeChange?: (type: string) => void
}

export function usePropertyTypeEditor(
  property: Property,
  options: PropertyTypeEditorOptions = {}
) {
  const {
    disabled = false,
    isDictionary = false,
    isType = false,
    onUpdate,
    onDelete,
    onTypeChange
  } = options

  // Reactive state
  const expanded = ref(true)
  const showValidationErrors = ref(false)

  // Computed properties for type checking
  const isArray = computed(() => isArrayProperty(property))
  const isObject = computed(() => isObjectProperty(property))
  const isSimple = computed(() => isSimpleProperty(property))
  const isComplex = computed(() => isComplexProperty(property))
  const isEnum = computed(() => isEnumProperty(property))
  const isEnumArray = computed(() => isEnumArrayProperty(property))
  const isRef = computed(() => isRefProperty(property))
  const isConstant = computed(() => isConstantProperty(property))
  const isCustom = computed(() => isCustomProperty(property))
  const isOneOf = computed(() => isOneOfProperty(property))

  // Available types based on context
  const availableTypes = computed(() => {
    const allTypes = [
      { title: 'Array', value: 'array' },
      { title: 'Object', value: 'object' },
      { title: 'Simple', value: 'simple' },
      { title: 'Complex', value: 'complex' },
      { title: 'Enum', value: 'enum' },
      { title: 'Enum Array', value: 'enum_array' },
      { title: 'Reference', value: 'ref' },
      { title: 'Constant', value: 'constant' },
      { title: 'One Of', value: 'one_of' },
      { title: 'Custom', value: 'custom' }
    ]
    
    if (isType) {
      // Type files only support: simple, complex, object, array, custom
      return allTypes.filter(t => ['simple', 'complex', 'object', 'array', 'custom'].includes(t.value))
    }
    
    if (isDictionary) {
      // Dictionary files don't support: simple, complex
      return allTypes.filter(t => !['simple', 'complex'].includes(t.value))
    }
    
    return allTypes
  })

  // Validation
  const validationErrors = computed(() => {
    const errors: string[] = []
    
    if (!property.name || property.name.trim() === '') {
      errors.push('Property name is required')
    }
    
    if (!property.description || property.description.trim() === '') {
      errors.push('Property description is required')
    }
    
    // Type-specific validation
    if (isArray.value && !property.items) {
      errors.push('Array properties must have items defined')
    }
    
    if (isObject.value && !Array.isArray(property.properties)) {
      errors.push('Object properties must have properties array')
    }
    
    if (isSimple.value && !property.schema) {
      errors.push('Simple properties must have schema defined')
    }
    
    if (isComplex.value && (!property.json_type || !property.bson_type)) {
      errors.push('Complex properties must have both JSON and BSON types defined')
    }
    
    if (isEnum.value && !property.enums) {
      errors.push('Enum properties must have enum name defined')
    }
    
    if (isEnumArray.value && !property.enums) {
      errors.push('Enum array properties must have enum name defined')
    }
    
    if (isRef.value && !property.ref) {
      errors.push('Reference properties must have ref defined')
    }
    
    if (isConstant.value && !property.constant) {
      errors.push('Constant properties must have constant value defined')
    }
    
    if (isOneOf.value && !Array.isArray(property.properties)) {
      errors.push('OneOf properties must have properties array')
    }
    
    return errors
  })

  const isValid = computed(() => validationErrors.value.length === 0)

  // Methods
  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(property)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    }
  }

  const handleTypeChange = (newType: string) => {
    if (onTypeChange) {
      onTypeChange(newType)
    }
  }

  const toggleExpanded = () => {
    expanded.value = !expanded.value
  }

  const showErrors = () => {
    showValidationErrors.value = true
  }

  const hideErrors = () => {
    showValidationErrors.value = false
  }

  // Helper methods for specific property types
  const addObjectProperty = () => {
    if (isObject.value && Array.isArray(property.properties)) {
      const newProperty: Property = {
        name: `property_${property.properties.length + 1}`,
        description: '',
        type: 'string',
        required: false
      }
      property.properties.push(newProperty)
      handleUpdate()
    }
  }

  const removeObjectProperty = (index: number) => {
    if (isObject.value && Array.isArray(property.properties)) {
      property.properties.splice(index, 1)
      handleUpdate()
    }
  }

  const addOneOfProperty = () => {
    if (isOneOf.value && Array.isArray(property.properties)) {
      const newProperty: Property = {
        name: `property_${property.properties.length + 1}`,
        description: '',
        type: 'string',
        required: false
      }
      property.properties.push(newProperty)
      handleUpdate()
    }
  }

  const removeOneOfProperty = (index: number) => {
    if (isOneOf.value && Array.isArray(property.properties)) {
      property.properties.splice(index, 1)
      handleUpdate()
    }
  }

  // Watch for property changes
  watch(() => property, () => {
    // Reset validation errors when property changes
    hideErrors()
  }, { deep: true })

  return {
    // State
    expanded,
    showValidationErrors,
    
    // Computed
    isArray,
    isObject,
    isSimple,
    isComplex,
    isEnum,
    isEnumArray,
    isRef,
    isConstant,
    isCustom,
    isOneOf,
    availableTypes,
    validationErrors,
    isValid,
    
    // Methods
    handleUpdate,
    handleDelete,
    handleTypeChange,
    toggleExpanded,
    showErrors,
    hideErrors,
    addObjectProperty,
    removeObjectProperty,
    addOneOfProperty,
    removeOneOfProperty
  }
} 