import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VersionConfiguration from '../../src/components/VersionConfiguration.vue'
import type { VersionConfig } from '../../src/types'

describe('VersionConfiguration', () => {
  const mockVersion: VersionConfig = {
    version: '1.0.0',
    test_data: 'test.json',
    add_indexes: [
      {
        name: 'test_index',
        key: { field: 1 }
      }
    ],
    drop_indexes: ['old_index'],
    aggregations: [
      {
        '$match': {
          status: 'active'
        }
      }
    ]
  }

  it('should render version information', () => {
    const wrapper = mount(VersionConfiguration, {
      props: {
        version: mockVersion,
        collectionName: 'test_collection'
      }
    })

    expect(wrapper.text()).toContain('Version Information')
    expect(wrapper.text()).toContain('1.0.0')
    expect(wrapper.text()).toContain('Test Data')
    expect(wrapper.text()).toContain('test.json')
  })

  it('should render render buttons', () => {
    const wrapper = mount(VersionConfiguration, {
      props: {
        version: { version: '1.0.0' },
        collectionName: 'test_collection'
      }
    })

    expect(wrapper.text()).toContain('Render JSON Schema')
    expect(wrapper.text()).toContain('Render BSON Schema')
    expect(wrapper.text()).toContain('Render OpenAPI Spec')
  })
}) 