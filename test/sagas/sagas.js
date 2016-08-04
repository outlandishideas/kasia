/* eslint-env jasmine */
/* global jest:false */

jest.unmock('lodash')
jest.unmock('normalizr')
jest.unmock('redux-saga')
jest.unmock('redux-saga/effects')

jest.unmock('../../src/constants/ActionTypes')
jest.unmock('../../src/contentTypes')
jest.unmock('../../src/actions')
jest.unmock('../../src/wpapi')
jest.unmock('../../src/index')
jest.unmock('../../src/sagas')

import * as effects from 'redux-saga/effects'

import { setWP } from '../../src/wpapi'
import { fetch } from '../../src/sagas'
import { ContentTypes } from '../../src/contentTypes'

import {
  completeRequest,
  createPostRequest,
  createQueryRequest
} from '../../src/actions'

function setup () {
  const queryId = 'mockId'
  const mockResult = 'mockResult'
  const WP = jest.fn()
  const queryFn = jest.fn()

  queryFn.mockReturnValue(mockResult)

  setWP(WP)

  return { WP, queryFn, queryId, mockResult }
}

describe('Sagas', () => {
  describe('on createPostRequest', () => {
    const { queryId } = setup()

    const opts = {
      contentType: ContentTypes.Post,
      identifier: 16
    }

    const action = createPostRequest(queryId, opts)
    const generator = fetch(action)

    generator.next()

    it('yields a put with completeRequest action', () => {
      expect(generator.next().value)
        .toEqual(effects.put(completeRequest(queryId, undefined)))
    })
  })

  describe('on createQueryRequest', () => {
    const { WP, queryFn, queryId, mockResult } = setup()
    const action = createQueryRequest(queryId, { queryFn })
    const generator = fetch(action)

    it('yields a call to correctly resolved queryFn', () => {
      expect(generator.next().value).toEqual(effects.call(queryFn, WP))
    })

    it('puts a completeRequest action with result', () => {
      expect(generator.next(mockResult).value)
        .toEqual(effects.put(completeRequest(queryId, mockResult)))
    })
  })
})
