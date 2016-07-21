/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import values from 'lodash.values'

import {
  ContentTypes,
  getContentTypes,
  getContentType,
  registerContentType
} from '../src/contentTypes'

describe('getContentTypes', () => {
  it('returns an object', () => {
    const type = typeof getContentTypes()
    expect(type).toEqual('object')
  })
})

describe('getContentType', () => {
  it('returns an object', () => {
    const type = typeof getContentType(ContentTypes.Post)
    expect(type).toEqual('object')
  })
})

describe('registerContentType', () => {
  it('throws with bad options object', () => {
    expect(() => {
      registerContentType('')
    }).toThrowError('Invalid content type object, see documentation.')
  })

  values(ContentTypes).forEach((builtInType) => {
    it('throws an when name is ' + builtInType, () => {
      const opts = {
        name: builtInType,
        plural: builtInType,
        slug: builtInType
      }

      expect(() => {
        registerContentType(opts)
      }).toThrowError(`Content type with name "${builtInType}" already exists.`)
    })
  })

  it('adds custom content type to cache', () => {
    const contentType = {
      name: 'article',
      plural: 'articles',
      slug: 'articles'
    }

    registerContentType(contentType)

    expect(getContentTypes().article).toEqual(contentType)
  })
})
