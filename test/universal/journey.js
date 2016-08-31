/* global jest:false, module:false */

jest.disableAutomock()

import { mount } from 'enzyme'
import React from 'react'
import createSagaMiddleware from 'redux-saga'
import * as effects from 'redux-saga/effects'

import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers
} from 'redux'

import { Request, RequestTypes } from '../../src/constants/ActionTypes'
import { fetch } from '../../src/sagas'
import { ContentTypes } from '../../src/contentTypes'
import { completeRequest as _completeRequest } from '../../src/actions'
import makeReducer from '../../src/reducer'
import BuiltInContentType from '../components/BuiltInContentType'

function setup () {
  const renderProps = { params: { id: 0 } }

  const sagaMiddleware = createSagaMiddleware()

  const _createStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const reducer = combineReducers(makeReducer(
    { keyEntitiesBy: 'id' },
    { reducers: {} }
  ))

  const store = _createStore(reducer, {})

  return { sagaMiddleware, store, renderProps }
}

function fixtures () {
  return {
    expectedAction: {
      contentType: ContentTypes.Post,
      identifier: 0,
      prepared: true,
      request: RequestTypes.Post,
      type: Request.Create
    },
    postJson1: {
      id: 0,
      title: 'Post Title 1',
      type: 'post'
    },
    postJson2: {
      id: 1,
      title: 'Post Title 2',
      type: 'post'
    }
  }
}

describe('Universal journey', function () {
  const { sagaMiddleware, store, renderProps } = setup()
  const { expectedAction, postJson1, postJson2 } = fixtures()

  let id = 0

  function completeRequest (id, data, prepared = false) {
    return sagaMiddleware.run(function * () {
      yield effects.put(_completeRequest({ id, data, prepared }))
    }).done
  }

  describe('Server', () => {
    let rendered
    let preloader

    it('should have a makePreloader static method', () => {
      expect(typeof BuiltInContentType.makePreloader).toEqual('function')
    })

    it('should make a preloader array', () => {
      preloader = BuiltInContentType.makePreloader(renderProps)
      expect(Array.isArray(preloader)).toEqual(true)
    })

    it('that contains a saga function and action object', () => {
      expect(preloader[0]).toEqual(fetch)
      expect(preloader[1]).toEqual(expectedAction)
    })

    it('that when run updates _preparedQueryIds on the store', (done) => {
      return completeRequest(id, postJson1, true).then(() => {
        expect(store.getState().wordpress._preparedQueryIds).toEqual([id])
        done()
      })
    })

    it('should pull the prepared query data from the store when mounted', () => {
      rendered = mount(<BuiltInContentType store={store} params={{ id: postJson1.id }} />)
      expect(rendered.html()).toEqual(`<div>${postJson1.title}</div>`)
    })

    it('should not shift the prepared query ID from the store', () => {
      expect(store.getState().wordpress._preparedQueryIds).toEqual([id])
    })
  })

  describe('Client', () => {
    let rendered

    it('should pull the prepared query data from the store when mounted', () => {
      rendered = mount(<BuiltInContentType store={store} params={{ id: postJson1.id }} __IS_NODE__={false} />)
      expect(rendered.html()).toEqual(`<div>${postJson1.title}</div>`)
    })

    it('should shift the prepared query ID from the store', () => {
      expect(store.getState().wordpress._preparedQueryIds).toEqual([])
    })

    it('should make a non-prepared query on props change', (done) => {
      completeRequest(++id, postJson2).then(() => {
        const state = store.getState().wordpress

        rendered.setProps({ params: { id: 1 } })

        expect(state._preparedQueryIds).toEqual([])
        expect(Object.keys(state.queries)).toContain(String(id))

        done()
      })
    })

    it('should update the component with result of non-prepared query', () => {
      expect(rendered.html()).toEqual(`<div>${postJson2.title}</div>`)
    })
  })
})
