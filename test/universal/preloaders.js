/* global jest:false */

jest.disableAutomock()

import { Request, RequestTypes } from '../../src/constants/ActionTypes'
import { ContentTypes } from '../../src/contentTypes'
import { fetch } from '../../src/sagas'

import BuiltInContentType from '../components/BuiltInContentType'
import BadContentType from '../components/BadContentType'
import CustomQuery from '../components/CustomQuery'

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
