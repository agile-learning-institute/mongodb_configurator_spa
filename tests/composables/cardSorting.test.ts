import { describe, it, expect } from 'vitest'

describe('Card Grid Alphabetical Sorting', () => {
  it('sorts collections alphabetically (case-insensitive)', () => {
    const collections = [
      { collection_name: 'zebra' },
      { collection_name: 'alpha' },
      { collection_name: 'Beta' },
      { collection_name: 'apple' },
    ]

    const sorted = [...collections].sort((a, b) =>
      a.collection_name.localeCompare(b.collection_name, undefined, { sensitivity: 'base' })
    )

    expect(sorted.map(c => c.collection_name)).toEqual(['alpha', 'apple', 'Beta', 'zebra'])
  })

  it('sorts type files alphabetically (case-insensitive)', () => {
    const files = [
      { name: 'user.yaml' },
      { name: 'account.yaml' },
      { name: 'Profile.yaml' },
      { name: 'address.yaml' },
    ]

    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )

    expect(sorted.map(f => f.name)).toEqual([
      'account.yaml',
      'address.yaml',
      'Profile.yaml',
      'user.yaml',
    ])
  })

  it('sorts enumerator cards alphabetically by display name and preserves original index', () => {
    const enumerators = [
      { name: 'status', values: [] },
      { name: 'category', values: [] },
      { name: '_new_123456789', values: [] },
      { name: 'AccountType', values: [] },
    ]

    const getEnumDisplayName = (item: { name: string }) =>
      item.name.startsWith('_new') ? 'New enumeration' : item.name

    const sorted = enumerators
      .map((enumItem, originalIndex) => ({ enumItem, originalIndex }))
      .sort((a, b) => {
        const nameA = getEnumDisplayName(a.enumItem)
        const nameB = getEnumDisplayName(b.enumItem)
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
      })

    expect(sorted.map(s => getEnumDisplayName(s.enumItem))).toEqual([
      'AccountType',
      'category',
      'New enumeration',
      'status',
    ])

    // Verify original indexes match the items
    expect(sorted.find(s => s.enumItem.name === 'status')?.originalIndex).toBe(0)
    expect(sorted.find(s => s.enumItem.name === 'category')?.originalIndex).toBe(1)
    expect(sorted.find(s => s.enumItem.name === '_new_123456789')?.originalIndex).toBe(2)
    expect(sorted.find(s => s.enumItem.name === 'AccountType')?.originalIndex).toBe(3)
  })
})
