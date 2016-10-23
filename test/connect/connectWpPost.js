/* global jest:false */

jest.disableAutomock()

import React from 'react'
import { mount } from 'enzyme'

import postJson from '../mocks/fixtures/wp-api-responses/post'
import bookJson from '../mocks/fixtures/wp-api-responses/book'
import stateMultipleEntities from '../mocks/states/multipleEntities'

import ActionTypes from '../../src/constants/ActionTypes'
import OperationTypes from '../../src/constants/OperationTypes'
import contentTypesManager from '../../src/util/contentTypesManager'

import _BuiltInType from '../mocks/components/BuiltInContentType'
import _CustomType from '../mocks/components/CustomContentType'
import _BadContentType from '../mocks/components/BadContentType'

const BuiltInType = (props, store) => mount(<_BuiltInType {...props} />, { context: { store } })
const CustomType = (props, store) => mount(<_CustomType {...props} />, { context: { store } })
const BadContentType = (props, store) => mount(<_BadContentType {...props} />, { context: { store } })

contentTypesManager.register({
  name: 'book',
  plural: 'books',
  slug: 'books'
})

function setup () {
  const dispatch = jest.fn()
  const subscribe = () => {}
  const getState = () => stateMultipleEntities
  return { dispatch, getState, subscribe }
}

describe('connectWpPost', () => {
  describe('with built-in content type', () => {
    const store = setup()
    const dispatch = store.dispatch
    const props = { params: { id: postJson.id } }
    const rendered = BuiltInType(props, store)

    it('should wrap the component', () => {
      expect(rendered.__kasia).toBe(true)
    })

    it('should dispatch REQUEST_CREATE', () => {
      const action = dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreate)
      expect(action.request).toEqual(OperationTypes.Post)
    })

    it('should render post title', () => {
      expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
    })

    it('should update to new entity with changed props', () => {
      const nextProps = { params: { id: postJson.id + 1 } }
      const rendered = BuiltInType(props, store).setProps(nextProps)
      expect(rendered.html()).toEqual('<div>new title</div>')
    })
  })

  describe('with custom content type', () => {
    const store = setup()
    const props = { params: { id: bookJson.id } }
    const rendered = CustomType(props, store)

    it('should dispatch REQUEST_CREATE', () => {
      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(ActionTypes.RequestCreate)
      expect(action.request).toEqual(OperationTypes.Post)
    })

    it('should render book title', () => {
      expect(rendered.html()).toEqual('<div>Hello</div>')
    })
  })

  describe('with bad content type', () => {
    const store = setup()
    const props = { params: { id: postJson.id } }

    it('should throw "content type is not recognised" error', () => {
      expect(() => BadContentType(props, store)).toThrowError(/is not recognised/)
    })
  })
})
