// Base Property interface matching OpenAPI schema
export interface BaseProperty {
  name: string
  description: string
  type: string
  required: boolean
}

// Array Property Type
export interface ArrayProperty extends BaseProperty {
  type: 'array'
  items: Property
}

// Object Property Type
export interface ObjectProperty extends BaseProperty {
  type: 'object'
  additional_properties?: boolean
  properties: Property[]
}

// Simple Property Type
export interface SimpleProperty extends BaseProperty {
  type: 'simple'
  schema: Record<string, any>
}

// Complex Property Type
export interface ComplexProperty extends BaseProperty {
  type: 'complex'
  json_type: Record<string, any>
  bson_type: Record<string, any>
}

// Enum Property Type
export interface EnumProperty extends BaseProperty {
  type: 'enum'
  enums: string // enum name
}

// Enum Array Property Type
export interface EnumArrayProperty extends BaseProperty {
  type: 'enum_array'
  enums: string // enum name
}

// Ref Property Type
export interface RefProperty extends BaseProperty {
  type: 'ref'
  ref: string // type file name
}

// Constant Property Type
export interface ConstantProperty extends BaseProperty {
  type: 'constant'
  constant: string
}

// Custom Property Type
export interface CustomProperty extends BaseProperty {
  type: string // custom type name
}

// OneOf Property Type
export interface OneOfProperty extends BaseProperty {
  type: 'one_of'
  properties: Property[]
}

// Union type for all Property types
export type Property = 
  | ArrayProperty
  | ObjectProperty
  | SimpleProperty
  | ComplexProperty
  | EnumProperty
  | EnumArrayProperty
  | RefProperty
  | ConstantProperty
  | CustomProperty
  | OneOfProperty

// Type Property (for Type files) - restricted set
export type TypeProperty = 
  | ArrayProperty
  | ObjectProperty
  | SimpleProperty
  | ComplexProperty
  | CustomProperty

// Dictionary Property (for Dictionary files) - restricted set
export type DictionaryProperty = 
  | ArrayProperty
  | ObjectProperty
  | EnumProperty
  | EnumArrayProperty
  | RefProperty
  | ConstantProperty
  | CustomProperty
  | OneOfProperty

// Type guards for property type checking
export const isArrayProperty = (property: Property): property is ArrayProperty => 
  property.type === 'array'

export const isObjectProperty = (property: Property): property is ObjectProperty => 
  property.type === 'object'

export const isSimpleProperty = (property: Property): property is SimpleProperty => 
  property.type === 'simple'

export const isComplexProperty = (property: Property): property is ComplexProperty => 
  property.type === 'complex'

export const isEnumProperty = (property: Property): property is EnumProperty => 
  property.type === 'enum'

export const isEnumArrayProperty = (property: Property): property is EnumArrayProperty => 
  property.type === 'enum_array'

export const isRefProperty = (property: Property): property is RefProperty => 
  property.type === 'ref'

export const isConstantProperty = (property: Property): property is ConstantProperty => 
  property.type === 'constant'

export const isCustomProperty = (property: Property): property is CustomProperty => 
  !['array', 'object', 'simple', 'complex', 'enum', 'enum_array', 'ref', 'constant', 'one_of'].includes(property.type)

export const isOneOfProperty = (property: Property): property is OneOfProperty => 
  property.type === 'one_of'

// Type data structure returned by the API
export interface TypeData {
  file_name: string
  _locked: boolean
  root: TypeProperty
}

// Dictionary data structure returned by the API
export interface DictionaryData {
  file_name: string
  _locked: boolean
  root: DictionaryProperty
}

// Enumerator data structure returned by the API
export interface EnumeratorValue {
  value: string
  description: string
}

export interface Enumerator {
  name: string
  values: EnumeratorValue[]
}

export interface EnumeratorFile {
  file_name: string
  version: number
  _locked: boolean
  enumerators: Enumerator[]
  title?: string
}

// Configuration data structure
export interface ConfigurationVersion {
  version: string
  drop_indexes?: string[]
  migrations?: string[]
  add_indexes?: any[]
  test_data?: string
  _locked?: boolean
}

export interface ConfigurationData {
  name: string
  description?: string
  versions: ConfigurationVersion[]
}

// File metadata
export interface FileMetadata {
  file_name: string
  created_at: string
  updated_at: string
  size: number
}

// Event data structure
export interface EventData {
  id: string
  type: string
  status: 'PENDING' | 'SUCCESS' | 'FAILURE'
  data?: any
  starts: string
  ends?: string
  sub_events?: EventData[]
}

// Config data structure
export interface ConfigItem {
  name: string
  value: string
  from: 'default' | 'file' | 'environment'
}

export interface ConfigData {
  config_items: ConfigItem[]
} 