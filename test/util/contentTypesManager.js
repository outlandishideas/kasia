/* global jest:false */

jest.disableAutomock()

import '../mocks/WP'
import { ContentTypes } from '../../src/constants/ContentTypes'
import contentTypesManager from '../../src/util/contentTypesManager'

describe('#getAll', () => {
  it('returns an object', () => {
    const type = typeof contentTypesManager.getAll()
    expect(type).toEqual('object')
  })
})

describe('#get', () => {
  it('returns an object', () => {
    const type = typeof contentTypesManager.get(ContentTypes.Post)
    expect(type).toEqual('object')
  })
})

describe('#register', () => {
  it('throws with bad options object', () => {
    expect(() => contentTypesManager.register(''))
      .toThrowError('Invalid content type object. See documentation http://kasia.io.')
  })

  Object.values(ContentTypes).forEach((builtInType) => {
    it('throws when name is ' + builtInType, () => {
      const opts = {
        name: builtInType,
        plural: builtInType,
        slug: builtInType
      }

      expect(() => contentTypesManager.register(opts))
        .toThrowError(`Content type with name "${builtInType}" already exists.`)
    })
  })

  it('adds custom content type to cache', () => {
    const contentType = {
      name: 'article',
      plural: 'articles',
      slug: 'articles'
    }

    contentTypesManager.register(contentType)

    expect(contentTypesManager.getAll().article).toEqual(contentType)
  })
})
