/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import { put, call, select } from 'redux-saga/effects'

import '../__mocks__/WP'
import getWP from '../../src/wpapi'
import { fetch, _getCurrentQueryId } from '../../src/redux/sagas'
import { buildQueryFunction } from '../../src/util/query-builder'
import { createPostRequest, createQueryRequest } from '../../src/redux/actions'
import { ActionTypes, ContentTypes } from '../../src/constants'

jest.disableAutomock()

describe('redux/sagas', () => {
  const QUERY_ID_SELECTOR_RESULT = 0
  const REQUEST_RESULT = 'mockResult'

  describe('createPostRequest', () => {
    const action = createPostRequest({
      contentType: ContentTypes.Post,
      identifier: 16
    })
    const generator = fetch(action)

    it('yields a select _getCurrentQueryId', () => {
      const actual = generator.next().value
      const expected = select(_getCurrentQueryId)
      expect(actual).toEqual(expected)
    })

    it('yields a put acknowledgeRequest', () => {
      const actual = generator.next(QUERY_ID_SELECTOR_RESULT).value
      const expected = put({
        ...action,
        type: ActionTypes.RequestAck
      })
      expect(actual).toEqual(expected)
    })

    it('yields a call to buildQueryFunction', () => {
      const actual = generator.next().value
      const expected = call(buildQueryFunction(action.request), getWP())
      actual.CALL.fn = actual.CALL.fn.toString()
      expected.CALL.fn = expected.CALL.fn.toString()
      expect(actual).toEqual(expected)
    })

    it('yields a put completeRequest', () => {
      const actual = generator.next(REQUEST_RESULT).value
      const expected = put({
        type: ActionTypes.RequestComplete,
        request: {
          id: 0,
          fromCache: false,
          result: REQUEST_RESULT
        }
      })
      expect(actual).toEqual(expected)
    })
  })

  describe('createQueryRequest', () => {
    const queryFn = () => {}
    const action = createQueryRequest({ queryFn })
    const generator = fetch(action)

    it('yields a select _getCurrentQueryId', () => {
      const actual = generator.next().value
      const expected = select(_getCurrentQueryId)
      expect(actual).toEqual(expected)
    })

    it('yields a put acknowledgeRequest', () => {
      const actual = generator.next(QUERY_ID_SELECTOR_RESULT).value
      const expected = put({
        ...action,
        type: ActionTypes.RequestAck
      })
      expect(actual).toEqual(expected)
    })

    it('yields a call queryFn', () => {
      const actual = generator.next().value
      const expected = call(action.request.queryFn, getWP())
      expect(actual).toEqual(expected)
    })

    it('puts a put completeRequest with result', () => {
      const actual = generator.next(REQUEST_RESULT).value
      const expected = put({
        type: ActionTypes.RequestComplete,
        request: {
          id: 0,
          fromCache: false,
          result: REQUEST_RESULT
        }
      })
      expect(actual).toEqual(expected)
    })
  })
})
