/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import pickEntityIds from '../../src/util/pick-entity-ids'

jest.disableAutomock()

describe('util/pickEntityIds', () => {
  it('picks an id', () => {
    const ids = pickEntityIds([{ id: 'id' }])
    expect(ids).toEqual(['id'])
  })

  it('picks id over slug for content type with id', () => {
    const ids = pickEntityIds([{ id: 'id', slug: 'slug', type: 'post' }])
    expect(ids).toEqual(['id'])
  })

  it('picks slug from content type without id', () => {
    const ids = pickEntityIds([{ taxonomy: 'category', slug: 'slug' }])
    expect(ids).toEqual(['slug'])
  })

  it('picks slug and id from multiple entities', () => {
    const ids = pickEntityIds([
      { taxonomy: 'category', slug: 'slug' },
      { type: 'post', id: 'id' }
    ])
    expect(ids).toEqual(['id', 'slug'])
  })
})
