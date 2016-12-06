/* global jest:false */

jest.disableAutomock()

import ActionTypes from '../../src/constants/ActionTypes'
import { ContentTypes } from '../../src/constants/ContentTypes'
import { fetch } from '../../src/redux/sagas'

import BuiltInContentType from '../__mocks__/components/BuiltInContentType'
import BadContentType from '../__mocks__/components/BadContentType'
import CustomQuery from '../__mocks__/components/CustomQuery'

describe('util/preload', () => {
  describe('connectWpPost', () => {
    const result = BuiltInContentType.makePreloader({ params: { id: 16 } })

    it('returns an array', () => {
      expect(Array.isArray(result)).toEqual(true)
    })

    it('throws with bad content type', () => {
      expect(() => {
        BadContentType.makePreloader()
      }).toThrowError(/not recognised/)
    })

    it('returns an array with saga operation', () => {
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
    const result = CustomQuery.makePreloader({ params: { id: 16 } })

    it('returns an array', () => {
      expect(Array.isArray(result)).toEqual(true)
    })

    it('returns an array with saga operation', () => {
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
