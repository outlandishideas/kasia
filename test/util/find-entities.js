/* global jest:false, expect:false */

jest.disableAutomock()

import findEntities from '../../src/util/find-entities'

describe('util/findEntities', () => {
  it('should be a function', () => {
    expect(typeof findEntities).toEqual('function')
  })

  it('should filter entities by id', () => {
    const actual = findEntities({
      posts: { 0: { id: 0, slug: 'post', title: 'post' } },
      pages: { 1: { id: 1, slug: 'page', title: 'page' } }
    }, 'id', [0])
    const expected = {
      posts: { 0: { id: 0, slug: 'post', title: 'post' } }
    }
    expect(actual).toEqual(expected)
  })

  it('should filter entities by slug', () => {
    const actual = findEntities({
      posts: { 0: { id: 0, slug: 'post', title: 'post' } },
      pages: { 1: { id: 1, slug: 'page', title: 'page' } }
    }, 'slug', ['page'])
    const expected = {
      pages: { 1: { id: 1, slug: 'page', title: 'page' } }
    }
    expect(actual).toEqual(expected)
  })

  it('should filter entities by id, fallback on slug', () => {
    const actual = findEntities({
      posts: { 0: { slug: 'post', title: 'post' } },
      pages: { 1: { id: 1, slug: 'page', title: 'page' } }
    }, 'id', ['post'])
    const expected = {
      posts: { 0: { slug: 'post', title: 'post' } }
    }
    expect(actual).toEqual(expected)
  })

  it('should filter entities by slug, fallback on id', () => {
    const actual = findEntities({
      posts: { 0: { id: 0, slug: 'post', title: 'post' } },
      pages: { 1: { id: 1, title: 'page' } }
    }, 'slug', [1])
    const expected = {
      pages: { 1: { id: 1, title: 'page' } }
    }
    expect(actual).toEqual(expected)
  })
})
