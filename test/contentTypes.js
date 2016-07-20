/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import values from 'lodash.values'

import configureStore from './util/configureStore'
import { ContentTypes, getContentTypes } from '../src/contentTypes'

let store

function createStore (options) {
  options.host = 'host'
  store = configureStore(options).store
}

function makeContentTypeObj (name, plural, slug) {
  return { name, plural, slug }
}

describe('contentTypes', () => {
  describe('unhappy path', () => {
    values(ContentTypes).forEach((builtInType) => {
      it(`throws an invariant exception when name is a built in type ${builtInType}`, () => {
        const contentTypes = [
          makeContentTypeObj(builtInType, builtInType, builtInType)
        ]

        expect(() => createStore({ contentTypes }))
          .toThrowError(/already exists/)
      })
    })
  })

  describe('happy path', () => {
    it('adds contentType to list', () => {
      const contentTypes = [{
        name: 'article',
        plural: 'articles',
        slug: 'articles'
      }]

      createStore({ contentTypes })

      expect(getContentTypes().article)
        .toEqual(makeContentTypeObj('article', 'articles', 'articles'))
    })

    it('adds contentType to list with camelCased type', () => {
      const contentTypes = [{
        name: 'blogPost',
        plural: 'blogPosts',
        slug: 'blog-posts'
      }]

      createStore({ contentTypes })

      expect(getContentTypes().blogPost)
        .toEqual(makeContentTypeObj('blogPost', 'blogPosts', 'blog-posts'))
    })

    it('maintains more than one contentType on list', () => {
      const contentTypes = [{
        name: 'newspaper',
        plural: 'newspapers',
        slug: 'newspapers'
      }, {
        name: 'book',
        plural: 'books',
        slug: 'books'
      }]

      createStore({ contentTypes })

      expect(getContentTypes().article)
        .toEqual(makeContentTypeObj('article', 'articles', 'articles'))

      expect(getContentTypes().book)
        .toEqual(makeContentTypeObj('book', 'books', 'books'))
    })
  })
})
