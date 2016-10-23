/* global jest:false, module:false */

jest.disableAutomock()

import React from 'react'
import createSagaMiddleware from 'redux-saga'
import * as effects from 'redux-saga/effects'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { mount } from 'enzyme'

import { ContentTypes } from '../../src/constants/ContentTypes'
import { fetch } from '../../src/redux/sagas'
import { completeRequest as _completeRequest } from '../../src/redux/actions'
import ActionTypes from '../../src/constants/ActionTypes'
import makeReducer from '../../src/redux/reducer'
import BuiltInContentType from '../mocks/components/BuiltInContentType'

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
      target: 'BuiltInContentType',
      type: ActionTypes.RequestCreatePost
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

  function completeRequest (id, data, target = null) {
    return sagaMiddleware.run(function * () {
      yield effects.put(_completeRequest({ id, data, target }))
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
    return completeRequest(id, postJson1, 'BuiltInContentType').then(() => {
      expect(store.getState().wordpress.__kasia__.numPreparedQueries).toEqual(1)
      done()
    })
  })

  it('should render the prepared query data on server', () => {
    rendered = mount(<BuiltInContentType params={{ id: postJson1.id }} />, { context: { store } })
    expect(rendered.html()).toEqual(`<div>${postJson1.title}</div>`)
  })

  it('should not subtract from remaining number of prepared queries', () => {
    expect(store.getState().wordpress.__kasia__.numPreparedQueries).toEqual(1)
  })

  // Client

  it('should render the prepared query data on client', () => {
    rendered = mount(
      <BuiltInContentType params={{ id: postJson1.id }} __QUERY_ID__={0} __IS_NODE__={false} />,
      { context: { store } }
    )
    expect(rendered.html()).toEqual(`<div>${postJson1.title}</div>`)
  })

  it('should subtract from the remaining number of prepared queries', () => {
    expect(store.getState().wordpress.__kasia__.numPreparedQueries).toEqual(0)
  })

  it('should make a non-prepared query on props change', (done) => {
    completeRequest(++id, postJson2).then(() => {
      const state = store.getState().wordpress

      rendered.setProps({ params: { id: 1 } })

      expect(state.__kasia__.numPreparedQueries).toEqual(0)
      expect(Object.keys(state.queries)).toContain(String(id))

      done()
    })
  })

  it('should render result of the non-prepared query', () => {
    expect(rendered.html()).toEqual(`<div>${postJson2.title}</div>`)
  })
})
