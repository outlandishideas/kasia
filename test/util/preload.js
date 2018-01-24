/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import { join, fork } from 'redux-saga/effects'
import { createMockTask } from 'redux-saga/utils'

import '../__mocks__/WP'
import { ActionTypes, PreloadQueryId } from '../../src/constants'
import { fetch } from '../../src/redux/sagas'
import { preloadComponents, preloadQuery } from '../../src/util/preload'
import { _wrapQueryFn } from '../../src/connect/connectWpQuery'

import ConnectPostC from '../__mocks__/components/BuiltInContentType'
import ConnectQueryC, { queryFn } from '../__mocks__/components/CustomQuery'

jest.disableAutomock()

describe('util/preload', () => {
  describe('#preload', () => {
    const props = { id: 16 }
    const components = [
      class extends ConnectPostC {}, // test can discover wrapped kasia component
      ConnectQueryC, // unwrapped kasia component
      false // test ignores non-component values
    ]

    let iter
    let res

    it('throws with bad components', () => {
      expect(() => preloadComponents({}, '')).toThrowError(/Expecting components to be array/)
    })

    it('throws with bad renderProps', () => {
      expect(() => preloadComponents([], '')).toThrowError(/Expecting renderProps to be an object/)
    })

    it('throws with bad state', () => {
      expect(() => preloadComponents([], {}, '')).toThrowError(/Expecting state to be an object/)
    })

    it('returns generator', () => {
      const actual = preloadComponents(components, props)()

      iter = actual()
      res = iter.next()

      expect(typeof actual).toEqual('function')
    })

    it('that yields fork effect for each component', () => {
      const wrappedQueryFnStr = _wrapQueryFn(queryFn, props).toString()

      expect(res.done).toEqual(false)

      expect(res.value[0].FORK).toBeTruthy()
      expect(res.value[0]).toEqual(fork(fetch, {
        type: ActionTypes.RequestCreatePost,
        request: {
          cacheStrategy: false,
          contentType: 'post',
          identifier: 16
        }
      }))

      expect(res.value[1].FORK).toBeTruthy()
      expect(res.value[1].FORK).toBeTruthy()
      expect(res.value[1].FORK.args[0].type).toEqual(ActionTypes.RequestCreateQuery)
      expect(res.value[1].FORK.args[0].request.queryFn.toString()).toEqual(wrappedQueryFnStr)
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
      const actual = preloadQuery(() => 'mockResult')()
      iter = actual()
      expect(iter.next().value).toEqual('mockResult')
    })

    it('that yields put completeRequest effect', () => {
      const actual = iter.next('mockResult').value
      expect(actual.PUT.action.type).toEqual(ActionTypes.RequestComplete)
      expect(actual.PUT.action.request.id).toEqual(PreloadQueryId)
      expect(actual.PUT.action.request.result).toEqual('mockResult')
    })
  })
})
