/* global jest:false, expect:false */

jest.disableAutomock()

import React from 'react'
import merge from 'lodash.merge'
import { mount } from 'enzyme'

import queryCounter from '../../src/util/queryCounter'
import { ActionTypes } from '../../src/constants'

import '../__mocks__/WP'
import stateMultipleEntities from '../__mocks__/states/multipleEntities'
import BuiltInTypeComponent, { target } from '../__mocks__/components/BuiltInContentType'
import CustomTypeComponent from '../__mocks__/components/CustomContentType'
import BadContentTypeComponent from '../__mocks__/components/BadContentType'

import postJson from '../__fixtures__/wp-api-responses/post'
import bookJson from '../__fixtures__/wp-api-responses/book'

const BuiltInType = (props, store) => mount(<BuiltInTypeComponent {...props} />, { context: { store } })
const CustomType = (props, store) => mount(<CustomTypeComponent {...props} />, { context: { store } })
const BadContentType = (props, store) => mount(<BadContentTypeComponent {...props} />, { context: { store } })

function setup (state) {
  const dispatch = jest.fn()
  const subscribe = () => {}
  const getState = () => state
  return { dispatch, getState, subscribe }
}

describe('connectWpPost', () => {
  beforeAll(() => queryCounter.reset())

  describe('with built-in content type', () => {
    let store
    let props
    let rendered

    beforeAll(() => {
      store = setup(stateMultipleEntities)
      props = { params: { id: postJson.id } }
      rendered = BuiltInType(props, store)
    })

    it('should wrap the component', () => {
      expect(BuiltInTypeComponent.__kasia__).toBe(true)
      expect(BuiltInTypeComponent.WrappedComponent).toBe(target)
    })

    it('should render loading', () => {
      expect(rendered.html()).toEqual('<div>Loading...</div>')
    })

    it('should dispatch RequestCreatePost', () => {
      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreatePost)
      expect(action.contentType).toEqual('post')
      expect(action.identifier).toEqual(postJson.id)
      expect(action.id).toEqual(0)

      const query = { complete: true, OK: true, entities: [postJson.id] }
      store = setup(merge({}, stateMultipleEntities, { wordpress: { queries: { 0: query } } }))
    })

    it('should render post title', () => {
      rendered.setContext({ store })
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

      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreatePost)
      expect(action.contentType).toEqual('post')
      expect(action.identifier).toEqual(100)
      expect(action.id).toEqual(1)
    })
  })

  describe('with custom content type', () => {
    let store
    let props
    let rendered

    beforeAll(() => {
      store = setup(stateMultipleEntities)
      props = { params: { id: bookJson.id } }
      rendered = CustomType(props, store)
    })

    it('should dispatch RequestCreatePost', () => {
      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreatePost)
      expect(action.contentType).toEqual('book')
      expect(action.identifier).toEqual(bookJson.id)
      expect(action.id).toEqual(2)

      const query = { complete: true, OK: true, entities: [bookJson.id] }
      store = setup(merge({}, stateMultipleEntities, { wordpress: { queries: { 2: query } } }))
    })

    it('should render book title', () => {
      rendered.setContext({ store })
      expect(rendered.html()).toEqual('<div>Hello</div>')
    })
  })

  describe('with bad content type', () => {
    let store
    let props

    beforeAll(() => {
      store = setup(stateMultipleEntities)
      props = { params: { id: postJson.id } }
    })

    it('should throw "content type is not recognised" error', () => {
      expect(() => BadContentType(props, store)).toThrowError(/is not recognised/)
    })
  })
})
