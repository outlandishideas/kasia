/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import React from 'react'
import modifyResponse from 'wp-api-response-modify'
import merge from 'lodash.merge'
import { mount } from 'enzyme'

import postJson from '../fixtures/wp-api-responses/post'
import bookJson from '../fixtures/wp-api-responses/book'

import { Request, RequestTypes } from '../../src/constants/ActionTypes'
import { registerContentType } from '../../src/contentTypes'

import BuiltInContentType from '../components/BuiltInContentType'
import CustomContentType from '../components/CustomContentType'
import BadContentTypeComponent from '../components/BadContentType'

function setup () {
  const dispatch = jest.fn()
  const subscribe = jest.fn()

  const getState = jest.fn(() => ({
    wordpress: {
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
    }
  }))

  const store = {
    dispatch,
    getState,
    subscribe
  }

  registerContentType({
    name: 'book',
    plural: 'books',
    slug: 'books'
  })

  return { store }
}

function makeProps (store, id) {
  return {
    store,
    params: { id }
  }
}

describe('connectWpPost', () => {
  const { store } = setup()

  const dispatch = store.dispatch

  describe('with built-in content type', () => {
    let rendered

    it('should wrap the component', () => {
      const props = makeProps(store, postJson.id)
      rendered = mount(<BuiltInContentType {...props} testProp />)
      expect(BuiltInContentType.__kasia).toBe(true)
    })

    it('should pass props down', () => {
      expect(rendered.props().testProp).toBe(true)
    })

    it('should dispatch REQUEST_CREATE', () => {
      const action = dispatch.mock.calls[0][0]
      expect(action.id).toEqual('0')
      expect(action.type).toEqual(Request.Create)
      expect(action.request).toEqual(RequestTypes.Post)
    })

    it('should render post title', () => {
      expect(rendered.html()).toEqual('<div>Architecto enim omnis repellendus</div>')
    })

    it('should update to new entity with changed props', () => {
      const nextProps = makeProps(store, postJson.id + 1)

      rendered.setProps(nextProps)
      rendered.update()

      expect(rendered.html()).toEqual('<div>new title</div>')
    })
  })

  describe('with custom content type', () => {
    let rendered

    it('should dispatch REQUEST_CREATE', () => {
      const props = makeProps(store, bookJson.id)

      rendered = mount(<CustomContentType {...props} />)

      const action = dispatch.mock.calls[1][0]
      expect(action.id).toEqual('1')
      expect(action.type).toEqual(Request.Create)
      expect(action.request).toEqual(RequestTypes.Post)
    })

    it('should render book title', () => {
      expect(rendered.html()).toEqual('<div>Hello</div>')
    })
  })

  describe('with bad content type', () => {
    const props = makeProps(store, postJson.id)

    it('should throw with bad content type', () => {
      expect(() => {
        mount(<BadContentTypeComponent {...props} />)
      }).toThrowError(/is not recognised/)
    })
  })
})
