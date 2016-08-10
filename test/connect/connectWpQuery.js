/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

jest.mock('../../src/actions')
jest.mock('../../src/connect/idGen')

import React from 'react'
import modifyResponse from 'wp-api-response-modify'
import merge from 'lodash.merge'
import { mount } from 'enzyme'

import bookJson from '../fixtures/wp-api-responses/book'

import idGen from '../../src/connect/idGen'
import { createQueryRequest } from '../../src/actions'
import { Request, RequestTypes } from '../../src/constants/ActionTypes'

import CustomQuery from '../components/CustomQuery'
import CustomPropsComparator from '../components/CustomPropsComparator'

function setup (entityId) {
  const mockId = '0'

  const dispatch = jest.fn()
  const subscribe = jest.fn()

  const getState = jest.fn(() => ({
    wordpress: {
      queries: {
        [mockId]: {
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
    }
  }))

  const store = { dispatch, getState, subscribe }

  const props = { store, params: { id: entityId } }

  idGen.mockReturnValue(mockId)

  createQueryRequest.mockImplementation((options) => ({
    id: mockId,
    type: Request.Create,
    request: RequestTypes.Query,
    options
  }))

  return { mockId, store, props }
}

function expectRequestCreate (props, mockId, actionIndex = 0) {
  const dispatch = props.store.dispatch
  const action = dispatch.mock.calls[actionIndex][0]
  expect(action.id).toEqual(mockId)
  expect(action.type).toEqual(Request.Create)
  expect(action.request).toEqual(RequestTypes.Query)
}

describe('connectWpQuery', () => {
  describe('with primitive props', () => {
    const { mockId, props } = setup(bookJson.id)

    const rendered = mount(<CustomQuery {...props} testProp />)

    it('should wrap the component', () => {
      expect(CustomQuery.__kasia).toBe(true)
    })

    it('should pass props down', () => {
      expect(rendered.props().testProp).toBe(true)
    })

    it('should dispatch REQUEST_CREATE', () => {
      expectRequestCreate(props, mockId)
    })

    it('should render with book slug', () => {
      expect(rendered.html()).toContain('hello')
    })
  })

  describe('with non-primitive props', () => {
    const { store, mockId, props } = setup(bookJson.id)

    props.fn = () => {}

    const rendered = mount(<CustomQuery {...props} testProp />)

    it('should dispatch REQUEST_CREATE', () => {
      expectRequestCreate(props, mockId)
    })

    it('should not dispatch REQUEST_CREATE if function changes on props', () => {
      props.fn = () => {}
      rendered.setProps(props)
      expect(store.dispatch.mock.calls.length).toEqual(1)
    })
  })

  describe('with custom props comparator', () => {
    const { store, mockId, props } = setup(bookJson.id)

    props.fn = () => {}

    const rendered = mount(<CustomPropsComparator {...props} testProp />)

    it('should dispatch REQUEST_CREATE', () => {
      expectRequestCreate(props, mockId)
    })

    it('should not dispatch REQUEST_CREATE if function does not change on props', () => {
      rendered.update()
      expect(store.dispatch.mock.calls.length).toEqual(1)
    })

    // TODO test component updates according to the props comparator function (different `props.fn`)
  })
})
