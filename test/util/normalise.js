/* global jest:false */

jest.disableAutomock()

import '../__mocks__/WP'
import { ContentTypes } from '../../src/constants/ContentTypes'
import { normalise, schemasManager, contentTypesManager } from '../../src/util'

function setup () {
  const testKeyById = true
  const testKeyBySlug = true

  contentTypesManager.register({
    name: 'book',
    plural: 'books',
    slug: 'books'
  })

  return {
    [ContentTypes.Category]: {
      // The expected entity collections on the store
      collections: ['categories'],
      // Whether to test normalisation by 'id' attr.
      testKeyById,
      // Whether to test normalisation by 'slug' attr.
      testKeyBySlug
    },
    [ContentTypes.Comment]: {
      collections: ['comments'],
      testKeyById
    },
    [ContentTypes.Media]: {
      collections: ['media'],
      testKeyById
    },
    [ContentTypes.Page]: {
      collections: ['pages'],
      testKeyById,
      testKeyBySlug
    },
    [ContentTypes.Post]: {
      collections: ['posts'],
      testKeyById,
      testKeyBySlug
    },
    [ContentTypes.PostStatus]: {
      collections: ['statuses'],
      testKeyBySlug
    },
    [ContentTypes.PostType]: {
      collections: ['types'],
      testKeyBySlug
    },
    [ContentTypes.Tag]: {
      collections: ['tags'],
      testKeyById,
      testKeyBySlug
    },
    [ContentTypes.Taxonomy]: {
      collections: ['taxonomies'],
      testKeyBySlug
    },
    [ContentTypes.User]: {
      collections: ['users'],
      testKeyById,
      testKeyBySlug
    },
    book: {
      collections: ['books'],
      testKeyById,
      testKeyBySlug
    }
  }
}

function fixtures (contentType) {
  const first = require('../__fixtures__/wp-api-responses/' + contentType).default

  // Imitate another entity by modifying identifiers
  const second = Object.assign({}, first, {
    id: first.id + 1,
    slug: first.slug + '1'
  })

  return {
    first,
    second,
    multiple: [first, second]
  }
}

describe('util/normalise', () => {
  const tests = setup()

  Object.keys(tests).forEach((contentType) => {
    describe('Normalise ' + contentType, () => {
      const { plural } = contentTypesManager.get(contentType)
      const { first, second, multiple } = fixtures(contentType)
      const { collections, testKeyBySlug, testKeyById } = tests[contentType]

      afterEach(() => schemasManager.__flush__())

      if (testKeyById) {
        it(`should normalise single "${contentType}" by id`, () => {
          const result = normalise(first, 'id')
          const actual = Object.keys(result)
          expect(actual).toEqual(collections)
        })

        it(`should normalise multiple "${contentType}" by id`, () => {
          const result = normalise(multiple, 'id')
          const actual = Object.keys(result[plural])
          const expected = [first.id, second.id].map(String)
          expect(actual).toEqual(expected)
        })
      }

      if (testKeyBySlug) {
        it(`should normalise single "${contentType}" by slug`, () => {
          const result = normalise(first, 'slug')
          const actual = Object.keys(result)
          expect(actual).toEqual(collections)
        })

        it(`should normalise multiple "${contentType}" by slug`, () => {
          const result = normalise(multiple, 'slug')
          const actual = Object.keys(result[plural])
          const expected = [first.slug, second.slug]
          expect(actual).toEqual(expected)
        })
      }
    })
  })
})
