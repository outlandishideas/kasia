/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import React from 'react'
import { mount } from 'enzyme'

import postJson from '../fixtures/wp-api-responses/post'

import configureStore from '../util/configureStore'
import { ContentTypes } from '../../src/contentTypes'
import { REQUEST, REQUEST_TYPES } from '../../src/ActionTypes'

import BuiltInContentType from '../components/BuiltInContentType'
import CustomContentType from '../components/CustomContentType'
import BadContentTypeComponent from '../components/BadContentType'

const { store, interceptReducer } = configureStore({
  host: 'test',
  contentTypes: [{
    name: 'News',
    plural: 'News',
    slug: 'news'
  }]
})

const props = {
  store,
  params: {
    id: String(postJson.id)
  }
}

const reducerCalls = interceptReducer.mock.calls

let actionIndex = -1

function nextActionOfType (actionType) {
  for (const len = reducerCalls.length; actionIndex < len; actionIndex++) {
    // Second argument to a reducer is the action (first is the current state)
    const call = reducerCalls[actionIndex]
    const action = call && call[1]

    if (action && action.type === actionType) {
      actionIndex++
      return action
    }
  }

  return false
}

describe('Pepperoni connectWpPost', () => {
  describe('with built-in content type', () => {
    const rendered = mount(<BuiltInContentType {...props} testProp />)

    it('should wrap the component', () => {
      expect(BuiltInContentType.__pepperoni).toBe(true)
    })

    it('should pass props down', () => {
      expect(rendered.props().testProp).toBe(true)
    })

    it('should dispatch request create action', () => {
      const action = nextActionOfType(REQUEST.Create)
      expect(action).toBeTruthy()
      expect(action.requestType).toEqual(REQUEST_TYPES.Single)
      expect(action.options.contentType).toEqual(ContentTypes.Single)
      expect(typeof action.id).toEqual('string')
    })

    it('should receive the ')
  })

  describe('with custom content type', () => {
    mount(<CustomContentType {...props} />)

    it('should dispatch an action corresponding to given configuration', () => {
      const action = nextActionOfType(REQUEST.Create)
      expect(action).toBeTruthy()
      expect(action.options.contentType).toEqual('News')
    })
  })

  describe('with bad content type', () => {
    it('should throw error informing of failure to resolve content type', () => {
      expect(() => {
        mount(<BadContentTypeComponent {...props} />)
      }).toThrowError(/is not recognised/)
    })
  })
})
