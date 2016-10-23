/* global jest:false */

jest.disableAutomock()

import * as effects from 'redux-saga/effects'

import { setWP } from '../../src/wpapi'
import { fetch } from '../../src/redux/sagas'
import ContentTypes from '../../src/constants/ContentTypes'
import { completeRequest, createPostRequest, createQueryRequest } from '../../src/redux/actions'

function setup () {
  const mockResult = 'mockResult'
  const WP = jest.fn()
  const queryFn = jest.fn()

  queryFn.mockReturnValue(mockResult)

  setWP(WP)

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
      expect(generator.next(mockResult).value)
        .toEqual(effects.put(completeRequest({ id: queryId, data: mockResult })))
    })
  })

  describe('on createQueryRequest', () => {
    const queryId = 1
    const action = createQueryRequest({ id: queryId, queryFn })
    const generator = fetch(action)

    // Skip select
    generator.next()

    it('yields a call to correctly resolved queryFn', () => {
      expect(generator.next(queryId).value).toEqual(effects.call(queryFn, WP))
    })

    it('puts a completeRequest action with result', () => {
      expect(generator.next(mockResult).value)
        .toEqual(effects.put(completeRequest({ id: queryId, data: mockResult })))
    })
  })
})
