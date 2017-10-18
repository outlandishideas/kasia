/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import React from 'react'
import createSagaMiddleware from 'redux-saga'
import isNode from 'is-node-fn'
import Wpapi from 'wpapi'
import { select, put } from 'redux-saga/effects'
import { mount } from 'enzyme'
import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers
} from 'redux'

import kasia from '../../src'
import schemasManager from '../../src/util/schemas-manager'
import { _rewindNextClientQueryId } from '../../src/connect/base'
import { ActionTypes } from '../../src/constants'
import { fetch, _getCurrentQueryId } from '../../src/redux/sagas'
import { buildQueryFunction } from '../../src/util/query-builder'

import '../__mocks__/WP'
import BuiltInContentType from '../__mocks__/components/BuiltInContentType'
import initialState from '../__mocks__/states/initial'
import post from '../__fixtures__/wp-api-responses/post'

jest.disableAutomock()

// we mock queryBuilder after imports
// we need to mock client and server environments
jest.mock('is-node-fn')

const post1 = post
const post2 = Object.assign({}, post, { id: 17, slug: 'post-2', title: { rendered: 'Post 2' } })
const post3 = Object.assign({}, post, { id: 18, slug: 'post-3', title: { rendered: 'Post 3' } })

// we need to mock responses from WP-API
jest.mock('../../src/util/query-builder', () => ({
  buildQueryFunction: jest.fn()
}))

let returnPost

buildQueryFunction.mockImplementation(() => () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(returnPost))
  })
)

function setup (keyEntitiesBy) {
  const { kasiaReducer, kasiaSagas } = kasia({
    wpapi: new Wpapi({ endpoint: '123' }),
    keyEntitiesBy
  })

  const sagaMiddleware = createSagaMiddleware()
  const newStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)
  const store = newStore(
    combineReducers(kasiaReducer),
    initialState(keyEntitiesBy)
  )
  const runSaga = sagaMiddleware.run

  sagaMiddleware.run(function * () {
    yield kasiaSagas
  })

  return { store, runSaga }
}

describe('Universal journey', function () {
  ['id'].forEach((keyEntitiesBy) => {
    describe('keyEntitiesBy = ' + keyEntitiesBy, () => {
      let rendered, preloader, action, iter, store, runSaga

      function newStore () {
        _rewindNextClientQueryId()
        const s = setup(keyEntitiesBy)
        store = s.store
        runSaga = s.runSaga
      }

      it('SERVER', () => {
        schemasManager.__flush__()
        newStore() // we would create new store for each request
        isNode.mockReturnValue(true)
        returnPost = post1
      })

      it('  should have a preload static method', () => {
        expect(typeof BuiltInContentType.preload).toEqual('function')
      })

      it('  ...that returns a preloader operation array', () => {
        const renderProps = { [keyEntitiesBy]: post1[keyEntitiesBy] }
        preloader = BuiltInContentType.preload(renderProps)
        expect(Array.isArray(preloader)).toEqual(true)
      })

      it('  ...that contains a saga function and action object', () => {
        action = {
          type: ActionTypes.RequestCreatePost,
          request: {
            identifier: post1[keyEntitiesBy],
            contentType: 'post'
          }
        }
        expect(preloader[0]).toEqual(fetch)
        expect(preloader[1]).toEqual(action)
        iter = fetch(action)
      })

      it('  should run preloader', () => {
        // acknowledge request
        const ackAction = {
          type: ActionTypes.RequestAck,
          request: {
            identifier: post1[keyEntitiesBy],
            contentType: 'post'
          }
        }

        const actual1 = iter.next().value
        const expected1 = select(_getCurrentQueryId)
        expect(actual1).toEqual(expected1)

        const actual2 = iter.next().value
        const expected2 = put(ackAction)
        expect(actual2).toEqual(expected2)

        return runSaga(fetch, action).done
      })

      it(`  should have entity keyed by ${keyEntitiesBy} on store`, () => {
        const { entities } = store.getState().wordpress
        const actual = entities.posts[post1[keyEntitiesBy]]
        expect(actual).toEqual(post1)
      })

      it('  should render the prepared data on server', () => {
        kasia.rewind(store)
        const props = { [keyEntitiesBy]: post1[keyEntitiesBy] }
        rendered = mount(<BuiltInContentType {...props} />, { context: { store } })
        expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
      })

      it('CLIENT', () => {
        _rewindNextClientQueryId()
        kasia.rewind(store)
        isNode.mockReturnValue(false)
        returnPost = post2
      })

      it('  should render the prepared query data on client', () => {
        const props = { [keyEntitiesBy]: post1[keyEntitiesBy] }
        rendered = mount(<BuiltInContentType {...props} />, { context: { store } })
        expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
      })

      it('  should render loading text when props change', () => {
        const props = { [keyEntitiesBy]: post2[keyEntitiesBy] }
        rendered.setProps(props) // implicit update
        expect(rendered.html()).toEqual('<div>Loading...</div>')
      })

      it('  should make a non-prepared query on props change', () => {
        const query = store.getState().wordpress.queries[1]
        expect(typeof query).toEqual('object')
        expect(query.prepared).toEqual(false)
        expect(query.complete).toEqual(false)
      })

      it('  should display new post title', (done) => {
        // allow fetch saga to complete
        // todo surely a better way to do this?
        setTimeout(() => {
          try {
            const query = store.getState().wordpress.queries[1]
            expect(query.complete).toEqual(true)
            expect(rendered.update().html()).toEqual('<div>Post 2</div>')
            done()
          } catch (err) {
            done(err)
          }
        }, 100)
      })

      it('  can make another non-prepared query', (done) => {
        returnPost = post3

        // change props
        const props = { [keyEntitiesBy]: post3[keyEntitiesBy] }
        rendered.setProps(props)
        expect(rendered.html()).toEqual('<div>Loading...</div>')

        // check query is acknowledged
        const query = store.getState().wordpress.queries[2]
        expect(typeof query).toEqual('object')
        expect(query.prepared).toEqual(false)
        expect(query.complete).toEqual(false)

        // check renders new data
        setTimeout(() => {
          try {
            const query = store.getState().wordpress.queries[2]
            expect(query.complete).toEqual(true)
            expect(rendered.update().html()).toEqual('<div>Post 3</div>')
            done()
          } catch (err) {
            done(err)
          }
        }, 100)
      })
    })
  })
})
