// Shared TypeProperty interface to match the new API schema
export interface TypeProperty {
  name?: string
  description: string
  type: 'object' | 'array' | 'simple_primitive' | 'complex_primitive' | 'void' | string
  required: boolean
  // Object type properties
  properties?: Record<string, TypeProperty>
  additional_properties?: boolean
  // Array type properties
  items?: TypeProperty
  // Primitive type properties
  schema?: any // for simple_primitive
  json_type?: any // for complex_primitive
  bson_type?: any // for complex_primitive
}

// Type data structure returned by the API
export interface TypeData {
  file_name: string
  _locked: boolean
  root: TypeProperty
}

// Enumerator data structure returned by the API
export interface EnumeratorFile {
  file_name: string;
  version: number;
  _locked: boolean;
  enumerators: Record<string, Record<string, string>>;
  title?: string;
} 