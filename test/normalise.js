/* global jest:false */

jest.disableAutomock()

import merge from 'lodash.merge'

import normalise from '../src/normalise'

import {
  ContentTypes,
  registerContentType,
  getContentType
} from '../src/contentTypes'

function setup () {
  const mockWP = {
    registerRoute: jest.fn()
  }

  registerContentType(mockWP, {
    name: 'book',
    plural: 'books',
    slug: 'books'
  })

  const tests = {
    [ContentTypes.Category]: {
      // The expected entity collections on the store
      collections: ['categories'],
      // Whether to test normalisation by 'id' attr.
      testKeyById: true,
      // Whether to test normalisation by 'slug' attr.
      testKeyBySlug: true
    },
    [ContentTypes.Comment]: {
      collections: ['comments'],
      testKeyById: true,
      testKeyBySlug: false
    },
    [ContentTypes.Media]: {
      collections: ['media', 'users'],
      testKeyById: true,
      testKeyBySlug: true
    },
    [ContentTypes.Page]: {
      collections: ['pages', 'users', 'media'],
      testKeyById: true,
      testKeyBySlug: true
    },
    [ContentTypes.Post]: {
      collections: ['posts', 'users', 'media'],
      testKeyById: true,
      testKeyBySlug: true
    },
    [ContentTypes.PostStatus]: {
      collections: ['statuses'],
      testKeyById: false,
      testKeyBySlug: true
    },
    [ContentTypes.PostType]: {
      collections: ['types'],
      testKeyById: false,
      testKeyBySlug: true
    },
    [ContentTypes.Tag]: {
      collections: ['tags'],
      testKeyById: true,
      testKeyBySlug: true
    },
    [ContentTypes.Taxonomy]: {
      collections: ['taxonomies'],
      testKeyById: false,
      testKeyBySlug: true
    },
    [ContentTypes.User]: {
      collections: ['users'],
      testKeyById: true,
      testKeyBySlug: true
    },
    book: {
      collections: ['books'],
      testKeyById: true,
      testKeyBySlug: true
    }
  }

  return { tests }
}

function fixtures (contentType) {
  const first = require('./fixtures/wp-api-responses/' + contentType).default

  // Imitate another entity by modifying identifiers
  const second = merge({}, first, {
    id: first.id + 1,
    slug: first.slug + '1'
  })

  return {
    first,
    second,
    multiple: [first, second]
  }
}

describe('Normaliser', () => {
  const { tests } = setup()

  Object.keys(tests).forEach((contentType) => {
    describe('Normalise ' + contentType, () => {
      const { plural } = getContentType(contentType)
      const { first, second, multiple } = fixtures(contentType)
      const { collections, testKeyBySlug, testKeyById } = tests[contentType]

      if (testKeyById) {
        it(`should normalise single ${contentType} by id`, () => {
          const result = normalise([first], 'id')
          expect(Object.keys(result)).toEqual(collections)
        })

        it(`should normalise multiple ${contentType} by id`, () => {
          const result = normalise(multiple, 'id')
          expect(Object.keys(result[plural])).toEqual([first.id, second.id].map(String))
        })
      }

      if (testKeyBySlug) {
        it(`should normalise single ${contentType} by slug`, () => {
          const result = normalise([first], 'slug')
          expect(Object.keys(result)).toEqual(collections)
        })

        it(`should normalise multiple ${contentType} by slug`, () => {
          const result = normalise(multiple, 'slug')
          expect(Object.keys(result[plural])).toEqual([first.slug, second.slug])
        })
      }
    })
  })
})
