/* global jest:false, expect:false */

import kasia from '../../src'

jest.disableAutomock()

import Wpapi from 'wpapi'
import createSagaMiddleware from 'redux-saga'
import { join, fork } from 'redux-saga/effects'
import { createMockTask } from 'redux-saga/utils'
import { createStore as _createStore, applyMiddleware, compose, combineReducers } from 'redux'

import '../__mocks__/WP'
import { ActionTypes } from '../../src/constants'
import { fetch } from '../../src/redux/sagas'
import { preload, preloadQuery } from '../../src/util/preload'
import { wrapQueryFn } from '../../src/connect'
import queryCounter from '../../src/util/queryCounter'
import runSagas from '../../src/util/runSagas'

import initialState from '../__mocks__/states/initial'
import bookJson from '../__fixtures__/wp-api-responses/book'
import ConnectPostC from '../__mocks__/components/BuiltInContentType'
import ConnectQueryC, { queryFn } from '../__mocks__/components/CustomQuery'
import ConnectQueryNestedC from '../__mocks__/components/CustomQueryNestedPreload'

function setup (keyEntitiesBy) {
  queryCounter.reset()

  const { kasiaReducer, kasiaSagas } = kasia({
    wpapi: new Wpapi({ endpoint: '123' }),
    keyEntitiesBy
  })

  const sagaMiddleware = createSagaMiddleware()
  const createStore = compose(applyMiddleware(sagaMiddleware))(_createStore)
  const store = createStore(combineReducers(kasiaReducer), initialState(keyEntitiesBy))
  const runSaga = sagaMiddleware.run

  sagaMiddleware.run(function * () {
    yield kasiaSagas
  })

  store.runSaga = runSaga

  return { store, runSaga }
}

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

    it('updates store', async () => {
      const { store } = setup()
      await runSagas(store, [
        () => preload([ConnectQueryC], {
          params: {
            id: bookJson.id
          }
        })
      ])
      expect(store.getState().wordpress.queries).toEqual({
        0: {
          OK: true,
          complete: true,
          entities: [bookJson.id],
          id: 0,
          paging: {},
          prepared: true
        }
      })
    })

    it('callable within another component query function', async () => {
      const { store } = setup()
      await runSagas(store, [
        () => preload([ConnectQueryNestedC], {
          params: {
            id: bookJson.id
          }
        })
      ])
      expect(store.getState().wordpress.queries).toEqual({
        0: {
          OK: true,
          complete: true,
          entities: [bookJson.id],
          id: 0,
          paging: {},
          prepared: true
        },
        1: {
          OK: true,
          complete: true,
          entities: [bookJson.id + 1],
          id: 1,
          paging: {},
          prepared: true
        },
      })
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
