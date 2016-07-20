/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import merge from 'lodash.merge'
import cloneDeep from 'lodash.clonedeep'

import WpApiResponses from './fixtures/wp-api-responses'
import normalise from '../src/normalise'
import { ContentTypes, getContentType } from '../src/contentTypes'

function makeNormaliserTestData (contentType) {
  const first = WpApiResponses[contentType]
  const second = merge({}, cloneDeep(first), { id: first.id + 1, slug: first.slug + '1' })
  const multiple = [first, second]
  return { first, second, multiple }
}

const tests = {
  [ContentTypes.Category]: {
    expectedEntities: ['categories'],
    testKeyBySlug: true,
    testKeyById: true
  },
  [ContentTypes.Comment]: {
    expectedEntities: ['comments'],
    testKeyBySlug: true,
    testKeyById: false
  },
  [ContentTypes.Media]: {
    expectedEntities: ['media', 'users'],
    testKeyBySlug: true,
    testKeyById: true
  },
  [ContentTypes.Page]: {
    expectedEntities: ['pages', 'users', 'media'],
    testKeyBySlug: true,
    testKeyById: true
  },
  [ContentTypes.Single]: {
    expectedEntities: ['posts', 'users', 'media'],
    testKeyBySlug: true,
    testKeyById: true
  },
  [ContentTypes.PostStatus]: {
    expectedEntities: ['postStatuses'],
    testKeyBySlug: true,
    testKeyById: false
  }
  // TODO test remaining content types + a custom content type
}

Object.keys(tests).forEach((contentType) => {
  const options = getContentType(contentType)

  describe(`${contentType} normaliser`, () => {
    const { first, second, multiple } = makeNormaliserTestData(contentType)
    const { expectedEntities, testKeyBySlug, testKeyById } = tests[contentType]

    if (testKeyById) {
      it(`should normalise a single ${contentType} by ID`, () => {
        const flattened = normalise(options, first, 'id', true)
        expect(flattened.result).toEqual(first.id)
        expect(Object.keys(flattened.entities)).toEqual(expectedEntities)
      })

      it(`should normalise multiple ${contentType} by ID`, () => {
        const flattened = normalise(options, multiple, 'id', true)
        expect(flattened.result).toEqual([first.id, second.id])
      })
    }

    if (testKeyBySlug) {
      it(`should normalise a single ${contentType} by SLUG`, () => {
        const flattened = normalise(options, first, 'slug', true)
        expect(flattened.result).toEqual(first.slug)
        expect(Object.keys(flattened.entities)).toEqual(expectedEntities)
      })

      it(`should normalise multiple ${contentType} by SLUG`, () => {
        const flattened = normalise(options, multiple, 'slug', true)
        expect(flattened.result).toEqual([first.slug, second.slug])
      })
    }
  })
})
