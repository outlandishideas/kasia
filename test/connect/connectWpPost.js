/* global jest:false */

jest.disableAutomock()

import React from 'react'
import modifyResponse from 'wp-api-response-modify'
import merge from 'lodash.merge'
import { mount } from 'enzyme'

import postJson from '../fixtures/wp-api-responses/post'
import bookJson from '../fixtures/wp-api-responses/book'

import { Request, RequestTypes } from '../../src/constants/ActionTypes'
import { getContentType, registerContentType } from '../../src/contentTypes'
import { initialState } from '../../src/reducer'

import BuiltInContentType from '../components/BuiltInContentType'
import CustomContentType from '../components/CustomContentType'
import BadContentTypeComponent from '../components/BadContentType'

function setup () {
  const dispatch = jest.fn()

  const subscribe = () => {}

  const getState = () => ({
    wordpress: merge(initialState, {
      queries: {
        '0': { complete: true, OK: true, entities: [postJson.id] },
        '1': { complete: true, OK: true, entities: [postJson.id + 1] },
        '2': { complete: true, OK: true, entities: [bookJson.id] }
      },
      entities: {
        posts: {
          [String(postJson.id)]: modifyResponse(postJson),
          [String(postJson.id + 1)]: merge({}, modifyResponse(postJson), { title: 'new title' })
        },
        books: {
          [String(bookJson.id)]: modifyResponse(bookJson)
        }
      }
    })
  })

  const mockWP = {
    registerRoute: jest.fn()
  }

  if (!getContentType('book')) {
    registerContentType(mockWP, {
      name: 'book',
      plural: 'books',
      slug: 'books'
    })
  }

  return {
    dispatch,
    getState,
    subscribe
  }
}

function makeProps (id) {
  return { params: { id } }
}

describe('connectWpPost', () => {
  describe('with built-in content type', () => {
    const store = setup()
    const dispatch = store.dispatch
    const props = makeProps(postJson.id)
    const rendered = mount(<BuiltInContentType {...props} />, { context: { store } })

    it('should wrap the component', () => {
      expect(BuiltInContentType.__kasia).toBe(true)
    })

    it('should dispatch REQUEST_CREATE', () => {
      const action = dispatch.mock.calls[0][0]
      expect(action.type).toEqual(Request.Create)
      expect(action.request).toEqual(RequestTypes.Post)
    })

    it('should render post title', () => {
      expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
    })

    it('should update to new entity with changed props', () => {
      const nextProps = makeProps(postJson.id + 1)
      const rendered = mount(<BuiltInContentType {...props} />, { context: { store } })

      rendered.setProps(nextProps)

      expect(rendered.html()).toEqual('<div>new title</div>')
    })
  })

  describe('with custom content type', () => {
    const store = setup()
    const props = makeProps(bookJson.id)
    const rendered = mount(<CustomContentType {...props} />, { context: { store } })

    it('should dispatch REQUEST_CREATE', () => {
      const action = store.dispatch.mock.calls[0][0]
      expect(action.type).toEqual(Request.Create)
      expect(action.request).toEqual(RequestTypes.Post)
    })

    it('should render book title', () => {
      expect(rendered.html()).toEqual('<div>Hello</div>')
    })
  })

  describe('with bad content type', () => {
    const store = setup()
    const props = makeProps(postJson.id)

    it('should throw with bad content type', () => {
      expect(() => {
        mount(<BadContentTypeComponent {...props} />, { context: { store } })
      }).toThrowError(/is not recognised/)
    })
  })
})
