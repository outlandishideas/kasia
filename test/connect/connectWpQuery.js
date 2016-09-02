/* global jest:false */

jest.disableAutomock()

import React from 'react'
import modifyResponse from 'wp-api-response-modify'
import merge from 'lodash.merge'
import { mount } from 'enzyme'

import bookJson from '../fixtures/wp-api-responses/book'

import { Request, RequestTypes } from '../../src/constants/ActionTypes'
import { initialState } from '../../src/reducer'

import CustomQuery from '../components/CustomQuery'
import CustomPropsComparator from '../components/CustomPropsComparator'

function setup (entityId) {
  const dispatch = jest.fn()

  const subscribe = () => {}

  const getState = () => ({
    wordpress: merge(initialState, {
      queries: {
        0: {
          complete: true,
          OK: true,
          entities: [entityId]
        }
      },
      entities: {
        books: {
          [String(bookJson.id)]: modifyResponse(bookJson),
          [String(bookJson.id + 1)]: merge({},
            modifyResponse(bookJson),
            { id: bookJson.id + 1, slug: 'new-slug' })
        }
      }
    })
  })

  const store = {
    dispatch,
    getState,
    subscribe
  }

  const props = {
    store,
    params: { id: entityId }
  }

  return { store, props }
}

function expectRequestCreateAction (props, actionIndex = 0) {
  const dispatch = props.store.dispatch
  const action = dispatch.mock.calls[actionIndex][0]
  expect(action.type).toEqual(Request.Create)
  expect(action.request).toEqual(RequestTypes.Query)
}

describe('connectWpQuery', () => {
  describe('with primitive props', () => {
    const { props } = setup(bookJson.id)
    const rendered = mount(<CustomQuery {...props} />)

    it('should wrap the component', () => {
      expect(CustomQuery.__kasia).toBe(true)
    })

    it('should dispatch REQUEST_CREATE', () => {
      expectRequestCreateAction(props)
    })

    it('should render with book slug', () => {
      expect(rendered.html()).toContain('hello')
    })
  })

  describe('with non-primitive props', () => {
    const { store, props } = setup(bookJson.id)

    props.fn = () => {}

    const rendered = mount(<CustomQuery {...props} />)

    it('should dispatch REQUEST_CREATE', () => {
      expectRequestCreateAction(props)
    })

    it('should not dispatch REQUEST_CREATE if function changes on props', () => {
      props.fn = () => {}
      rendered.setProps(props)
      expect(store.dispatch.mock.calls.length).toEqual(1)
    })
  })

  describe('with custom props comparator', () => {
    const { store, props } = setup(bookJson.id)

    props.fn = () => {}

    const rendered = mount(<CustomPropsComparator {...props} />)

    it('should dispatch REQUEST_CREATE', () => {
      expectRequestCreateAction(props)
    })

    it('should not dispatch REQUEST_CREATE if function does not change on props', () => {
      rendered.update()
      expect(store.dispatch.mock.calls.length).toEqual(1)
    })

    // TODO test component updates according to the props comparator function (different `props.fn`)
  })
})
