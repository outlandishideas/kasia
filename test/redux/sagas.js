/* global jest:false */

jest.disableAutomock()

import { put, call } from 'redux-saga/effects'

import '../__mocks__/WP'
import { queryBuilder } from '../../src/util'
import { fetch } from '../../src/redux/sagas'
import { completeRequest, createPostRequest, createQueryRequest } from '../../src/redux/actions'
import { ContentTypes } from '../../src/constants/ContentTypes'

function setup () {
  const mockResult = 'mockResult'
  const queryFn = jest.fn(() => mockResult)
  return { queryFn, mockResult }
}

describe('redux/sagas', () => {
  const { queryFn, mockResult } = setup()

  describe('createPostRequest', () => {
    const opts = {
      contentType: ContentTypes.Post,
      identifier: 16
    }

    const action = createPostRequest(opts)
    const generator = fetch(action)

    it('yields a call to result of queryBuilder.makeQuery', () => {
      const actual = generator.next().value
      const expected = call(queryBuilder.makeQuery(action))
      actual.CALL.fn = actual.CALL.fn.toString()
      expected.CALL.fn = expected.CALL.fn.toString()
      expect(actual).toEqual(expected)
    })

    it('yields a put with completeRequest action', () => {
      const actual = generator.next(mockResult).value
      const expected = put(completeRequest(mockResult))
      expect(actual).toEqual(expected)
    })
  })

  describe('createQueryRequest', () => {
    const opts = { queryFn }

    const action = createQueryRequest(opts)
    const generator = fetch(action)

    it('yields a call to queryFn', () => {
      const actual = generator.next().value
      const expected = call(queryFn)
      expect(actual).toEqual(expected)
    })

    it('puts a completeRequest action with result', () => {
      const actual = generator.next(mockResult).value
      const expected = put(completeRequest(mockResult))
      expect(actual).toEqual(expected)
    })
  })
})
