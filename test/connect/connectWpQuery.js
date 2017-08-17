/* global jest:false, expect:false */

jest.disableAutomock()

import React from 'react'
import merge from 'lodash.merge'
import { mount } from 'enzyme'

import queryCounter from '../../src/util/query-counter'
import { wrapQueryFn } from '../../src/connect'
import { ActionTypes } from '../../src/constants'

import '../__mocks__/WP'
import initialState from '../__mocks__/states/initial'
import multipleBooks from '../__mocks__/states/multipleBooks'
import bookJson from '../__fixtures__/wp-api-responses/book'
import CustomQueryComponent, { target, queryFn } from '../__mocks__/components/CustomQuery'

const CustomQuery = (props, store) => mount(<CustomQueryComponent {...props} />, { context: { store } })

function setup (state) {
  const dispatch = jest.fn()
  const subscribe = () => {}
  const getState = () => state
  const store = { dispatch, getState, subscribe }
  return { store }
}

describe('connectWpQuery', () => {
  beforeEach(() => queryCounter.reset())

  it('should wrap the component', () => {
    // Components are wrapped first by react-redux connect()
    expect(CustomQueryComponent.WrappedComponent.WrappedComponent).toBe(target)
    expect(CustomQueryComponent.WrappedComponent.__kasia__).toBe(true)
  })

  it('should render loading message with bad query', () => {
    const query = { prepared: true }
    const state = merge({}, initialState('id'), { wordpress: { queries: { 0: query } } })
    const { store } = setup(state)
    const rendered = CustomQuery({ params: { id: 10 } }, store)
    expect(rendered.html()).toEqual('<div>Loading...</div>')
  })

  it('should render loading message with incomplete query', () => {
    const query = { id: 0, complete: false, OK: null, prepared: true }
    const state = merge({}, initialState('id'), { wordpress: { queries: { 0: query } } })
    const { store } = setup(state)
    const rendered = CustomQuery({ params: { id: 10 } }, store)
    expect(rendered.html()).toEqual('<div>Loading...</div>')
  })

  it('should render prepared post data with complete query', () => {
    const query = { prepared: true }
    const { store } = setup(merge({}, multipleBooks, { wordpress: { queries: { 0: query } } }))
    const rendered = CustomQuery({ params: { id: bookJson.id } }, store)
    expect(rendered.html()).toEqual(`<div>${bookJson.slug}</div>`)
  })

  it('should request data without query', () => {
    const { store } = setup(initialState('id'))
    CustomQuery({ params: { id: 10 } }, store)
    const action = store.dispatch.mock.calls[0][0]
    expect(action.id).toEqual(0)
    expect(action.type).toEqual(ActionTypes.RequestCreateQuery)
    expect(action.queryFn.toString()).toEqual(wrapQueryFn(queryFn).toString())
  })
})
