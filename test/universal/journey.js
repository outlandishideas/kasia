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

  let rendered
  let preloader

  // Server

  it('should have a makePreloader static method', () => {
    expect(typeof BuiltInContentType.makePreloader).toEqual('function')
  })

  it('that returns a preloader operation array', () => {
    preloader = BuiltInContentType.makePreloader(renderProps)
    expect(Array.isArray(preloader)).toEqual(true)
  })

  it('that contains a saga function and action object', () => {
    expect(preloader[0]).toEqual(fetch)
    expect(preloader[1]).toEqual(expectedAction)
  })

  it('that when run updates number of prepared queries', (done) => {
    return completeRequest(id, postJson1, true).then(() => {
      expect(store.getState().wordpress._numPreparedQueries).toEqual(1)
      done()
    })
  })

  it('should not subtract from remaining number of prepared queries', () => {
    expect(store.getState().wordpress._numPreparedQueries).toEqual(1)
  })

  // Client

  it('should render the prepared query data', () => {
    rendered = mount(<BuiltInContentType store={store} params={{ id: postJson1.id }} __IS_NODE__={false} />)
    expect(rendered.html()).toEqual(`<div>${postJson1.title}</div>`)
  })

  it('should subtract from the remaining number of prepared queries', () => {
    expect(store.getState().wordpress._numPreparedQueries).toEqual(0)
  })

  it('should make a non-prepared query on props change', (done) => {
    completeRequest(++id, postJson2).then(() => {
      const state = store.getState().wordpress

      rendered.setProps({ params: { id: 1 } })

      expect(state._numPreparedQueries).toEqual(0)
      expect(Object.keys(state.queries)).toContain(String(id))

      done()
    })
  })

  it('should render result of the non-prepared query', () => {
    expect(rendered.html()).toEqual(`<div>${postJson2.title}</div>`)
  })
})
