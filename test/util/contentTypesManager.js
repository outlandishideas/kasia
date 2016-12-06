/* global jest:false */

jest.disableAutomock()

import '../__mocks__/WP'
import { ContentTypes } from '../../src/constants/ContentTypes'
import { contentTypesManager } from '../../src/util'

describe('util/contentTypesManager', () => {
  describe('#getAll', () => {
    it('returns an object', () => {
      const actual = typeof contentTypesManager.getAll()
      expect(actual).toEqual('object')
    })
  })

  describe('#get', () => {
    it('returns an object', () => {
      const actual = typeof contentTypesManager.get(ContentTypes.Post)
      expect(actual).toEqual('object')
    })
  })

  describe('#register', () => {
    it('throws with bad options object', () => {
      const fn = () => contentTypesManager.register('')
      const message = 'Invalid content type object. See documentation http://kasia.io.'
      expect(fn).toThrowError(message)
    })

    Object.values(ContentTypes).forEach((builtInType) => {
      it('throws when name is ' + builtInType, () => {
        const opts = { name: builtInType, plural: builtInType, slug: builtInType }
        const fn = () => contentTypesManager.register(opts)
        const expected = `Content type with name "${builtInType}" already exists.`
        expect(fn).toThrowError(expected)
      })
    })

    it('adds custom content type to cache', () => {
      const opts = { name: 'article', plural: 'articles', slug: 'articles' }
      contentTypesManager.register(opts)
      const actual = contentTypesManager.getAll().get('article')
      const expected = Object.assign({}, opts, {
        methodName: 'articles',
        route: '/articles/(?P<id>)'
      })
      expect(actual).toEqual(expected)
    })
  })
})
