/* global jest:false, expect:false */

jest.disableAutomock()

import { join, fork } from 'redux-saga/effects'
import { createMockTask } from 'redux-saga/utils'

import '../__mocks__/WP'
import { ActionTypes } from '../../src/constants'
import { fetch } from '../../src/redux/sagas'
import { preload, preloadQuery } from '../../src/util/preload'
import { wrapQueryFn } from '../../src/connect'

import ConnectPostC from '../__mocks__/components/BuiltInContentType'
import ConnectQueryC, { queryFn } from '../__mocks__/components/CustomQuery'

describe('util/preload', () => {
  describe('#preload', () => {
    const props = { params: { id: 16 } }
    const components = [
      class extends ConnectPostC {}, // test can discover wrapped kasia component
      ConnectQueryC, // unwrapped kasia component
      false // test ignores non-component values
    ]

    let iter
    let res

    it('throws with bad components', () => {
      expect(() => preload({}, '')).toThrowError(/Expecting components to be array/)
    })

    it('throws with bad renderProps', () => {
      expect(() => preload([], '')).toThrowError(/Expecting renderProps to be an object/)
    })

    it('throws with bad state', () => {
      expect(() => preload([], {}, '')).toThrowError(/Expecting state to be an object/)
    })

    it('returns generator', () => {
      const actual = preload(components, props)

      iter = actual()
      res = iter.next()

      expect(typeof actual).toEqual('function')
    })

    it('that yields fork effect for each component', () => {
      const wrappedQueryFnStr = wrapQueryFn(queryFn, props).toString()

      expect(res.done).toEqual(false)

      expect(res.value[0].FORK).toBeTruthy()
      expect(res.value[0]).toEqual(fork(fetch, {
        type: ActionTypes.RequestCreatePost,
        id: 0,
        contentType: 'post',
        identifier: 16
      }))

      expect(res.value[1].FORK).toBeTruthy()
      expect(res.value[1].FORK).toBeTruthy()
      expect(res.value[1].FORK.args[0].id).toEqual(1)
      expect(res.value[1].FORK.args[0].type).toEqual(ActionTypes.RequestCreateQuery)
      expect(res.value[1].FORK.args[0].queryFn.toString()).toEqual(wrappedQueryFnStr)
    })

    it('that yields join effect', () => {
      const tasks = [createMockTask(), createMockTask()]
      expect(iter.next(tasks).value).toEqual(join(...tasks))
      expect(iter.next().done).toEqual(true)
    })
  })

  describe('#preloadQuery', () => {
    let iter

    it('throws with bad queryFn', () => {
      expect(() => preloadQuery('')).toThrowError(/Expecting queryFn to be a function/)
    })

    it('throws with bad renderProps', () => {
      expect(() => preloadQuery(() => {}, '')).toThrowError(/Expecting renderProps to be an object/)
    })

    it('throws with bad state', () => {
      expect(() => preloadQuery(() => {}, {}, '')).toThrowError(/Expecting state to be an object/)
    })

    it('returns generator', () => {
      expect(typeof preloadQuery(() => {})).toEqual('function')
    })

    it('yields data from given queryFn', () => {
      iter = preloadQuery(() => 'mockResult')()
      expect(iter.next().value).toEqual('mockResult')
    })

    it('that yields put completeRequest effect', () => {
      const actual = iter.next('mockResult').value
      expect(actual.PUT.action.id).toEqual(null)
      expect(actual.PUT.action.type).toEqual(ActionTypes.RequestComplete)
      expect(actual.PUT.action.data).toEqual('mockResult')
    })
  })
})
