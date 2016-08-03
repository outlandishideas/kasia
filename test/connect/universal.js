/* eslint-env jasmine */
/* global jest:false */

jest.unmock('invariant')

jest.unmock('../../src/connect/connectWpPost')
jest.unmock('../../src/connect/connectWpQuery')
jest.unmock('../../src/connect/preloaders')
jest.unmock('../../src/contentTypes')
jest.unmock('../../src/sagas')
jest.unmock('../../src/actions')
jest.unmock('../../src/invariants')

import { Request, RequestTypes } from '../../src/constants/ActionTypes'
import { ContentTypes } from '../../src/contentTypes'
import { fetch } from '../../src/sagas'

import {
  makeWpPostPreloaderFn,
  makeWpQueryPreloaderFn
} from '../../src/connect/preloaders'

const queryId = 'mockId'

describe('Universal utilities', () => {
  describe('connectWpPost', () => {
    const preload = makeWpPostPreloaderFn(
      queryId,
      ContentTypes.Post,
      (props) => props.id
    )

    const result = preload({ id: 16 })

    it('returns a function', () => {
      expect(typeof preload).toEqual('function')
    })

    it('throws with bad content type', () => {
      expect(() => {
        makeWpPostPreloaderFn(queryId, 'bad', () => {})()
      }).toThrowError(/not recognised/)
    })

    it('returns an array with saga operation', () => {
      expect(result.length).toEqual(2)
    })

    it('contains fetch saga fn', () => {
      expect(result[0]).toEqual(fetch)
    })

    it('contains createPostRequest action', () => {
      expect(result[1].type).toEqual(Request.Create)
      expect(result[1].contentType).toEqual(ContentTypes.Post)
      expect(result[1].identifier).toEqual(16)
    })
  })

  describe('connectWpQuery', () => {
    const queryFn = jest.fn()
    const preload = makeWpQueryPreloaderFn(queryId, queryFn)
    const result = preload({ id: 16 })

    it('returns a function', () => {
      expect(typeof preload).toEqual('function')
    })

    it('returns an array with saga operation', () => {
      expect(result.length).toEqual(2)
    })

    it('contains fetch saga fn', () => {
      expect(result[0]).toEqual(fetch)
    })

    it('contains Request.Create action', () => {
      expect(result[1].type).toEqual(Request.Create)
      expect(result[1].request).toEqual(RequestTypes.Query)
    })
  })
})
