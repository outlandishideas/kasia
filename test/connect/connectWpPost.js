/* global jest:false */

jest.disableAutomock()

import React from 'react'
import { mount } from 'enzyme'

import postJson from '../mocks/fixtures/wp-api-responses/post'
import bookJson from '../mocks/fixtures/wp-api-responses/book'
import state_multipleEntities from '../mocks/states/multipleEntities'
import wpapi from '../mocks/wpapi'

import ActionTypes from '../../src/constants/ActionTypes'
import OperationTypes from '../../src/constants/OperationTypes'
import contentTypes from '../../src/util/contentTypes'

import BuiltInContentType from '../mocks/components/BuiltInContentType'
import CustomContentType from '../mocks/components/CustomContentType'
import BadContentTypeComponent from '../mocks/components/BadContentType'

contentTypes.register(wpapi, {
  name: 'book',
  plural: 'books',
  slug: 'books'
})

function setup () {
  const dispatch = jest.fn()
  const subscribe = () => {}
  const getState = () => state_multipleEntities
  return { dispatch, getState, subscribe }
}

describe('connectWpPost', () => {
  describe('with built-in content type', () => {
    const store = setup()
    const dispatch = store.dispatch
    const props = { params: { id: postJson.id } }
    const rendered = mount(<BuiltInContentType {...props} />, { context: { store } })

    it('should wrap the component', () => {
      expect(BuiltInContentType.__kasia).toBe(true)
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
      const rendered = mount(<BuiltInContentType {...props} />, { context: { store } })

      rendered.setProps(nextProps)

      expect(rendered.html()).toEqual('<div>new title</div>')
    })
  })

  describe('with custom content type', () => {
    const store = setup()
    const props = { params: { id: bookJson.id } }
    const rendered = mount(<CustomContentType {...props} />, { context: { store } })

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

    it('should throw with bad content type', () => {
      expect(() => {
        mount(<BadContentTypeComponent {...props} />, { context: { store } })
      }).toThrowError(/is not recognised/)
    })
  })
})
