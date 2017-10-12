/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import React from 'react'
import merge from 'lodash.merge'
import isNode from 'is-node-fn'
import { mount } from 'enzyme'

import { rewind } from '../../src/connect'
import { ActionTypes } from '../../src/constants'

import '../__mocks__/WP'
import stateMultipleEntities from '../__mocks__/states/multipleEntities'
import initialState from '../__mocks__/states/initial'
import BuiltInTypeComponent, { target } from '../__mocks__/components/BuiltInContentType'
import CustomTypeComponent from '../__mocks__/components/CustomContentType'
import BadContentTypeComponent from '../__mocks__/components/BadContentType'
import ExplicitIdentifierComponent from '../__mocks__/components/ExplicitIdentifier'

import postJson from '../__fixtures__/wp-api-responses/post'
import bookJson from '../__fixtures__/wp-api-responses/book'

jest.disableAutomock()

const BuiltInType = (props, store) => mount(<BuiltInTypeComponent {...props} />, { context: { store } })
const CustomType = (props, store) => mount(<CustomTypeComponent {...props} />, { context: { store } })
const BadContentType = (props, store) => mount(<BadContentTypeComponent {...props} />, { context: { store } })
const ExplicitIdentifier = (props, store) => mount(<ExplicitIdentifierComponent {...props} />, { context: { store } })

let state

function setup () {
  const dispatch = jest.fn()
  const subscribe = () => {}
  const getState = () => state
  return { dispatch, getState, subscribe }
}

jest.mock('is-node-fn')
isNode.mockReturnValue(false)

describe('connectWpPost', () => {
  describe('with built-in content type', () => {
    let store
    let rendered

    beforeAll(() => {
      rewind()
      const props = { params: { id: postJson.id } }
      state = initialState()
      store = setup()
      rendered = BuiltInType(props, store)
    })

    it('should wrap the component', () => {
      // Components are wrapped first by react-redux connect()
      expect(BuiltInTypeComponent.WrappedComponent).toBe(target)
      expect(BuiltInTypeComponent.__kasia__).toBe(true)
    })

    it('should render loading', () => {
      expect(rendered.html()).toEqual('<div>Loading...</div>')
    })

    it('should dispatch RequestCreatePost', () => {
      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreatePost)
      expect(action.contentType).toEqual('post')
      expect(action.identifier).toEqual(postJson.id)
    })

    it('should render post title', () => {
      const query = { complete: true, OK: true, entities: [postJson.id] }
      state = merge({}, stateMultipleEntities, { wordpress: { queries: { 0: query } } })
      rendered.update() // Fake store update from completed request
      expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
    })

    it('should update to new entity that exists in store straight away', () => {
      const nextProps = { params: { id: postJson.id + 1 } }
      rendered.setProps(nextProps)
      expect(rendered.html()).toEqual('<div>new title</div>')
    })

    it('should dispatch RequestCreatePost for entity that is not in store', () => {
      const nextProps = { params: { id: 100 } }
      rendered.setProps(nextProps)
      expect(rendered.html()).toEqual('<div>Loading...</div>')

      const action = store.dispatch.mock.calls[1][0]
      expect(action.type).toEqual(ActionTypes.RequestCreatePost)
      expect(action.contentType).toEqual('post')
      expect(action.identifier).toEqual(100)
    })
  })

  describe('with custom content type', () => {
    let store
    let rendered

    beforeAll(() => {
      rewind()
      const props = { params: { id: bookJson.id } }
      state = stateMultipleEntities
      store = setup()
      rendered = CustomType(props, store)
    })

    it('should dispatch RequestCreatePost', () => {
      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreatePost)
      expect(action.contentType).toEqual('book')
      expect(action.identifier).toEqual(bookJson.id)
    })

    it('should render book title', () => {
      const query = { complete: true, OK: true, entities: [bookJson.id] }
      state = merge({}, stateMultipleEntities, { wordpress: { queries: { 0: query } } })
      rendered.update() // Fake store update from completed request
      expect(rendered.html()).toEqual('<div>Hello</div>')
    })
  })

  // Test that a store keyed by numeric ID can still resolve an
  // entity that is fetched using explicit slug identifier
  describe('with explicit slug identifier', () => {
    let store
    let rendered

    beforeAll(() => {
      rewind()
      const props = { params: { id: postJson.id } }
      state = stateMultipleEntities
      store = setup()
      rendered = ExplicitIdentifier(props, store)
    })

    it('should dispatch RequestCreatePost', () => {
      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreatePost)
      expect(action.contentType).toEqual('post')
      expect(action.identifier).toEqual(postJson.slug)
    })

    it('should render post title', () => {
      const query = { complete: true, OK: true, entities: [postJson.id] }
      state = merge({}, stateMultipleEntities, { wordpress: { queries: { 0: query } } })
      rendered.update() // Fake store update from completed request
      expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
    })
  })

  describe('with bad content type', () => {
    it('should throw "content type is not recognised" error', () => {
      const store = setup(stateMultipleEntities)
      const props = { params: { id: postJson.id } }
      expect(() => BadContentType(props, store)).toThrowError(/is not recognised/)
    })
  })
})
