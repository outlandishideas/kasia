/* global jest:false */

jest.disableAutomock()

import { put, call } from 'redux-saga/effects'

import '../mocks/WP'
import getWP from '../../src/wpapi'
import { fetch } from '../../src/redux/sagas'
import { completeRequest, createPostRequest, createQueryRequest } from '../../src/redux/actions'
import { ContentTypes } from '../../src/constants/ContentTypes'

function setup () {
  const mockResult = 'mockResult'
  const WP = getWP()
  const queryFn = jest.fn(() => mockResult)
  return { WP, queryFn, mockResult }
}

describe('Sagas', () => {
  const { WP, queryFn, mockResult } = setup()

  describe('on createPostRequest', () => {
    const queryId = 0

    const opts = {
      contentType: ContentTypes.Post,
      identifier: 16
    }

    const action = createPostRequest(opts)
    const generator = fetch(action)

    // Skip select
    generator.next()

    // Skip call
    generator.next(queryId)

    it('yields a put with completeRequest action', () => {
      const actual = generator.next(mockResult).value
      const expected = put(completeRequest({ id: queryId, data: mockResult }))
      expect(actual).toEqual(expected)
    })
  })

  describe('on createQueryRequest', () => {
    const queryId = 1
    const action = createQueryRequest({ id: queryId, queryFn })
    const generator = fetch(action)

    // Skip select
    generator.next()

    it('yields a call to correctly resolved queryFn', () => {
      const actual = generator.next(queryId).value
      const expected = call(queryFn, WP)
      expect(actual).toEqual(expected)
    })

    it('puts a completeRequest action with result', () => {
      const actual = generator.next(mockResult).value
      const expected = put(completeRequest({ id: queryId, data: mockResult }))
      expect(actual).toEqual(expected)
    })
  })
})
