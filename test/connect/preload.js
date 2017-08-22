/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import queryCounter from '../../src/util/query-counter'
import { ActionTypes, ContentTypes } from '../../src/constants'
import { fetch } from '../../src/redux/sagas'

import BuiltInContentType from '../__mocks__/components/BuiltInContentType'
import BadContentType from '../__mocks__/components/BadContentType'
import CustomQuery from '../__mocks__/components/CustomQuery'

jest.disableAutomock()

describe('connect/preload', () => {
  const props = { params: { id: 16 } }

  beforeAll(() => queryCounter.reset())

  describe('connectWpPost', () => {
    const preloader = BuiltInContentType.preload

    let result

    it('has static preload method', () => {
      expect(typeof preloader).toEqual('function')
    })

    it('throws with bad content type', () => {
      expect(() => BadContentType.preload()).toThrowError(/not recognised/)
    })

    it('preloader returns an array', () => {
      result = preloader(props)
      expect(Array.isArray(result)).toEqual(true)
    })

    it('returns an array of length two', () => {
      expect(result.length).toEqual(2)
    })

    it('contains fetch saga fn', () => {
      expect(result[0]).toEqual(fetch)
    })

    it('contains RequestCreatePost action', () => {
      expect(result[1].type).toEqual(ActionTypes.RequestCreatePost)
      expect(result[1].contentType).toEqual(ContentTypes.Post)
      expect(result[1].identifier).toEqual(16)
    })
  })

  describe('connectWpQuery', () => {
    const preloader = CustomQuery.preload

    let result

    it('has static preload method', () => {
      expect(typeof preloader).toEqual('function')
    })

    it('preloader returns an array', () => {
      result = preloader(props)
      expect(Array.isArray(result)).toEqual(true)
    })

    it('returns an array of length two', () => {
      expect(result.length).toEqual(2)
    })

    it('contains fetch saga fn', () => {
      expect(result[0]).toEqual(fetch)
    })

    it('contains RequestCreateQuery action', () => {
      expect(result[1].type).toEqual(ActionTypes.RequestCreateQuery)
    })
  })
})
