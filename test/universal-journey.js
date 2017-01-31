/* global jest:false, expect:false */

jest.disableAutomock()

// we mock queryBuilder after imports
// we need to mock client and server environments
jest.mock('is-node-fn')

import React from 'react'
import createSagaMiddleware from 'redux-saga'
import isNode from 'is-node-fn'
import Wpapi from 'wpapi'
import { put } from 'redux-saga/effects'
import { createStore as _createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { mount } from 'enzyme'

import './__mocks__/WP'
import kasia from '../src'
import queryCounter from '../src/util/queryCounter'
import schemasManager from '../src/util/schemasManager'
import { ActionTypes } from '../src/constants'
import { fetch } from '../src/redux/sagas'

import BuiltInContentType from './__mocks__/components/BuiltInContentType'
import initialState from './__mocks__/states/initial'
import post from './__fixtures__/wp-api-responses/post'

const post1 = post
const post2 = Object.assign({}, post, { id: 17, slug: 'post-2', title: { rendered: 'Post 2' } })
const post3 = Object.assign({}, post, { id: 18, slug: 'post-3', title: { rendered: 'Post 3' } })

// post to return from queryFn
let returnPost

// we need to mock responses from WP-API
jest.mock('../src/util/queryBuilder', () => ({
  buildQueryFunction: () => () => new Promise((resolve) => {
    setTimeout(() => resolve(returnPost))
  })
}))

function setup (keyEntitiesBy) {
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

  return { store, runSaga }
}

describe('Universal journey', function () {
  ['id', 'slug'].forEach((keyEntitiesBy) => {
    describe('keyEntitiesBy = ' + keyEntitiesBy, () => {
      let rendered
      let preloader
      let action
      let iter
      let store
      let runSaga

      function newStore () {
        const s = setup(keyEntitiesBy)
        store = s.store
        runSaga = s.runSaga
      }

      it('SERVER', () => {
        schemasManager.__flush__()
        newStore() // we would create new store for each request
        queryCounter.reset()
        isNode.mockReturnValue(true)
        returnPost = post1
      })

      it('  should have a preload static method', () => {
        expect(typeof BuiltInContentType.preload).toEqual('function')
      })

      it('  ...that returns a preloader operation array', () => {
        const renderProps = { params: { [keyEntitiesBy]: post1[keyEntitiesBy] } }
        preloader = BuiltInContentType.preload(renderProps)
        expect(Array.isArray(preloader)).toEqual(true)
      })

      it('  ...that contains a saga function and action object', () => {
        action = {
          id: 0,
          type: ActionTypes.RequestCreatePost,
          identifier: post1[keyEntitiesBy],
          contentType: 'post'
        }
        expect(preloader[0]).toEqual(fetch)
        expect(preloader[1]).toEqual(action)
        iter = fetch(action)
      })

      it('  should run preloader', () => {
        // acknowledge request
        const ackAction = {
          id: 0,
          type: ActionTypes.AckRequest,
          identifier: post1[keyEntitiesBy],
          contentType: 'post'
        }
        const actual1 = iter.next().value
        const expected1 = put(ackAction)
        expect(actual1).toEqual(expected1)
        return runSaga(fetch, action).done
      })

      it(`  should have entity keyed by ${keyEntitiesBy} on store`, () => {
        const actual = store.getState().wordpress.entities.posts[post1[keyEntitiesBy]]
        expect(actual).toEqual(post1)
      })

      it('  should render the prepared data on server', () => {
        kasia.rewind()
        const params = { [keyEntitiesBy]: post1[keyEntitiesBy] }
        rendered = mount(<BuiltInContentType params={params} />, { context: { store } })
        expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
      })

      it('CLIENT', () => {
        // imitate client
        queryCounter.reset()
        isNode.mockReturnValue(false)
        returnPost = post2
      })

      it('  should render the prepared query data on client', () => {
        const params = { [keyEntitiesBy]: post1[keyEntitiesBy] }
        rendered = mount(<BuiltInContentType params={params} />, { context: { store } })
        expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
      })

      it('  should render loading text when props change', () => {
        const props = { params: { [keyEntitiesBy]: post2[keyEntitiesBy] } }
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
        const props = { params: { [keyEntitiesBy]: post3[keyEntitiesBy] } }
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
