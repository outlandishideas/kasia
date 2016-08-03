/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

jest.mock('../../src/actions')

import React from 'react'
import modifyResponse from 'wp-api-response-modify'
import merge from 'lodash.merge'
import { mount } from 'enzyme'

import bookJson from '../fixtures/wp-api-responses/book'

import { createQueryRequest } from '../../src/actions'
import { Request, RequestTypes } from '../../src/constants/ActionTypes'

import CustomQuery from '../components/CustomQuery'

function setup () {
  const mockId = '0'

  const dispatch = jest.fn()
  const subscribe = jest.fn()

  const getState = jest.fn(() => ({
    wordpress: {
      queries: {},
      entities: {}
    }
  }))

  const store = {
    dispatch,
    getState,
    subscribe
  }

  const props = {
    store,
    params: {
      id: bookJson.id
    }
  }

  createQueryRequest.mockImplementation((options) => ({
    id: mockId,
    type: Request.Create,
    request: RequestTypes.Query,
    options
  }))

  return { mockId, store, props }
}

function mockState (store, props) {
  props.store = {
    ...store,
    getState: () => ({
      wordpress: {
        queries: {
          '1': { // Calling mount() for the 2nd time produces new ID
            complete: true,
            OK: true,
            entities: [bookJson.id]
          },
          '2': { // Changed nextProps causes dispatch + new ID
            complete: true,
            OK: true,
            entities: [bookJson.id + 1]
          }
        },
        entities: {
          books: {
            [String(bookJson.id)]: modifyResponse(bookJson),
            [String(bookJson.id + 1)]: merge({}, modifyResponse(bookJson), { slug: 'new-slug' })
          }
        }
      }
    })
  }
}

describe('connectWpQuery', () => {
  const { mockId, store, props } = setup()

  let rendered = mount(<CustomQuery {...props} testProp />)

  it('should wrap the component', () => {
    expect(CustomQuery.__kasia).toBe(true)
  })

  it('should pass props down', () => {
    expect(rendered.props().testProp).toBe(true)
  })

  it('should dispatch REQUEST_CREATE', () => {
    const dispatch = props.store.dispatch
    const action = dispatch.mock.calls[0][0]
    expect(action.id).toEqual(mockId)
    expect(action.type).toEqual(Request.Create)
    expect(action.request).toEqual(RequestTypes.Query)
  })

  it('should render with book slug', () => {
    mockState(store, props)
    // TODO why can't I call rendered#update here and avoid new ID + defining explicit state?
    rendered = mount(<CustomQuery {...props} testProp />)
    expect(rendered.html()).toEqual('<div>hello</div>')
  })

  it('should update to new entity with changed props', () => {
    const nextProps = merge({}, props, {
      params: {
        id: String(bookJson.id + 1)
      }
    })

    rendered.setProps(nextProps)
    rendered.update()

    expect(rendered.html()).toEqual('<div>new-slug</div>')
  })
})
