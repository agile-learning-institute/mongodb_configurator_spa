import { computed, ref } from 'vue'
import { 
  type Property,
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
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}

export function usePropertyTypeEditor(property: Property, options: PropertyTypeEditorOptions = {}) {
  const {
    isDictionary = false,
    isType = false,
    disabled = false
  } = options

  // Reactive state
  const expanded = ref(false)
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

  // Validation errors
  const validationErrors = computed(() => {
    const errors: string[] = []

    // Check required fields
    if (!property.name || property.name.trim() === '') {
      errors.push('Property name is required')
    }

    if (!property.description || property.description.trim() === '') {
      errors.push('Property description is required')
    }

    // Type-specific validation
    if (isArray.value && isArrayProperty(property) && !property.items) {
      errors.push('Array properties must have an items definition')
    }

    if (isObject.value && isObjectProperty(property) && !Array.isArray(property.properties)) {
      errors.push('Object properties must have a properties array')
    }

    if (isSimple.value && isSimpleProperty(property) && !property.schema) {
      errors.push('Simple properties must have a schema definition')
    }

    if (isComplex.value && isComplexProperty(property) && (!property.json_type || !property.bson_type)) {
      errors.push('Complex properties must have both JSON and BSON type definitions')
    }

    if (isEnum.value && isEnumProperty(property) && !property.enums) {
      errors.push('Enum properties must have an enums reference')
    }

    if (isEnumArray.value && isEnumArrayProperty(property) && !property.enums) {
      errors.push('Enum array properties must have an enums reference')
    }

    if (isRef.value && isRefProperty(property) && !property.ref) {
      errors.push('Reference properties must have a ref value')
    }

    if (isConstant.value && isConstantProperty(property) && !property.constant) {
      errors.push('Constant properties must have a constant value')
    }

    if (isOneOf.value && isOneOfProperty(property) && !Array.isArray(property.properties)) {
      errors.push('One of properties must have a properties array')
    }

    return errors
  })

  // Methods
  const handleUpdate = (updatedProperty: Property) => {
    Object.assign(property, updatedProperty)
  }

  const handleDelete = () => {
    // Emit delete event - handled by parent
  }

  const handleTypeChange = (newType: string) => {
    property.type = newType
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

  // Helper methods for object and one_of properties
  const addProperty = () => {
    if (isObject.value && isObjectProperty(property) && Array.isArray(property.properties)) {
      const newProperty = {
        name: `property_${property.properties.length + 1}`,
        description: '',
        type: 'string',
        required: false
      }
      property.properties.push(newProperty)
    }

    if (isOneOf.value && isOneOfProperty(property) && Array.isArray(property.properties)) {
      const newProperty = {
        name: `property_${property.properties.length + 1}`,
        description: '',
        type: 'string',
        required: false
      }
      property.properties.push(newProperty)
    }
  }

  const removeProperty = (index: number) => {
    if (isObject.value && isObjectProperty(property) && Array.isArray(property.properties)) {
      property.properties.splice(index, 1)
    }

    if (isOneOf.value && isOneOfProperty(property) && Array.isArray(property.properties)) {
      property.properties.splice(index, 1)
    }
  }

  return {
    // State
    expanded,
    showValidationErrors,
    disabled,

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

    // Methods
    handleUpdate,
    handleDelete,
    handleTypeChange,
    toggleExpanded,
    showErrors,
    hideErrors,
    addProperty,
    removeProperty
  }
} 