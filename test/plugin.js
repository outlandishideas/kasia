/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import Wpapi from 'wpapi'
import { combineReducers, createStore } from 'redux'
import { spawn } from 'redux-saga/effects'

import kasia from '../src'
import { ActionTypes } from '../src/constants'
import { acknowledgeRequest, completeRequest } from '../src/redux/actions'
import postJson from './__fixtures__/wp-api-responses/post'

jest.disableAutomock()

const testActionType = 'kasia/TEST_ACTION'

let countHitPluginOwnActionTypeReducer = 0
let countHitPluginNativeActionTypeReducer = 0

function pluginSaga () {}

function setup () {
  const plugin = () => ({
    sagas: [pluginSaga],
    reducers: {
      [testActionType]: (state) => {
        countHitPluginOwnActionTypeReducer++
        return state
      },
      [ActionTypes.RequestComplete]: (state) => {
        countHitPluginNativeActionTypeReducer++
        return state
      }
    }
  })

  const { kasiaReducer, kasiaSagas } = kasia({
    wpapi: new Wpapi({ endpoint: '' }),
    plugins: [plugin]
  })

  const rootReducer = combineReducers(kasiaReducer)
  const store = createStore(rootReducer)

  return { store, kasiaSagas }
}

describe('Plugin', () => {
  const { store, kasiaSagas } = setup()

  it('should run untouched native action type', () => {
    store.dispatch(acknowledgeRequest({ type: ActionTypes.RequestCreatePost, id: 0 }))
    expect(store.getState().wordpress.queries['0']).toBeTruthy()
  })

  describe('with native action type', () => {
    it('should hit native action handler', () => {
      store.dispatch(completeRequest(0, postJson))
      expect(store.getState().wordpress.queries['0']).toBeTruthy()
    })

    it('should hit third-party action handler for native action type', () => {
      expect(countHitPluginNativeActionTypeReducer).toEqual(1)
    })
  })

  describe('with new action type', () => {
    it('should hit third-party action handler for third-party action type', () => {
      store.dispatch({ type: testActionType })
      expect(countHitPluginOwnActionTypeReducer).toEqual(1)
    })

    it('should add the plugin saga to sagas array', () => {
      const actual = kasiaSagas.toString()
      const expected = spawn(pluginSaga).toString()
      expect(actual).toContain(expected)
    })
  })
})
