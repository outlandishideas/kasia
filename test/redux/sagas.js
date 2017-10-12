/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import { put, call, select } from 'redux-saga/effects'

import '../__mocks__/WP'
import getWP from '../../src/wpapi'
import { _getLastQueryId } from '../../src/redux/sagas';
import { buildQueryFunction } from '../../src/util/query-builder'
import { createPostRequest, createQueryRequest } from '../../src/redux/actions'
import { fetch } from '../../src/redux/sagas'
import { ActionTypes, ContentTypes } from '../../src/constants'

jest.disableAutomock()

describe('redux/sagas', () => {
  describe('createPostRequest', () => {
    const action = createPostRequest(ContentTypes.Post, 16)
    const generator = fetch(action)

    it('yields a put with acknowledgeRequest action', () => {
      const actual = generator.next().value
      const expected = put({ ...action, type: ActionTypes.RequestAck })
      expect(actual).toEqual(expected)
    })

    it('yields a select for last query id', () => {
      const actual = generator.next().value
      const expected = select(_getLastQueryId)
      expect(actual.SELECT.selector).toEqual(expected.SELECT.selector)
    })

    it('yields a call to result of buildQueryFunction', () => {
      const actual = generator.next().value
      const expected = call(buildQueryFunction(action), getWP())
      actual.CALL.fn = actual.CALL.fn.toString()
      expected.CALL.fn = expected.CALL.fn.toString()
      expect(actual).toEqual(expected)
    })

    it('yields a put with completeRequest action', () => {
      const actual = generator.next('mockResult').value
      const expected = put({ type: ActionTypes.RequestComplete, data: 'mockResult' })
      expect(actual).toEqual(expected)
    })
  })

  describe('createQueryRequest', () => {
    const queryFn = () => {}
    const action = createQueryRequest(queryFn)
    const generator = fetch(action)

    it('yields a put with acknowledgeRequest action', () => {
      const actual = generator.next().value
      const expected = put({ ...action, type: ActionTypes.RequestAck })
      expect(actual).toEqual(expected)
    })

    it('yields a select for last query id', () => {
      const actual = generator.next().value
      const expected = select(_getLastQueryId)
      expect(actual.SELECT.selector).toEqual(expected.SELECT.selector)
    })

    it('yields a call to queryFn', () => {
      const actual = generator.next().value
      const expected = call(action.queryFn, getWP())
      expect(actual).toEqual(expected)
    })

    it('puts a completeRequest action with result', () => {
      const actual = generator.next('mockResult').value
      const expected = put({ type: ActionTypes.RequestComplete, data: 'mockResult' })
      expect(actual).toEqual(expected)
    })
  })
})
