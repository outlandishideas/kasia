/* global jest:false */

jest.disableAutomock()

import { Request, RequestTypes } from '../../src/constants/ActionTypes'
import { fetch } from '../../src/redux/sagas'
import ContentTypes from '../../src/constants/ContentTypes'

import BuiltInContentType from '../mocks/components/BuiltInContentType'
import BadContentType from '../mocks/components/BadContentType'
import CustomQuery from '../mocks/components/CustomQuery'

describe('Preloaders', () => {
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

    it('contains createPostRequest action', () => {
      expect(result[1].type).toEqual(Request.Create)
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

    it('contains Request.Create action', () => {
      expect(result[1].type).toEqual(Request.Create)
      expect(result[1].request).toEqual(RequestTypes.Query)
    })
  })
})
