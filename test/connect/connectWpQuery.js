/* global jest:false */

jest.disableAutomock()

import React from 'react'
import { mount } from 'enzyme'

import bookJson from '../mocks/fixtures/wp-api-responses/book'

import stateMultipleBooks from '../mocks/states/multipleBooks'
import ActionTypes from '../../src/constants/ActionTypes'
import OperationTypes from '../../src/constants/OperationTypes'

import _CustomQuery from '../mocks/components/CustomQuery'
import _CustomPropsComparator from '../mocks/components/CustomPropsComparator'

const CustomQuery = (props, store) => mount(<_CustomQuery {...props} />, { context: { store } })
const CustomPropsComparator = (props, store) => mount(<_CustomPropsComparator {...props} />, { context: { store } })

function setup () {
  const dispatch = jest.fn()
  const subscribe = () => {}
  const getState = () => stateMultipleBooks
  const store = { dispatch, getState, subscribe }
  const props = { store, params: { id: bookJson.id } }
  return { store, props }
}

function expectRequestCreateAction (props) {
  const dispatch = props.store.dispatch
  const action = dispatch.mock.calls[0][0]
  expect(action.type).toEqual(ActionTypes.RequestCreate)
  expect(action.request).toEqual(OperationTypes.Query)
}

describe('connectWpQuery', () => {
  describe('with primitive props', () => {
    const { store, props } = setup(bookJson.id)
    const rendered = CustomQuery(props, store)

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

    const rendered = CustomQuery({
      ...props,
      fn: () => {}
    }, store)

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

    const rendered = CustomPropsComparator({
      ...props,
      fn: () => {}
    }, store)

    it('should dispatch REQUEST_CREATE', () => {
      expectRequestCreateAction(props)
    })

    it('should not dispatch REQUEST_CREATE if function does not change on props', () => {
      rendered.update()
      expect(store.dispatch.mock.calls.length).toEqual(1)
    })
  })
})
