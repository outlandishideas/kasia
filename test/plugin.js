/* global jest:false */

jest.disableAutomock()

import WP from 'wpapi'
import { combineReducers, createStore } from 'redux'
import { spawn } from 'redux-saga/effects'

import Kasia from '../src/Kasia'
import ActionTypes from '../src/constants/ActionTypes'

const testActionType = 'kasia/TEST_ACTION'

let didHitPluginOwnActionTypeReducer = 0
let didHitPluginNativeActionTypeReducer = 0

function pluginSaga () {}

function setup () {
  const pluginReducer = {
    [testActionType]: (state) => {
      didHitPluginOwnActionTypeReducer++
      return state
    },
    [ActionTypes.RequestComplete]: (state) => {
      didHitPluginNativeActionTypeReducer++
      return state
    }
  }

  const plugin = () => ({
    reducers: pluginReducer,
    sagas: [pluginSaga]
  })

  const { kasiaReducer, kasiaSagas } = Kasia({
    WP: new WP({ endpoint: 'wow-so-much-endpoint' }),
    plugins: [plugin]
  })

  const rootReducer = combineReducers(kasiaReducer)
  const store = createStore(rootReducer)

  return { store, kasiaSagas }
}

describe('Plugin', () => {
  const { store, kasiaSagas } = setup()

  describe('native action type', () => {
    it('should hit native action handler', () => {
      store.dispatch({ type: ActionTypes.RequestComplete })
      expect(didHitPluginOwnActionTypeReducer).toEqual(1)
    })

    it('should hit plugin action handler', () => {
      expect(didHitPluginNativeActionTypeReducer).toEqual(1)
    })
  })

  describe('new action type', () => {
    it('should hit plugin action handler', () => {
      store.dispatch({ type: testActionType })
      expect(didHitPluginOwnActionTypeReducer).toEqual(2)
    })

    it('should add the plugin saga to sagas array', () => {
      const actual = kasiaSagas.toString()
      const expected = spawn(pluginSaga).toString()
      expect(actual).toContain(expected)
    })
  })
})
